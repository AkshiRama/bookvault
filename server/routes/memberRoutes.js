const express = require('express');
const router = express.Router();
const {
  getMembers, getMemberById, createMember, updateMember, deleteMember
} = require('../controllers/memberController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole('admin', 'librarian'), getMembers);
router.get('/:id', requireAuth, getMemberById); // Member controller verifies own ID if member role
router.post('/', requireAuth, requireRole('admin', 'librarian'), createMember);
router.put('/:id', requireAuth, requireRole('admin', 'librarian'), updateMember);
router.delete('/:id', requireAuth, requireRole('admin'), deleteMember);

module.exports = router;
