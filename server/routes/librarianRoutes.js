const express = require('express');
const router = express.Router();
const {
  getLibrarians, createLibrarian, updateLibrarian, toggleLibrarianStatus, deleteLibrarian, resetLibrarianPassword
} = require('../controllers/librarianController');
const { requireAuth, requireRole } = require('../middleware/auth');

// STRICTLY ADMIN ONLY
router.use(requireAuth, requireRole('admin'));

router.get('/', getLibrarians);
router.post('/', createLibrarian);
router.put('/:id', updateLibrarian);
router.patch('/:id/status', toggleLibrarianStatus);
router.post('/:id/reset-password', resetLibrarianPassword);
router.delete('/:id', deleteLibrarian);

module.exports = router;
