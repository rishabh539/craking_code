const express = require('express');
const router = express.Router();
const {
    applyForOpportunity,
    getMyApplications,
    getOpportunityApplications,
    updateApplicationStatus,
    addApplicationMessage
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Reusing the same 15MB upload middleware

router.route('/')
    .post(protect, authorize('student'), upload.single('resume'), applyForOpportunity)
    .get(protect, authorize('student'), getMyApplications);

router.get('/opportunity/:opportunityId', protect, authorize('faculty'), getOpportunityApplications);

router.put('/:id/status', protect, authorize('faculty'), updateApplicationStatus);
router.post('/:id/messages', protect, addApplicationMessage);

module.exports = router;
