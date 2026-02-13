const User = require('../models/User');
const Grievance = require('../models/Grievance');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system analytics
// @route   GET /api/users/analytics
// @access  Private (Admin only)
const getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalGrievances = await Grievance.countDocuments();
        const pendingGrievances = await Grievance.countDocuments({ status: 'Pending' });
        const resolvedGrievances = await Grievance.countDocuments({ status: 'Resolved' });

        res.json({
            totalUsers,
            totalGrievances,
            pendingGrievances,
            resolvedGrievances,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getAnalytics,
};
