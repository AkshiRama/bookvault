const express = require('express');
const router = express.Router();
const { getStats, getActivity } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/stats', requireAuth, getStats);
router.get('/activity', requireAuth, getActivity);

module.exports = router;
