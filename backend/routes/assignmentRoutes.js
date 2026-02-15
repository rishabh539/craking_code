const express = require('express');
const router = express.Router();
const {
    createAssignment,
    submitAssignment,
    gradeAssignment,
    getAssignmentsByCourse,
    getMySubmissions
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/assignmentUpload');

router.post('/', protect, authorize('faculty'), upload.single('assignmentFile'), createAssignment);
router.post('/:id/submit', protect, authorize('student'), upload.single('submissionFile'), submitAssignment);
router.put('/:assignmentId/grade/:submissionId', protect, authorize('faculty'), gradeAssignment);
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.get('/my-submissions', protect, authorize('student'), getMySubmissions);

module.exports = router;
