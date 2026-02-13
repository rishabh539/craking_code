const express = require('express');
const router = express.Router();
const {
    createGrievance,
    getAllGrievances,
    getMyGrievances,
    getAssignedGrievances,
    assignGrievance,
    updateGrievanceStatus,
} = require('../controllers/grievanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('student'), createGrievance)
    .get(protect, authorize('admin'), getAllGrievances);

router.get('/my', protect, authorize('student'), getMyGrievances);
router.get('/assigned', protect, authorize('faculty'), getAssignedGrievances);

router.put('/:id/assign', protect, authorize('admin'), assignGrievance);
router.put('/:id/status', protect, authorize('faculty', 'admin'), updateGrievanceStatus);

module.exports = router;
