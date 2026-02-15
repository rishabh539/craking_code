const express = require('express');
const router = express.Router();
const SystemConfig = require('../models/SystemConfig');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get all system configs
// @route   GET /api/admin/config
// @access  Private (Admin only)
router.get('/config', protect, authorize('admin'), async (req, res) => {
    try {
        const configs = await SystemConfig.find({});
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a system config
// @route   PUT /api/admin/config/:key
// @access  Private (Admin only)
router.put('/config/:key', protect, authorize('admin'), async (req, res) => {
    try {
        const { value } = req.body;
        const config = await SystemConfig.findOneAndUpdate(
            { key: req.params.key },
            {
                value,
                lastUpdatedBy: req.user._id
            },
            { upsert: true, new: true }
        );
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
