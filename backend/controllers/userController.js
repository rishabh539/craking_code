const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const AcademicResource = require('../models/AcademicResource');
const AdminLog = require('../models/AdminLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role && role !== 'All') {
            query.role = role.toLowerCase();
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ name: 1 });
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
        const [
            totalUsers,
            totalGrievances,
            pendingGrievances,
            resolvedGrievances,
            totalCourses,
            totalEnrollments,
            totalResources
        ] = await Promise.all([
            User.countDocuments(),
            Grievance.countDocuments(),
            Grievance.countDocuments({ status: 'Pending' }),
            Grievance.countDocuments({ status: 'Resolved' }),
            Course.countDocuments({ status: 'Active' }),
            Enrollment.countDocuments({ status: 'Approved' }),
            AcademicResource.countDocuments({ status: 'Approved' })
        ]);

        // Department-wise distribution
        const deptDistribution = await User.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        // Enrollment by Course Type (Core/Elective/Lab)
        const enrollmentByType = await Enrollment.aggregate([
            { $match: { status: 'Approved' } },
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseDetails'
                }
            },
            { $unwind: '$courseDetails' },
            { $group: { _id: '$courseDetails.courseType', count: { $sum: 1 } } }
        ]);

        res.json({
            totalUsers,
            totalGrievances,
            pendingGrievances,
            resolvedGrievances,
            totalCourses,
            totalEnrollments,
            totalResources,
            deptDistribution,
            enrollmentByType
        });
    } catch (error) {
        console.error('Error in getAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user status (Deactivate/Activate)
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot deactivate other admin accounts' });
        }

        user.isActive = !user.isActive;
        user.status = user.isActive ? 'Active' : 'Deactivated';
        await user.save();

        // Log the action
        await AdminLog.create({
            adminId: req.user._id,
            action: user.isActive ? 'Activate' : 'Deactivate',
            targetUserId: user._id,
            targetUserName: user.name,
            targetUserRole: user.role,
            details: `${user.isActive ? 'Activated' : 'Deactivated'} account: ${user.email}`
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Permanently delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const removeUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin accounts' });
        }

        // Cleanup related data if necessary (e.g., neutralize enrollment references)
        // Note: For now, we perform a hard delete of the user record.
        // References in other collections might still exist but won't point to a valid user.

        const userName = user.name;
        const userRole = user.role;
        const userEmail = user.email;

        await User.findByIdAndDelete(req.params.id);

        // Log the action
        await AdminLog.create({
            adminId: req.user._id,
            action: 'Permanent Delete',
            targetUserId: null, // User is gone
            targetUserName: userName,
            targetUserRole: userRole,
            details: `Permanently deleted account: ${userEmail}`
        });

        res.json({ message: 'User permanently removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getAnalytics,
    toggleUserStatus,
    removeUser
};
