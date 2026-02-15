const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendanceByStudent,
    getAttendanceByCourse
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('faculty'), markAttendance);
router.get('/student/:studentId', protect, getAttendanceByStudent);
router.get('/course/:courseId', protect, authorize('faculty', 'admin'), getAttendanceByCourse);

module.exports = router;
