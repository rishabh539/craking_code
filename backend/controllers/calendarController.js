const CalendarEvent = require('../models/CalendarEvent');
const Enrollment = require('../models/Enrollment');

// @desc    Create calendar event
// @route   POST /api/calendar
// @access  Private (Faculty/Admin)
const createEvent = async (req, res) => {
    try {
        const { title, description, eventDate, endDate, eventType, courseId, visibility, department } = req.body;

        const event = new CalendarEvent({
            title,
            description,
            eventDate: new Date(eventDate),
            endDate: endDate ? new Date(endDate) : null,
            eventType,
            course: courseId || null,
            visibility: visibility || 'All',
            department: department || 'All',
            createdBy: req.user._id
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get personalized calendar for student
// @route   GET /api/calendar/my
// @access  Private (Student)
const getMyCalendar = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Get enrolled courses
        const enrollments = await Enrollment.find({
            student: studentId,
            status: 'Approved'
        }).select('course');

        const courseIds = enrollments.map(e => e.course);

        // Get events: All institutional + course-specific for enrolled courses
        const events = await CalendarEvent.find({
            $or: [
                { visibility: 'All' },
                { visibility: 'Course-Specific', course: { $in: courseIds } },
                { visibility: 'Department', department: req.user.department }
            ]
        })
            .populate('course', 'courseName courseCode')
            .populate('createdBy', 'name')
            .sort({ eventDate: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all events
// @route   GET /api/calendar
// @access  Private
const getAllEvents = async (req, res) => {
    try {
        const { eventType, startDate, endDate } = req.query;

        let query = {};
        if (eventType) query.eventType = eventType;
        if (startDate && endDate) {
            query.eventDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const events = await CalendarEvent.find(query)
            .populate('course', 'courseName courseCode')
            .populate('createdBy', 'name')
            .sort({ eventDate: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/calendar/:id
// @access  Private (Creator/Admin)
const updateEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check authorization
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        event.title = req.body.title || event.title;
        event.description = req.body.description || event.description;
        event.eventDate = req.body.eventDate ? new Date(req.body.eventDate) : event.eventDate;
        event.endDate = req.body.endDate ? new Date(req.body.endDate) : event.endDate;
        event.eventType = req.body.eventType || event.eventType;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/calendar/:id
// @access  Private (Creator/Admin)
const deleteEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check authorization
        if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createEvent,
    getMyCalendar,
    getAllEvents,
    updateEvent,
    deleteEvent
};
