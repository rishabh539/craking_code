const AcademicResource = require('../models/AcademicResource');
const User = require('../models/User');

// @desc    Upload academic resource
// @route   POST /api/resources
// @access  Private (Faculty/Student)
const uploadResource = async (req, res) => {
    try {
        const {
            title,
            description,
            resourceType,
            subject,
            course,
            semester,
            department,
            year,
            tags
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Resource file (PDF) is required' });
        }

        const resource = new AcademicResource({
            title,
            description,
            resourceType,
            subject,
            course: course || null,
            semester,
            department,
            year,
            filePath: `/${req.file.path.replace(/\\/g, '/')}`,
            fileSize: req.file.size,
            fileType: 'application/pdf',
            uploadedBy: req.user._id,
            tags: tags || [],
            approvalStatus: req.user.role === 'admin' ? 'Approved' : 'Pending'
        });

        // Auto-approve if uploaded by admin
        if (req.user.role === 'admin') {
            resource.approvedBy = req.user._id;
            resource.approvalDate = Date.now();
        }

        const createdResource = await resource.save();
        res.status(201).json(createdResource);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all resources with filters
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
    try {
        const {
            resourceType,
            subject,
            semester,
            department,
            year,
            approvalStatus,
            uploadedBy
        } = req.query;

        let query = {};

        // Students and faculty see only approved resources (unless viewing own)
        if (req.user.role !== 'admin') {
            query.$or = [
                { approvalStatus: 'Approved' },
                { uploadedBy: req.user._id }
            ];

            // Multi-user safety: If filtering by user, must be self
            if (uploadedBy && uploadedBy !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to view another user\'s drafts' });
            }
        } else if (approvalStatus) {
            query.approvalStatus = approvalStatus;
        }

        if (resourceType) query.resourceType = resourceType;
        if (subject) query.subject = subject;
        if (semester) query.semester = parseInt(semester);
        if (department) query.department = department;
        if (year) query.year = parseInt(year);
        if (uploadedBy) query.uploadedBy = uploadedBy;

        const resources = await AcademicResource.find(query)
            .populate('uploadedBy', 'name email role')
            .populate('approvedBy', 'name')
            .populate('course', 'courseCode courseName')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResourceById = async (req, res) => {
    try {
        const resource = await AcademicResource.findById(req.params.id)
            .populate('uploadedBy', 'name email role')
            .populate('approvedBy', 'name')
            .populate('course', 'courseCode courseName');

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Multi-user safety: Check visibility
        if (req.user.role !== 'admin' &&
            resource.approvalStatus !== 'Approved' &&
            resource.uploadedBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Resource not yet approved or access restricted' });
        }

        // Increment view count
        resource.views += 1;
        await resource.save();

        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject resource
// @route   PUT /api/resources/:id/approve
// @access  Private (Admin)
const approveResource = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        const resource = await AcademicResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        resource.approvalStatus = status;
        resource.approvedBy = req.user._id;
        resource.approvalDate = Date.now();

        if (status === 'Rejected' && rejectionReason) {
            resource.rejectionReason = rejectionReason;
        }

        await resource.save();

        res.json({ message: `Resource ${status.toLowerCase()} successfully`, resource });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Bookmark/Unbookmark resource
// @route   POST /api/resources/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res) => {
    try {
        const resource = await AcademicResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const bookmarkIndex = resource.bookmarks.indexOf(req.user._id);

        if (bookmarkIndex > -1) {
            // Remove bookmark
            resource.bookmarks.splice(bookmarkIndex, 1);
            await resource.save();
            res.json({ message: 'Bookmark removed', bookmarked: false });
        } else {
            // Add bookmark
            resource.bookmarks.push(req.user._id);
            await resource.save();
            res.json({ message: 'Resource bookmarked', bookmarked: true });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my bookmarked resources
// @route   GET /api/resources/bookmarks/my
// @access  Private
const getMyBookmarks = async (req, res) => {
    try {
        const resources = await AcademicResource.find({
            bookmarks: req.user._id,
            approvalStatus: 'Approved'
        })
            .populate('uploadedBy', 'name email')
            .populate('course', 'courseCode courseName')
            .sort({ createdAt: -1 });

        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Increment download count
// @route   POST /api/resources/:id/download
// @access  Private
const incrementDownload = async (req, res) => {
    try {
        const resource = await AcademicResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        resource.downloads += 1;
        await resource.save();

        res.json({ message: 'Download tracked' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Owner/Admin)
const updateResource = async (req, res) => {
    try {
        const resource = await AcademicResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check authorization
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, subject, semester, department, tags } = req.body;

        resource.title = title || resource.title;
        resource.description = description || resource.description;
        resource.subject = subject || resource.subject;
        resource.semester = semester || resource.semester;
        resource.department = department || resource.department;
        resource.tags = tags || resource.tags;

        // Reset approval if modified by non-admin
        if (req.user.role !== 'admin') {
            resource.approvalStatus = 'Pending';
            resource.approvedBy = null;
            resource.approvalDate = null;
        }

        const updatedResource = await resource.save();
        res.json(updatedResource);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Owner/Admin)
const deleteResource = async (req, res) => {
    try {
        const resource = await AcademicResource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        // Check authorization
        if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await resource.deleteOne();
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadResource,
    getResources,
    getResourceById,
    approveResource,
    toggleBookmark,
    getMyBookmarks,
    incrementDownload,
    updateResource,
    deleteResource
};
