const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');
const CalendarEvent = require('../models/CalendarEvent');
const Course = require('../models/Course');

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Faculty)
const createAssignment = async (req, res) => {
    try {
        const { courseId, title, description, deadline, maxMarks } = req.body;
        const attachments = [];

        if (req.file) {
            attachments.push(`/${req.file.path.replace(/\\/g, '/')}`);
        }

        const assignment = new Assignment({
            course: courseId,
            title,
            description,
            deadline: new Date(deadline),
            maxMarks,
            attachments,
            createdBy: req.user._id
        });

        const createdAssignment = await assignment.save();

        // Sync with Chronos Calendar
        try {
            const course = await Course.findById(courseId);
            await CalendarEvent.create({
                title: `Deadline: ${title}`,
                description: `Assignment deadline for ${course ? course.courseCode : 'Course'}`,
                eventDate: new Date(deadline),
                eventType: 'Assignment',
                course: courseId,
                visibility: 'Course-Specific',
                createdBy: req.user._id
            });
        } catch (calError) {
            console.error('Failed to sync assignment to calendar:', calError);
        }

        // Update total assignments count for all enrolled students
        await Enrollment.updateMany(
            { course: courseId, status: 'Approved' },
            { $inc: { totalAssignments: 1 } }
        );

        res.status(201).json(createdAssignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
const submitAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if deadline passed
        if (new Date() > assignment.deadline) {
            return res.status(400).json({ message: 'Deadline has passed' });
        }

        // Check if already submitted
        const existingSubmission = assignment.submissions.find(
            sub => sub.student.toString() === req.user._id.toString()
        );

        if (existingSubmission) {
            return res.status(400).json({ message: 'Already submitted' });
        }

        const filePath = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : req.body.filePath;

        assignment.submissions.push({
            student: req.user._id,
            filePath: filePath,
            submittedAt: Date.now()
        });

        await assignment.save();

        // Update assignments completed count
        await Enrollment.findOneAndUpdate(
            { student: req.user._id, course: assignment.course },
            { $inc: { assignmentsCompleted: 1 } }
        );

        res.json({ message: 'Assignment submitted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Grade assignment
// @route   PUT /api/assignments/:assignmentId/grade/:submissionId
// @access  Private (Faculty)
const gradeAssignment = async (req, res) => {
    try {
        const { marks, feedback } = req.body;
        const assignment = await Assignment.findById(req.params.assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = assignment.submissions.id(req.params.submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.marks = marks;
        submission.feedback = feedback;
        submission.gradedBy = req.user._id;
        submission.gradedAt = Date.now();

        await assignment.save();

        res.json({ message: 'Assignment graded successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get assignments by course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getAssignmentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Multi-user safety: Verify user has access to this course
        const isFaculty = req.user.role === 'faculty';
        const isAdmin = req.user.role === 'admin';

        if (!isAdmin) {
            if (isFaculty) {
                const course = await Course.findOne({ _id: courseId, faculty: req.user._id });
                if (!course) return res.status(403).json({ message: 'Not authorized for this course' });
            } else {
                const enrollment = await Enrollment.findOne({ course: courseId, student: req.user._id, status: 'Approved' });
                if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });
            }
        }

        const assignments = await Assignment.find({ course: courseId })
            .populate('createdBy', 'name')
            .sort({ deadline: -1 });

        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my submissions
// @route   GET /api/assignments/my-submissions
// @access  Private (Student)
const getMySubmissions = async (req, res) => {
    try {
        const assignments = await Assignment.find({
            'submissions.student': req.user._id
        }).populate('course', 'courseName courseCode');

        const mySubmissions = assignments.map(assignment => {
            const submission = assignment.submissions.find(
                sub => sub.student.toString() === req.user._id.toString()
            );
            return {
                assignment: {
                    _id: assignment._id,
                    title: assignment.title,
                    course: assignment.course,
                    deadline: assignment.deadline,
                    maxMarks: assignment.maxMarks
                },
                submission
            };
        });

        res.json(mySubmissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createAssignment,
    submitAssignment,
    gradeAssignment,
    getAssignmentsByCourse,
    getMySubmissions
};
