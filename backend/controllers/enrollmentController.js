const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const SystemConfig = require('../models/SystemConfig');

// Helper function to calculate total credits
const calculateTotalCredits = async (studentId) => {
    const enrollments = await Enrollment.find({
        student: studentId,
        status: { $in: ['Pending', 'Approved'] }
    }).populate('course');

    return enrollments.reduce((total, enrollment) => {
        return total + (enrollment.course.credits || 0);
    }, 0);
};

// @desc    Enroll in a course
// @route   POST /api/enrollments/enroll
// @access  Private (Student)
const enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const studentId = req.user._id;

        // Check if enrollment window is open
        const enrollmentConfig = await SystemConfig.findOne({ key: 'isEnrollmentOpen' });
        if (enrollmentConfig && enrollmentConfig.value === false) {
            return res.status(403).json({ message: 'Enrollment window is currently closed' });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if course is active
        if (course.status !== 'Active') {
            return res.status(400).json({ message: 'Course is not available for enrollment' });
        }

        // Check if seats are available
        if (course.seatsAvailable <= 0) {
            return res.status(400).json({ message: 'No seats available' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Check credit limit
        const currentCredits = await calculateTotalCredits(studentId);
        const student = await User.findById(studentId);

        if (currentCredits + course.credits > student.maxCredits) {
            return res.status(400).json({
                message: `Credit limit exceeded. Current: ${currentCredits}, Max: ${student.maxCredits}`
            });
        }

        // Create enrollment
        const enrollment = new Enrollment({
            student: studentId,
            course: courseId,
            status: 'Approved' // Auto-approve for now, can be changed to 'Pending'
        });

        const createdEnrollment = await enrollment.save();

        // Update seat availability
        course.seatsAvailable -= 1;
        await course.save();

        // Update student credits
        student.currentCredits = currentCredits + course.credits;
        await student.save();

        res.status(201).json(createdEnrollment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments/my
// @access  Private (Student)
const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate({
                path: 'course',
                populate: {
                    path: 'faculty',
                    select: 'name email department'
                }
            })
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get enrolled students for a course
// @route   GET /api/enrollments/course/:courseId
// @access  Private (Faculty/Admin)
const getEnrolledStudents = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Multi-user safety: Verify faculty is assigned to this course
        if (req.user.role === 'faculty') {
            const course = await Course.findOne({ _id: courseId, faculty: req.user._id });
            if (!course) return res.status(403).json({ message: 'Not authorized for this course' });
        }

        const enrollments = await Enrollment.find({
            course: courseId,
            status: { $in: ['Approved', 'Pending'] }
        })
            .populate('student', 'name email semester')
            .sort({ 'student.name': 1 });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve enrollment
// @route   PUT /api/enrollments/:id/approve
// @access  Private (Faculty/Admin)
const approveEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        enrollment.status = 'Approved';
        enrollment.approvedBy = req.user._id;
        enrollment.approvalDate = Date.now();

        const updatedEnrollment = await enrollment.save();
        res.json(updatedEnrollment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Withdraw from course
// @route   DELETE /api/enrollments/:id
// @access  Private (Student)
const withdrawEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id).populate('course');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        // Verify ownership
        if (enrollment.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        enrollment.status = 'Withdrawn';
        await enrollment.save();

        // Update seat availability
        const course = await Course.findById(enrollment.course._id);
        course.seatsAvailable += 1;
        await course.save();

        // Update student credits
        const student = await User.findById(enrollment.student);
        student.currentCredits -= enrollment.course.credits;
        await student.save();

        res.json({ message: 'Withdrawn from course successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update exam eligibility
// @route   PUT /api/enrollments/:id/eligibility
// @access  Private (Admin)
const toggleExamEligibility = async (req, res) => {
    try {
        const { isEligible } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        enrollment.isEligibleForExam = isEligible;
        const updatedEnrollment = await enrollment.save();

        res.json(updatedEnrollment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my credit distribution
// @route   GET /api/enrollments/distribution/my
// @access  Private (Student)
const getMyCreditDistribution = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user._id,
            status: 'Approved'
        }).populate('course');

        const distribution = {
            Core: 0,
            Elective: 0,
            Lab: 0
        };

        enrollments.forEach(e => {
            if (e.course) {
                const type = e.course.courseType || 'Elective';
                distribution[type] = (distribution[type] || 0) + (e.course.credits || 0);
            }
        });

        res.json(distribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students' credit distribution
// @route   GET /api/enrollments/distribution/all
// @access  Private (Admin)
const getAllCreditDistributions = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ status: 'Approved' }).populate('course');

        const distributions = {};

        enrollments.forEach(e => {
            const studentId = e.student.toString();
            if (!distributions[studentId]) {
                distributions[studentId] = { Core: 0, Elective: 0, Lab: 0 };
            }
            if (e.course) {
                const type = e.course.courseType || 'Elective';
                distributions[studentId][type] = (distributions[studentId][type] || 0) + (e.course.credits || 0);
            }
        });

        res.json(distributions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    enrollInCourse,
    getMyEnrollments,
    getEnrolledStudents,
    approveEnrollment,
    withdrawEnrollment,
    toggleExamEligibility,
    getMyCreditDistribution,
    getAllCreditDistributions
};
