const Grievance = require('../models/Grievance');
const User = require('../models/User');
const { triggerHighPriorityAlert } = require('../services/automationService');

// @desc    Create a new grievance
// @route   POST /api/grievances
// @access  Private (or Public for Anonymous if implemented that way, but effectively Private with optional user link)
const createGrievance = async (req, res) => {
    const { title, description, category, priority, isAnonymous, location } = req.body;

    try {
        let submittedBy = req.user ? req.user._id : null;

        // If anonymous, we might still want to track who sent it internally or just nullify it
        // The requirement says "Anonymous", so we should not link it to the user ID in the public view
        // But for this implementation, if isAnonymous is true, we simply don't save submittedBy or save it but treat it as hidden.
        // Let's go with not saving submittedBy if it's anonymous to ensure true anonymity, 
        // OR we rely on the frontend to not send the token.
        // However, the route is protected. So the user IS logged in. 
        // We will save submittedBy but the Schema has isAnonymous flag.
        // If isAnonymous is true, we should probably NOT save submittedBy to respect privacy, 
        // OR save it for admin audit but hide it from faculty.
        // Let's stick to: If isAnonymous is true, submittedBy is null.

        if (isAnonymous) {
            submittedBy = null;
        }

        const grievance = new Grievance({
            title,
            description,
            category,
            priority,
            isAnonymous,
            location,
            submittedBy,
            attachment: req.file ? req.file.path : undefined,
            history: [{
                action: 'Grievance Submitted',
                date: Date.now(),
                remarks: 'Initial Submission'
            }]
        });

        const createdGrievance = await grievance.save();

        // Trigger alert if high priority
        if (priority === 'High') {
            await triggerHighPriorityAlert(createdGrievance);
        }

        res.status(201).json(createdGrievance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all grievances (Admin) or specific to role
// @route   GET /api/grievances
// @access  Private
const getGrievances = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'student') {
            query.submittedBy = req.user._id;
        } else if (req.user.role === 'faculty') {
            // Faculty sees assigned grievances
            // OR grievances related to their department if we implement department-based routing
            // For now, sticking to assigned grievances as per previous flow + enhancement
            query.assignedTo = req.user._id;
        }
        // Admin sees all (query remains empty)

        // For advanced filtering (Admin), we can check req.query
        if (req.user.role === 'admin') {
            if (req.query.category) query.category = req.query.category;
            if (req.query.priority) query.priority = req.query.priority;
            if (req.query.status) query.status = req.query.status;
        }

        const grievances = await Grievance.find(query)
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name email department')
            .sort({ createdAt: -1 }); // Newest first

        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single grievance
// @route   GET /api/grievances/:id
// @access  Private
const getGrievanceById = async (req, res) => {
    try {
        const grievance = await Grievance.findById(req.params.id)
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name email department');

        if (!grievance) {
            return res.status(404).json({ message: 'Grievance not found' });
        }

        // Multi-user safety: Check access
        const isAdmin = req.user.role === 'admin';
        const isOwner = grievance.submittedBy?._id.toString() === req.user._id.toString();
        const isAssigned = grievance.assignedTo?._id.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner && !isAssigned) {
            return res.status(403).json({ message: 'Not authorized to view this grievance' });
        }

        res.json(grievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign grievance to faculty
// @route   PUT /api/grievances/:id/assign
// @access  Private (Admin)
const assignGrievance = async (req, res) => {
    const { facultyId } = req.body;

    try {
        const grievance = await Grievance.findById(req.params.id);

        if (grievance) {
            grievance.assignedTo = facultyId;
            grievance.status = 'Under Review';
            grievance.history.push({
                action: 'Assigned to Faculty',
                by: req.user._id,
                date: Date.now(),
                remarks: `Assigned to faculty ID: ${facultyId}`
            });

            const updatedGrievance = await grievance.save();
            res.json(updatedGrievance);
        } else {
            res.status(404).json({ message: 'Grievance not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update grievance status
// @route   PUT /api/grievances/:id/status
// @access  Private (Admin/Faculty)
const updateGrievanceStatus = async (req, res) => {
    const { status, remarks } = req.body;

    try {
        const grievance = await Grievance.findById(req.params.id);

        if (grievance) {
            // Check authorization
            if (req.user.role === 'admin' || (req.user.role === 'faculty' && grievance.assignedTo?.toString() === req.user._id.toString())) {
                grievance.status = status;

                grievance.history.push({
                    action: `Status Updated to ${status}`,
                    by: req.user._id,
                    date: Date.now(),
                    remarks: remarks || ''
                });

                const updatedGrievance = await grievance.save();
                res.json(updatedGrievance);
            } else {
                res.status(401).json({ message: 'Not authorized to update this grievance' });
            }
        } else {
            res.status(404).json({ message: 'Grievance not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGrievance,
    getGrievances,
    getGrievanceById,
    assignGrievance,
    updateGrievanceStatus,
};
