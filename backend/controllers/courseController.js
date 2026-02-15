const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin only)
const createCourse = async (req, res) => {
    try {
        const { courseCode, courseName, credits, semester, department, courseType, faculty, seatCapacity, prerequisites, description } = req.body;

        // Verify faculty exists and is a faculty member
        const facultyUser = await User.findById(faculty);
        if (!facultyUser || facultyUser.role !== 'faculty') {
            return res.status(400).json({ message: 'Invalid faculty assignment' });
        }

        const course = new Course({
            courseCode,
            courseName,
            credits,
            semester,
            department,
            courseType,
            faculty,
            seatCapacity,
            seatsAvailable: seatCapacity,
            prerequisites: prerequisites || [],
            description
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all courses with filters
// @route   GET /api/courses
// @access  Private
const getAllCourses = async (req, res) => {
    try {
        const { department, semester, courseType, status } = req.query;

        let query = {};
        if (department) query.department = department;
        if (semester) query.semester = parseInt(semester);
        if (courseType) query.courseType = courseType;
        if (status) query.status = status;
        else query.status = 'Active'; // Default to active courses

        const courses = await Course.find(query)
            .populate('faculty', 'name email department')
            .sort({ semester: 1, courseCode: 1 });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('faculty', 'name email department');

        if (course) {
            res.json(course);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Update fields
            course.courseName = req.body.courseName || course.courseName;
            course.credits = req.body.credits || course.credits;
            course.semester = req.body.semester || course.semester;
            course.department = req.body.department || course.department;
            course.courseType = req.body.courseType || course.courseType;
            course.faculty = req.body.faculty || course.faculty;
            course.description = req.body.description || course.description;
            course.status = req.body.status || course.status;

            if (req.body.seatCapacity) {
                const diff = req.body.seatCapacity - course.seatCapacity;
                course.seatCapacity = req.body.seatCapacity;
                course.seatsAvailable += diff;
            }

            if (req.body.prerequisites) {
                course.prerequisites = req.body.prerequisites;
            }

            const updatedCourse = await course.save();
            res.json(updatedCourse);
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (course) {
            // Instead of deleting, archive it
            course.status = 'Archived';
            await course.save();
            res.json({ message: 'Course archived successfully' });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get courses by faculty
// @route   GET /api/courses/faculty/:facultyId
// @access  Private (Faculty)
const getCoursesByFaculty = async (req, res) => {
    try {
        // Multi-user safety: Ensure faculty only sees their own courses
        const facultyId = req.user.role === 'admin' ? req.params.facultyId : req.user._id;

        const courses = await Course.find({
            faculty: facultyId,
            status: 'Active'
        }).sort({ semester: 1, courseCode: 1 });

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get faculty dashboard summary
// @route   GET /api/courses/faculty/:facultyId/summary
// @access  Private (Faculty)
const getFacultySummary = async (req, res) => {
    try {
        // Multi-user safety: Ensure faculty only sees their own summary
        const facultyId = req.user.role === 'admin' ? req.params.facultyId : req.user._id;

        // 1. Get all courses taught by faculty
        const courses = await Course.find({ faculty: facultyId, status: 'Active' });
        const courseIds = courses.map(c => c._id);

        // 2. Count total students across all courses
        const studentCount = await Enrollment.countDocuments({
            course: { $in: courseIds },
            status: 'Approved'
        });

        // 3. Get pending assignments (deadlines in the future)
        const pendingAssignments = await Assignment.countDocuments({
            course: { $in: courseIds },
            dueDate: { $gte: new Date() }
        });

        // 4. Check if attendance marked today for any of the courses
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const attendanceMarkedToday = await Attendance.countDocuments({
            course: { $in: courseIds },
            date: today
        });

        res.json({
            courseCount: courses.length,
            studentCount,
            pendingAssignments,
            attendanceMarkedToday: attendanceMarkedToday > 0
        });
    } catch (error) {
        console.error('Error in getFacultySummary:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    getCoursesByFaculty,
    getFacultySummary
};
