const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin & Faculty)
const createAnnouncement = async (req, res) => {
    const { title, content, scope, courseId } = req.body;

    try {
        const announcement = new Announcement({
            title,
            content,
            postedBy: req.user._id,
            scope: scope || 'Institutional',
            course: scope === 'Course' ? courseId : undefined
        });

        const createdAnnouncement = await announcement.save();

        // Generate Notifications
        if (scope === 'Course' && courseId) {
            const enrollments = await Enrollment.find({ course: courseId, status: 'Approved' });
            const notifications = enrollments.map(e => ({
                recipient: e.student,
                title: `New Course Announcement: ${title}`,
                message: content.substring(0, 100),
                type: 'Announcement'
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        } else {
            // Institutional - notify all students (or all users)
            const students = await User.find({ role: 'student' });
            const notifications = students.map(s => ({
                recipient: s._id,
                title: `Institutional Announcement: ${title}`,
                message: content.substring(0, 100),
                type: 'Announcement'
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.status(201).json(createdAnnouncement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get relevant announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            const enrollments = await Enrollment.find({ student: req.user._id, status: 'Approved' });
            const courseIds = enrollments.map(e => e.course);
            query = {
                $or: [
                    { scope: 'Institutional' },
                    { scope: 'Course', course: { $in: courseIds } }
                ]
            };
        } else if (req.user.role === 'faculty') {
            query = {
                $or: [
                    { scope: 'Institutional' },
                    { postedBy: req.user._id }
                ]
            };
        }

        const announcements = await Announcement.find(query)
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name')
            .populate('course', 'courseCode courseName');

        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
};
