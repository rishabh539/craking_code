const express = require('express');
const router = express.Router();
const {
    enrollInCourse,
    getMyEnrollments,
    getEnrolledStudents,
    approveEnrollment,
    withdrawEnrollment,
    toggleExamEligibility,
    getMyCreditDistribution,
    getAllCreditDistributions
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/distribution/my', protect, authorize('student'), getMyCreditDistribution);
router.get('/distribution/all', protect, authorize('admin'), getAllCreditDistributions);

router.post('/enroll', protect, authorize('student'), enrollInCourse);
router.get('/my', protect, authorize('student'), getMyEnrollments);
router.get('/course/:courseId', protect, authorize('faculty', 'admin'), getEnrolledStudents);
router.put('/:id/approve', protect, authorize('faculty', 'admin'), approveEnrollment);
router.delete('/:id', protect, authorize('student'), withdrawEnrollment);
router.put('/:id/eligibility', protect, authorize('admin'), toggleExamEligibility);

module.exports = router;
