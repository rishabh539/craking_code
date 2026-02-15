const mongoose = require('mongoose');

const calendarEventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    eventDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date // For multi-day events
    },
    eventType: {
        type: String,
        enum: ['Exam', 'Assignment', 'Holiday', 'Institutional', 'Class', 'Other'],
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        // Optional - only for course-specific events
    },
    visibility: {
        type: String,
        enum: ['All', 'Course-Specific', 'Department'],
        default: 'All'
    },
    department: {
        type: String,
        enum: ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'General', 'All'],
        default: 'All'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;
