const Opportunity = require('../models/Opportunity');

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private (Faculty)
const createOpportunity = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            requiredSkills,
            duration,
            stipend,
            deadline,
            location
        } = req.body;

        const opportunity = new Opportunity({
            title,
            description,
            category,
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()),
            duration,
            stipend,
            deadline,
            location,
            postedBy: req.user._id,
            department: req.user.department || 'General'
        });

        const createdOpportunity = await opportunity.save();
        res.status(201).json(createdOpportunity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all active opportunities
// @route   GET /api/opportunities
// @access  Private
const getOpportunities = async (req, res) => {
    try {
        const { category, department, search, stipend } = req.query;
        let query = { status: 'Open' };

        if (category) query.category = category;
        if (department) query.department = department;
        if (stipend === 'true') query.stipend = { $ne: 'Unpaid' };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { requiredSkills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const opportunities = await Opportunity.find(query)
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get faculty's posted opportunities
// @route   GET /api/opportunities/my
// @access  Private (Faculty)
const getMyOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({ postedBy: req.user._id })
            .sort({ createdAt: -1 });
        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Private
const getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id)
            .populate('postedBy', 'name email department');

        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        res.json(opportunity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (Faculty)
const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        // Verify ownership
        if (opportunity.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedOpportunity = await Opportunity.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedOpportunity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createOpportunity,
    getOpportunities,
    getMyOpportunities,
    getOpportunityById,
    updateOpportunity
};
