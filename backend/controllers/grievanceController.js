const Grievance = require('../models/Grievance');

// @desc    Create a new grievance
// @route   POST /api/grievances
// @access  Private (Student only)
const createGrievance = async (req, res) => {
    const { title, description } = req.body;

    try {
        const grievance = new Grievance({
            title,
            description,
            submittedBy: req.user._id,
        });

        const createdGrievance = await grievance.save();
        res.status(201).json(createdGrievance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all grievances (for Admin)
// @route   GET /api/grievances
// @access  Private (Admin only)
const getAllGrievances = async (req, res) => {
    try {
        const grievances = await Grievance.find({})
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name email');
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user's grievances (Student)
// @route   GET /api/grievances/my
// @access  Private (Student only)
const getMyGrievances = async (req, res) => {
    try {
        const grievances = await Grievance.find({ submittedBy: req.user._id });
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assigned grievances (Faculty)
// @route   GET /api/grievances/assigned
// @access  Private (Faculty only)
const getAssignedGrievances = async (req, res) => {
    try {
        const grievances = await Grievance.find({ assignedTo: req.user._id })
            .populate('submittedBy', 'name email');
        res.json(grievances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign grievance to faculty
// @route   PUT /api/grievances/:id/assign
// @access  Private (Admin only)
const assignGrievance = async (req, res) => {
    const { facultyId } = req.body;

    try {
        const grievance = await Grievance.findById(req.params.id);

        if (grievance) {
            grievance.assignedTo = facultyId;
            grievance.status = 'Under Review';
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
// @access  Private (Faculty, Admin)
const updateGrievanceStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const grievance = await Grievance.findById(req.params.id);

        if (grievance) {
            // Check if user is authorized to update this grievance
            if (req.user.role === 'admin' || (req.user.role === 'faculty' && grievance.assignedTo.toString() === req.user._id.toString())) {
                grievance.status = status;
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
    getAllGrievances,
    getMyGrievances,
    getAssignedGrievances,
    assignGrievance,
    updateGrievanceStatus,
};
