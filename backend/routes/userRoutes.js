const express = require('express');
const router = express.Router();
const {
    getUsers,
    getAnalytics,
    toggleUserStatus,
    removeUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin'), getUsers);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.patch('/:id/status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), removeUser);

module.exports = router;
