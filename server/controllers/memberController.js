const Member = require('../models/Member');
const User = require('../models/User');
const Borrowing = require('../models/Borrowing');
const bcrypt = require('bcryptjs');

// @route   GET /api/members
exports.getMembers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { membershipId: searchRegex }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute active borrowings for each member in list
    const memberIds = members.map(m => m._id);
    const activeBorrowingsCounts = await Borrowing.aggregate([
      { $match: { member: { $in: memberIds }, status: { $in: ['Issued', 'Overdue'] } } },
      { $group: { _id: '$member', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    activeBorrowingsCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    const membersWithCounts = members.map(m => ({
      ...m.toObject(),
      activeBorrowingsCount: countMap[m._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: {
        members: membersWithCounts,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/members/:id
exports.getMemberById = async (req, res, next) => {
  try {
    // If member role, ensure member can only view their own record
    if (req.user.role === 'member') {
      const ownMember = await Member.findOne({ user: req.user._id });
      if (!ownMember || ownMember._id.toString() !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Access denied to other members details' });
      }
    }

    const member = await Member.findById(req.params.id).populate('user', 'email role status avatar');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Get active borrowings
    const activeBorrowings = await Borrowing.find({
      member: member._id,
      status: { $in: ['Issued', 'Overdue'] }
    }).populate('book');

    // Get past borrowing history
    const borrowingHistory = await Borrowing.find({
      member: member._id,
      status: 'Returned'
    }).populate('book').sort({ returnDate: -1 }).limit(20);

    // Calculate total fines
    const allBorrowings = await Borrowing.find({ member: member._id });
    const totalFines = allBorrowings.reduce((sum, b) => sum + (b.fine || 0), 0);
    const overdueCount = activeBorrowings.filter(b => new Date() > new Date(b.dueDate)).length;

    res.json({
      success: true,
      data: {
        member,
        activeBorrowings,
        borrowingHistory,
        stats: {
          activeCount: activeBorrowings.length,
          totalHistoryCount: borrowingHistory.length,
          overdueCount,
          totalFines
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/members
exports.createMember = async (req, res, next) => {
  try {
    const { name, email, phone, membershipId, password } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and phone' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness across members
    const existingMember = await Member.findOne({ email: normalizedEmail });
    if (existingMember) {
      return res.status(409).json({ success: false, message: 'A member with this email already exists' });
    }

    // Generate membershipId if not provided
    let finalMembershipId = membershipId ? membershipId.trim().toUpperCase() : 'MBR-' + Math.floor(100000 + Math.random() * 900000);

    const existingId = await Member.findOne({ membershipId: finalMembershipId });
    if (existingId) {
      return res.status(409).json({ success: false, message: 'Membership ID already exists. Please use a unique ID.' });
    }

    // Create user account for login if password provided or default
    let userAccount = await User.findOne({ email: normalizedEmail });
    if (!userAccount) {
      userAccount = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: password || 'Member@123',
        role: 'member',
        status: 'active'
      });
    }

    const member = await Member.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      membershipId: finalMembershipId,
      status: 'active',
      user: userAccount._id
    });

    res.status(201).json({
      success: true,
      data: member,
      message: 'Member registered successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/members/:id
exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const { name, email, phone, status } = req.body;

    if (email && email.toLowerCase().trim() !== member.email) {
      const existing = await Member.findOne({ email: email.toLowerCase().trim(), _id: { $ne: member._id } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email is already used by another member' });
      }
      member.email = email.toLowerCase().trim();
    }

    if (name) member.name = name.trim();
    if (phone) member.phone = phone.trim();
    if (status && (status === 'active' || status === 'inactive')) {
      member.status = status;
      // Sync user status
      if (member.user) {
        await User.findByIdAndUpdate(member.user, { status });
      }
    }

    await member.save();

    res.json({
      success: true,
      data: member,
      message: 'Member updated successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/members/:id (Admin only)
exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check for active borrowings
    const activeBorrowings = await Borrowing.countDocuments({
      member: member._id,
      status: { $in: ['Issued', 'Overdue'] }
    });

    if (activeBorrowings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete member: Member has ' + activeBorrowings + ' active borrowed book(s). Return books first.'
      });
    }

    // Delete user account if linked
    if (member.user) {
      await User.findByIdAndDelete(member.user);
    }

    // Delete member document
    await Member.findByIdAndDelete(member._id);

    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
