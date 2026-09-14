const express = require('express');
const router = express.Router();
const {
  getBorrowings, issueBook, returnBook
} = require('../controllers/borrowingController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole('admin', 'librarian'), getBorrowings);
router.post('/issue', requireAuth, requireRole('admin', 'librarian'), issueBook);
router.put('/:id/return', requireAuth, requireRole('admin', 'librarian'), returnBook);

module.exports = router;
