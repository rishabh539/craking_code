const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Withdrawn'],
        default: 'Pending'
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: {
        type: Date
    },
    // Academic Performance Tracking
    attendancePercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    internalMarks: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    assignmentsCompleted: {
        type: Number,
        default: 0
    },
    totalAssignments: {
        type: Number,
        default: 0
    },
    // Granular Attendance Tracking
    classesAttended: {
        type: Number,
        default: 0
    },
    classesAbsent: {
        type: Number,
        default: 0
    },
    totalClasses: {
        type: Number,
        default: 0
    },
    // Exam Eligibility
    isEligibleForExam: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
