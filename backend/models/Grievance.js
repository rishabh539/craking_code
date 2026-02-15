const mongoose = require('mongoose');

const grievanceSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Academic', 'Hostel', 'Administrative', 'Technical', 'Campus Facilities', 'Other'],
        required: true,
        default: 'Other'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'In Progress', 'Resolved'],
        default: 'Pending',
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Not required if anonymous, but handled in controller
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    location: {
        type: String, // e.g., "Library", "Hostel Block A"
    },
    attachment: {
        type: String, // File path for uploaded documentation
    },
    history: [{
        action: String, // e.g., "Status Updated to In Progress"
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
        remarks: String
    }]
}, {
    timestamps: true,
});

const Grievance = mongoose.model('Grievance', grievanceSchema);

module.exports = Grievance;
