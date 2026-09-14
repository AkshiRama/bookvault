const Borrowing = require('../models/Borrowing');
const Member = require('../models/Member');
const Settings = require('../models/Settings');

// Helper to resolve member record from req.user
const getMemberFromUser = async (user) => {
  let member = await Member.findOne({ user: user._id });
  if (!member) {
    member = await Member.findOne({ email: user.email });
  }
  return member;
};

// @route   GET /api/member/my-borrowings
exports.getMyBorrowings = async (req, res, next) => {
  try {
    const member = await getMemberFromUser(req.user);
    if (!member) {
      return res.status(404).json({ success: false, message: 'No associated member profile found' });
    }

    const borrowings = await Borrowing.find({
      member: member._id,
      status: { $in: ['Issued', 'Overdue'] }
    }).populate('book').sort({ dueDate: 1 });

    // Dynamic overdue calculation
    const now = new Date();
    const settings = await Settings.findOne() || { finePerDay: 10 };
    const fineRate = settings.finePerDay || 10;

    const enriched = borrowings.map(b => {
      const isOverdue = now > new Date(b.dueDate);
      let calculatedFine = 0;
      let daysOverdue = 0;
      if (isOverdue) {
        const diff = Math.ceil(Math.abs(now - new Date(b.dueDate)) / (1000 * 60 * 60 * 24));
        daysOverdue = diff;
        calculatedFine = diff * fineRate;
      }
      return {
        ...b.toObject(),
        isOverdue,
        daysOverdue,
        currentFine: calculatedFine
      };
    });

    res.json({
      success: true,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/member/my-history
exports.getMyHistory = async (req, res, next) => {
  try {
    const member = await getMemberFromUser(req.user);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const history = await Borrowing.find({
      member: member._id
    }).populate('book').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/member/my-fines
exports.getMyFines = async (req, res, next) => {
  try {
    const member = await getMemberFromUser(req.user);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const settings = await Settings.findOne() || { finePerDay: 10 };
    const fineRate = settings.finePerDay || 10;
    const now = new Date();

    // All records with non-zero fine or overdue
    const records = await Borrowing.find({
      member: member._id
    }).populate('book').sort({ dueDate: -1 });

    const fineItems = [];
    let totalOutstanding = 0;

    records.forEach(r => {
      let itemFine = r.fine || 0;
      let days = 0;
      let isUnpaidOverdue = false;

      if (!r.returnDate && now > new Date(r.dueDate)) {
        days = Math.ceil(Math.abs(now - new Date(r.dueDate)) / (1000 * 60 * 60 * 24));
        itemFine = days * fineRate;
        isUnpaidOverdue = true;
      } else if (r.returnDate && new Date(r.returnDate) > new Date(r.dueDate)) {
        days = Math.ceil(Math.abs(new Date(r.returnDate) - new Date(r.dueDate)) / (1000 * 60 * 60 * 24));
      }

      if (itemFine > 0) {
        totalOutstanding += itemFine;
        fineItems.push({
          borrowingId: r._id,
          book: r.book,
          issueDate: r.issueDate,
          dueDate: r.dueDate,
          returnDate: r.returnDate,
          daysOverdue: days,
          fine: itemFine,
          status: isUnpaidOverdue ? 'Pending' : 'Assessed'
        });
      }
    });

    res.json({
      success: true,
      data: {
        fines: fineItems,
        totalOutstandingFine: totalOutstanding
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/member/my-stats
exports.getMyStats = async (req, res, next) => {
  try {
    const member = await getMemberFromUser(req.user);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member profile not found' });
    }

    const now = new Date();
    const active = await Borrowing.find({
      member: member._id,
      status: { $in: ['Issued', 'Overdue'] }
    });

    const overdueCount = active.filter(b => now > new Date(b.dueDate)).length;
    
    // Due soon: within next 3 days
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);
    const dueSoonCount = active.filter(b => new Date(b.dueDate) >= now && new Date(b.dueDate) <= threeDaysLater).length;

    const totalRead = await Borrowing.countDocuments({
      member: member._id,
      status: 'Returned'
    });

    // Outstanding fines
    const settings = await Settings.findOne() || { finePerDay: 10 };
    let currentFine = 0;
    active.forEach(b => {
      if (now > new Date(b.dueDate)) {
        const days = Math.ceil(Math.abs(now - new Date(b.dueDate)) / (1000 * 60 * 60 * 24));
        currentFine += days * (settings.finePerDay || 10);
      }
    });

    res.json({
      success: true,
      data: {
        currentlyBorrowed: active.length,
        dueSoon: dueSoonCount,
        overdue: overdueCount,
        totalBorrowed: totalRead + active.length,
        currentFine
      }
    });
  } catch (err) {
    next(err);
  }
};
