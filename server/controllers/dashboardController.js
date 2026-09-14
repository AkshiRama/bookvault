const Book = require('../models/Book');
const Member = require('../models/Member');
const User = require('../models/User');
const Borrowing = require('../models/Borrowing');

// @route   GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Books aggregated
    const bookAggregation = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalTitles: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalAvailable: { $sum: '$availableCopies' }
        }
      }
    ]);

    const totalTitles = bookAggregation[0]?.totalTitles || 0;
    const totalCopies = bookAggregation[0]?.totalQuantity || 0;
    const availableCopies = bookAggregation[0]?.totalAvailable || 0;
    const issuedCopies = Math.max(0, totalCopies - availableCopies);

    const totalMembers = await Member.countDocuments({ status: 'active' });
    const totalLibrarians = await User.countDocuments({ role: 'librarian', status: 'active' });

    // Overdue count
    const overdueCount = await Borrowing.countDocuments({
      status: { $in: ['Issued', 'Overdue'] },
      dueDate: { $lt: now }
    });

    // Books added this month
    const booksAddedThisMonth = await Book.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Today's counts
    const todayIssues = await Borrowing.countDocuments({
      issueDate: { $gte: startOfToday }
    });

    const todayReturns = await Borrowing.countDocuments({
      returnDate: { $gte: startOfToday }
    });

    // Activity Trends (Last 7 days and Last 30 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const borrowingActivity = await Borrowing.aggregate([
      { $match: { issueDate: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$issueDate' } },
          borrowed: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Categories Breakdown
    const categoriesBreakdown = await Book.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: '$quantity' }
        }
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // Availability distribution
    const availabilityData = [
      { name: 'Available', value: availableCopies },
      { name: 'Issued', value: issuedCopies },
      { name: 'Overdue', value: overdueCount }
    ];

    res.json({
      success: true,
      data: {
        totalBooks: totalTitles,
        totalCopies,
        availableBooks: availableCopies,
        issuedBooks: issuedCopies,
        totalMembers,
        totalLibrarians,
        overdueBooks: overdueCount,
        booksAddedThisMonth,
        todayIssues,
        todayReturns,
        borrowingActivity,
        categoriesBreakdown,
        availabilityData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/dashboard/activity
exports.getActivity = async (req, res, next) => {
  try {
    const recentBorrowings = await Borrowing.find()
      .populate('member', 'name')
      .populate('book', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const activities = recentBorrowings.map(b => {
      let type = 'borrow';
      let description = '';
      if (b.status === 'Returned') {
        type = 'return';
        description = (b.member?.name || 'Member') + ' returned "' + (b.book?.title || 'a book') + '"';
      } else if (new Date() > new Date(b.dueDate)) {
        type = 'overdue';
        description = '"' + (b.book?.title || 'Book') + '" borrowed by ' + (b.member?.name || 'Member') + ' became overdue';
      } else {
        type = 'borrow';
        description = (b.member?.name || 'Member') + ' borrowed "' + (b.book?.title || 'a book') + '"';
      }

      return {
        id: b._id,
        type,
        description,
        user: b.member?.name || 'Library Member',
        timestamp: b.returnDate || b.issueDate || b.createdAt
      };
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (err) {
    next(err);
  }
};
