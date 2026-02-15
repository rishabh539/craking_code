const express = require('express');
const router = express.Router();
const {
    createEvent,
    getMyCalendar,
    getAllEvents,
    updateEvent,
    deleteEvent
} = require('../controllers/calendarController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('faculty', 'admin'), createEvent);
router.get('/my', protect, authorize('student'), getMyCalendar);
router.get('/', protect, getAllEvents);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
