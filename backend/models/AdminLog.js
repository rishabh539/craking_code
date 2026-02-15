const mongoose = require('mongoose');

const adminLogSchema = mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['Activate', 'Deactivate', 'Permanent Delete']
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Null if user is permanently deleted
    },
    targetUserName: {
        type: String,
        required: true
    },
    targetUserRole: {
        type: String,
        required: true
    },
    details: {
        type: String
    }
}, {
    timestamps: true
});

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;
