const Book = require('../models/Book');
const Member = require('../models/Member');
const Borrowing = require('../models/Borrowing');

// @route   GET /api/reports/popular-books
exports.getPopularBooks = async (req, res, next) => {
  try {
    const popular = await Borrowing.aggregate([
      { $group: { _id: '$book', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'bookDetails' } },
      { $unwind: '$bookDetails' },
      {
        $project: {
          _id: '$bookDetails._id',
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          category: '$bookDetails.category',
          isbn: '$bookDetails.isbn',
          borrowCount: '$count',
          availableCopies: '$bookDetails.availableCopies'
        }
      }
    ]);

    res.json({ success: true, data: popular });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/popular-members
exports.getPopularMembers = async (req, res, next) => {
  try {
    const active = await Borrowing.aggregate([
      { $group: { _id: '$member', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'members', localField: '_id', foreignField: '_id', as: 'memberDetails' } },
      { $unwind: '$memberDetails' },
      {
        $project: {
          _id: '$memberDetails._id',
          name: '$memberDetails.name',
          email: '$memberDetails.email',
          membershipId: '$memberDetails.membershipId',
          borrowCount: '$count'
        }
      }
    ]);

    res.json({ success: true, data: active });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/overdue
exports.getOverdueReport = async (req, res, next) => {
  try {
    const now = new Date();
    const overdueList = await Borrowing.find({
      status: { $in: ['Issued', 'Overdue'] },
      dueDate: { $lt: now }
    })
      .populate('member', 'name email membershipId phone')
      .populate('book', 'title author isbn category')
      .sort({ dueDate: 1 });

    const formatted = overdueList.map(b => {
      const days = Math.ceil(Math.abs(now - new Date(b.dueDate)) / (1000 * 60 * 60 * 24));
      return {
        _id: b._id,
        member: b.member,
        book: b.book,
        issueDate: b.issueDate,
        dueDate: b.dueDate,
        daysOverdue: days,
        fine: b.fine || (days * 10)
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/categories
exports.getCategoryReport = async (req, res, next) => {
  try {
    const categories = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          titles: { $sum: 1 },
          totalCopies: { $sum: '$quantity' },
          availableCopies: { $sum: '$availableCopies' }
        }
      },
      {
        $project: {
          category: '$_id',
          titles: 1,
          totalCopies: 1,
          availableCopies: 1,
          issuedCopies: { $subtract: ['$totalCopies', '$availableCopies'] },
          _id: 0
        }
      },
      { $sort: { totalCopies: -1 } }
    ]);

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/monthly
exports.getMonthlyStats = async (req, res, next) => {
  try {
    const monthlyStats = await Borrowing.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$issueDate' } },
          issued: { $sum: 1 },
          returned: {
            $sum: { $cond: [{ $ifNull: ['$returnDate', false] }, 1, 0] }
          },
          totalFines: { $sum: '$fine' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({ success: true, data: monthlyStats });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/reports/summary
exports.getSummary = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalMembers = await Member.countDocuments();
    const totalBorrowings = await Borrowing.countDocuments();
    const totalReturns = await Borrowing.countDocuments({ status: 'Returned' });
    const totalOverdue = await Borrowing.countDocuments({
      status: { $in: ['Issued', 'Overdue'] },
      dueDate: { $lt: new Date() }
    });

    const finesAgg = await Borrowing.aggregate([
      { $group: { _id: null, total: { $sum: '$fine' } } }
    ]);
    const totalFines = finesAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totalBooks,
        totalMembers,
        totalBorrowings,
        totalReturns,
        totalOverdue,
        totalFines
      }
    });
  } catch (err) {
    next(err);
  }
};
