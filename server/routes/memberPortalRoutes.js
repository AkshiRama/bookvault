const express = require('express');
const router = express.Router();
const {
  getMyBorrowings, getMyHistory, getMyFines, getMyStats
} = require('../controllers/memberPortalController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('member'));

router.get('/my-borrowings', getMyBorrowings);
router.get('/my-history', getMyHistory);
router.get('/my-fines', getMyFines);
router.get('/my-stats', getMyStats);

module.exports = router;
