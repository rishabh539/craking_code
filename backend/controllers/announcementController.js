const Announcement = require('../models/Announcement');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
const createAnnouncement = async (req, res) => {
    const { title, content } = req.body;

    try {
        const announcement = new Announcement({
            title,
            content,
            postedBy: req.user._id,
        });

        const createdAnnouncement = await announcement.save();
        res.status(201).json(createdAnnouncement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (All authenticated users)
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({}).sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAnnouncement,
    getAnnouncements,
};
