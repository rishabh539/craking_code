const express = require('express');
const router = express.Router();
const {
    createOpportunity,
    getOpportunities,
    getMyOpportunities,
    getOpportunityById,
    updateOpportunity
} = require('../controllers/opportunityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('faculty'), createOpportunity)
    .get(protect, getOpportunities);

router.get('/my', protect, authorize('faculty'), getMyOpportunities);

router.route('/:id')
    .get(protect, getOpportunityById)
    .put(protect, authorize('faculty'), updateOpportunity);

module.exports = router;
