const mongoose = require('mongoose');

const opportunitySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Internship', 'Research', 'Project', 'Other'],
        default: 'Internship'
    },
    requiredSkills: [{
        type: String
    }],
    duration: {
        type: String,
        required: true
    },
    stipend: {
        type: String, // Can be "Unpaid", "Competitive", or an amount
        default: 'Unpaid'
    },
    deadline: {
        type: Date,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    department: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'Closed', 'Filled'],
        default: 'Open'
    },
    location: {
        type: String,
        default: 'On-campus'
    }
}, {
    timestamps: true
});

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

module.exports = Opportunity;
