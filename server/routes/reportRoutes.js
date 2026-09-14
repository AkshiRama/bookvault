const express = require('express');
const router = express.Router();
const {
  getPopularBooks, getPopularMembers, getOverdueReport, getCategoryReport, getMonthlyStats, getSummary
} = require('../controllers/reportController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Reports strictly for Admin and Librarian
router.use(requireAuth, requireRole('admin', 'librarian'));

router.get('/popular-books', getPopularBooks);
router.get('/popular-members', getPopularMembers);
router.get('/overdue', getOverdueReport);
router.get('/categories', getCategoryReport);
router.get('/monthly', getMonthlyStats);
router.get('/summary', getSummary);

module.exports = router;
