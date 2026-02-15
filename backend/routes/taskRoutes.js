const express = require('express');
const router = express.Router();
const {
    createTask,
    getMyTasks,
    updateTask,
    deleteTask,
    getTaskAnalytics
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('student'), createTask)
    .get(protect, authorize('student'), getMyTasks);

router.get('/analytics', protect, authorize('student'), getTaskAnalytics);

router.route('/:id')
    .put(protect, authorize('student'), updateTask)
    .delete(protect, authorize('student'), deleteTask);

module.exports = router;
