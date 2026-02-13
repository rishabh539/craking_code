const express = require('express');
const router = express.Router();
const { uploadNote, getNotes } = require('../controllers/noteController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('faculty'), uploadNote)
    .get(protect, getNotes);

module.exports = router;
