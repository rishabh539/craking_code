const express = require('express');
const router = express.Router();
const {
    createGrievance,
    getGrievances,
    getGrievanceById,
    assignGrievance,
    updateGrievanceStatus,
} = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, authorize('student', 'faculty'), upload.single('attachment'), createGrievance) // Faculty can also report issues now
    .get(protect, getGrievances); // Controller logic handles role-based filtering

router.route('/:id')
    .get(protect, getGrievanceById);

router.put('/:id/assign', protect, authorize('admin'), assignGrievance);
router.put('/:id/status', protect, authorize('faculty', 'admin'), updateGrievanceStatus);

module.exports = router;
