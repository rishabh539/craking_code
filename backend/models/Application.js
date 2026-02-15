const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: String, // File path
        required: true
    },
    portfolio: {
        type: String // Optional file path or URL
    },
    coverLetter: {
        type: String
    },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'],
        default: 'Submitted'
    },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Prevent duplicate applications
applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
