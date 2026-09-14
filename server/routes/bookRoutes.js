const express = require('express');
const router = express.Router();
const {
  getBooks, getBookById, createBook, updateBook, deleteBook
} = require('../controllers/bookController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public/Member can view books; Staff can create/update; Admin can delete
router.get('/', requireAuth, getBooks);
router.get('/:id', requireAuth, getBookById);
router.post('/', requireAuth, requireRole('admin', 'librarian'), createBook);
router.put('/:id', requireAuth, requireRole('admin', 'librarian'), updateBook);
router.delete('/:id', requireAuth, requireRole('admin'), deleteBook);

module.exports = router;
