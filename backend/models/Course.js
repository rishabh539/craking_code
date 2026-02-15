const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    courseName: {
        type: String,
        required: true,
    },
    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    department: {
        type: String,
        enum: ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'General'],
        required: true
    },
    courseType: {
        type: String,
        enum: ['Core', 'Elective', 'Lab'],
        default: 'Elective'
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seatCapacity: {
        type: Number,
        required: true,
        default: 60
    },
    seatsAvailable: {
        type: Number,
        required: true,
        default: 60
    },
    prerequisites: [{
        type: String, // Course codes
    }],
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Archived'],
        default: 'Active'
    },
    syllabus: {
        type: String, // File path or URL
    }
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
