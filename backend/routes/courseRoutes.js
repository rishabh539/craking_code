const express = require('express');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByFaculty,
    getFacultySummary
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('admin'), createCourse)
    .get(protect, getAllCourses);

router.route('/:id')
    .get(protect, getCourseById)
    .put(protect, authorize('admin'), updateCourse)
    .delete(protect, authorize('admin'), deleteCourse);

router.get('/faculty/:facultyId', protect, authorize('faculty', 'admin'), getCoursesByFaculty);
router.get('/faculty/:facultyId/summary', protect, authorize('faculty'), getFacultySummary);

module.exports = router;
