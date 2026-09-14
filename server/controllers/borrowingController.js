const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Settings = require('../models/Settings');

// Helper to get system settings or defaults
const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// Helper: update overdue statuses automatically
const updateOverdueRecords = async (settings) => {
  const now = new Date();
  const overdueUnmarked = await Borrowing.find({
    status: 'Issued',
    dueDate: { $lt: now },
    returnDate: null
  });

  const fineRate = settings.finePerDay || 10;

  for (const record of overdueUnmarked) {
    const diffTime = Math.abs(now - new Date(record.dueDate));
    const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    record.status = 'Overdue';
    record.fine = overdueDays * fineRate;
    await record.save();
  }
};

// @route   GET /api/borrowings
exports.getBorrowings = async (req, res, next) => {
  try {
    const settings = await getSettings();
    await updateOverdueRecords(settings);

    const { status, search, memberId, bookId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (memberId) {
      query.member = memberId;
    }

    if (bookId) {
      query.book = bookId;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let aggregatePipeline = [
      { $lookup: { from: 'members', localField: 'member', foreignField: '_id', as: 'memberData' } },
      { $unwind: '$memberData' },
      { $lookup: { from: 'books', localField: 'book', foreignField: '_id', as: 'bookData' } },
      { $unwind: '$bookData' }
    ];

    if (status && status !== 'all') {
      aggregatePipeline.push({ $match: { status } });
    }

    if (memberId) {
      const mongoose = require('mongoose');
      aggregatePipeline.push({ $match: { 'member': new mongoose.Types.ObjectId(memberId) } });
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      aggregatePipeline.push({
        $match: {
          $or: [
            { 'memberData.name': regex },
            { 'memberData.membershipId': regex },
            { 'bookData.title': regex },
            { 'bookData.isbn': regex }
          ]
        }
      });
    }

    const countPipeline = [...aggregatePipeline, { $count: 'total' }];
    const countResult = await Borrowing.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    aggregatePipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          issueDate: 1,
          dueDate: 1,
          returnDate: 1,
          status: 1,
          fine: 1,
          createdAt: 1,
          member: {
            _id: '$memberData._id',
            name: '$memberData.name',
            email: '$memberData.email',
            membershipId: '$memberData.membershipId',
            phone: '$memberData.phone'
          },
          book: {
            _id: '$bookData._id',
            title: '$bookData.title',
            author: '$bookData.author',
            isbn: '$bookData.isbn',
            coverUrl: '$bookData.coverUrl',
            category: '$bookData.category'
          }
        }
      }
    );

    const borrowings = await Borrowing.aggregate(aggregatePipeline);

    res.json({
      success: true,
      data: {
        borrowings,
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

// @route   POST /api/borrowings/issue
exports.issueBook = async (req, res, next) => {
  try {
    const { memberId, bookId, issueDate, dueDate } = req.body;

    if (!memberId || !bookId) {
      return res.status(400).json({ success: false, message: 'Please select both member and book' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    if (member.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Member is inactive. Cannot issue books to deactivated accounts.' });
    }

    const settings = await getSettings();

    // Check borrowing limit
    const activeBorrowingsCount = await Borrowing.countDocuments({
      member: member._id,
      status: { $in: ['Issued', 'Overdue'] }
    });

    if (activeBorrowingsCount >= settings.maxBooksPerMember) {
      return res.status(400).json({
        success: false,
        message: 'Member has already reached the maximum limit of ' + settings.maxBooksPerMember + ' borrowed books'
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No copies available for "' + book.title + '"'
      });
    }

    // Determine issue date and due date
    const finalIssueDate = issueDate ? new Date(issueDate) : new Date();
    let finalDueDate;
    if (dueDate) {
      finalDueDate = new Date(dueDate);
    } else {
      finalDueDate = new Date(finalIssueDate);
      finalDueDate.setDate(finalDueDate.getDate() + (settings.borrowingDuration || 14));
    }

    // Atomic decrement
    book.availableCopies -= 1;
    await book.save();

    const borrowing = await Borrowing.create({
      member: member._id,
      book: book._id,
      issueDate: finalIssueDate,
      dueDate: finalDueDate,
      status: 'Issued',
      fine: 0
    });

    const populated = await Borrowing.findById(borrowing._id)
      .populate('member', 'name email membershipId')
      .populate('book', 'title author isbn coverUrl');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Book "' + book.title + '" successfully issued to ' + member.name
    });
  } catch (err) {
    next(err);
  }
};

// @route   PUT /api/borrowings/:id/return
exports.returnBook = async (req, res, next) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id)
      .populate('book')
      .populate('member');

    if (!borrowing) {
      return res.status(404).json({ success: false, message: 'Borrowing transaction not found' });
    }

    if (borrowing.status === 'Returned' && borrowing.returnDate) {
      return res.status(400).json({ success: false, message: 'This book has already been marked as returned' });
    }

    const returnDate = req.body.returnDate ? new Date(req.body.returnDate) : new Date();
    const settings = await getSettings();

    // Calculate overdue days & fine
    let overdueDays = 0;
    let fine = 0;
    const dueDate = new Date(borrowing.dueDate);

    if (returnDate > dueDate) {
      const diffTime = returnDate.getTime() - dueDate.getTime();
      overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = overdueDays * (settings.finePerDay || 10);
    }

    borrowing.returnDate = returnDate;
    borrowing.status = 'Returned';
    borrowing.fine = fine;
    await borrowing.save();

    // Atomic increment available copies
    const book = await Book.findById(borrowing.book._id || borrowing.book);
    if (book) {
      book.availableCopies = Math.min(book.quantity, book.availableCopies + 1);
      await book.save();
    }

    res.json({
      success: true,
      data: {
        borrowing,
        overdueDays,
        fine
      },
      message: fine > 0
        ? 'Book returned. Overdue by ' + overdueDays + ' day(s). Fine calculated: ₹' + fine
        : 'Book returned successfully with zero fine'
    });
  } catch (err) {
    next(err);
  }
};
