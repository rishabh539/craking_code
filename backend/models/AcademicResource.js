const mongoose = require('mongoose');

const academicResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        enum: ['Notes', 'Previous Papers', 'Reference Material', 'Assignment', 'Syllabus', 'Other'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: Number
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    fileType: {
        type: String
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downloads: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient searching
academicResourceSchema.index({ subject: 1, semester: 1, department: 1 });
academicResourceSchema.index({ resourceType: 1, approvalStatus: 1 });
academicResourceSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('AcademicResource', academicResourceSchema);
