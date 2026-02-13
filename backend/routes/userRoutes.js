const express = require('express');
const router = express.Router();
const { getUsers, getAnalytics } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/analytics', protect, authorize('admin'), getAnalytics);

module.exports = router;
