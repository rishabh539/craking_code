const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');

// @desc    Apply for an opportunity
// @route   POST /api/applications
// @access  Private (Student)
const applyForOpportunity = async (req, res) => {
    try {
        const { opportunityId, coverLetter, portfolio } = req.body;

        // Manual file check since we use upload middleware
        if (!req.file) {
            return res.status(400).json({ message: 'Resume is required' });
        }

        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        if (opportunity.status !== 'Open') {
            return res.status(400).json({ message: 'Opportunity is no longer open' });
        }

        const existingApplication = await Application.findOne({
            opportunity: opportunityId,
            student: req.user._id
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'Already applied for this opportunity' });
        }

        const application = new Application({
            opportunity: opportunityId,
            student: req.user._id,
            resume: req.file.path,
            portfolio,
            coverLetter
        });

        const createdApplication = await application.save();
        res.status(201).json(createdApplication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user._id })
            .populate({
                path: 'opportunity',
                populate: { path: 'postedBy', select: 'name email' }
            })
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get applications for a faculty's opportunity
// @route   GET /api/applications/opportunity/:opportunityId
// @access  Private (Faculty)
const getOpportunityApplications = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.opportunityId);

        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        if (opportunity.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const applications = await Application.find({ opportunity: req.params.opportunityId })
            .populate('student', 'name email department semester')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Faculty)
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id).populate('opportunity');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.opportunity.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        application.status = status;
        const updatedApplication = await application.save();
        res.json(updatedApplication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add message to application
// @route   POST /api/applications/:id/messages
// @access  Private
const addApplicationMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const application = await Application.findById(req.params.id).populate('opportunity');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Only applicant or opportunity owner can message
        const isStudent = application.student.toString() === req.user._id.toString();
        const isFaculty = application.opportunity.postedBy.toString() === req.user._id.toString();

        if (!isStudent && !isFaculty) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        application.messages.push({
            sender: req.user._id,
            content
        });

        await application.save();
        res.status(201).json(application.messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    applyForOpportunity,
    getMyApplications,
    getOpportunityApplications,
    updateApplicationStatus,
    addApplicationMessage
};
