const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');

// @desc    Mark attendance (bulk)
// @route   POST /api/attendance
// @access  Private (Faculty)
const markAttendance = async (req, res) => {
    try {
        const { courseId, date, attendanceRecords } = req.body;

        // Multi-user safety: Verify faculty is assigned to this course
        const Course = require('../models/Course');
        const course = await Course.findOne({ _id: courseId, faculty: req.user._id });
        if (!course && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to mark attendance for this course' });
        }

        // Consistent Date Normalization: Use UTC midnight
        // input '2026-02-14' -> '2026-02-14T00:00:00.000Z'
        const attendanceDate = new Date(date);
        attendanceDate.setUTCHours(0, 0, 0, 0);

        const createdRecords = [];

        // 1. Process all attendance records first
        const attendanceOps = attendanceRecords.map(record => ({
            updateOne: {
                filter: {
                    student: record.studentId,
                    course: courseId,
                    date: attendanceDate
                },
                update: {
                    $set: {
                        status: record.status,
                        markedBy: req.user._id,
                        remarks: record.remarks || ''
                    }
                },
                upsert: true
            }
        }));

        if (attendanceOps.length > 0) {
            await Attendance.bulkWrite(attendanceOps);
        }

        // 2. Update stats for each student involved (aggregations)
        // We still do this per student but it's cleaner now
        const updatePromises = attendanceRecords.map(record =>
            updateAttendancePercentage(record.studentId, courseId)
        );
        await Promise.all(updatePromises);

        res.status(201).json({
            message: 'Attendance processed successfully',
            count: attendanceRecords.length
        });
    } catch (error) {
        console.error('Error in markAttendance:', error);
        res.status(400).json({ message: error.message });
    }
};

// Helper function to calculate and update attendance percentage
const updateAttendancePercentage = async (studentId, courseId) => {
    const stats = await Attendance.aggregate([
        { $match: { student: studentId, course: courseId } },
        {
            $group: {
                _id: null,
                totalClasses: { $sum: 1 },
                presentClasses: {
                    $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] }
                },
                absentClasses: {
                    $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] }
                }
            }
        }
    ]);

    const result = stats[0] || { totalClasses: 0, presentClasses: 0, absentClasses: 0 };
    const percentage = result.totalClasses > 0 ? (result.presentClasses / result.totalClasses) * 100 : 0;

    await Enrollment.findOneAndUpdate(
        { student: studentId, course: courseId },
        {
            attendancePercentage: Number(percentage.toFixed(2)),
            classesAttended: result.presentClasses,
            classesAbsent: result.absentClasses,
            totalClasses: result.totalClasses
        }
    );
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private (Student/Faculty/Admin)
const getAttendanceByStudent = async (req, res) => {
    try {
        const { courseId } = req.query;
        const studentId = req.params.studentId;

        // Multi-user safety: Students can only view their own attendance
        if (req.user.role === 'student' && studentId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view another student\'s attendance' });
        }

        let query = { student: studentId };
        if (courseId) query.course = courseId;

        const attendance = await Attendance.find(query)
            .populate('course', 'courseName courseCode')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Private (Faculty/Admin)
const getAttendanceByCourse = async (req, res) => {
    try {
        const { date } = req.query;
        const { courseId } = req.params;

        // Multi-user safety: Faculty must be assigned to this course
        if (req.user.role === 'faculty') {
            const Course = require('../models/Course');
            const course = await Course.findOne({ _id: courseId, faculty: req.user._id });
            if (!course) return res.status(403).json({ message: 'Not authorized for this course' });
        }

        let query = { course: courseId };
        if (date) query.date = new Date(date);

        const attendance = await Attendance.find(query)
            .populate('student', 'name email')
            .sort({ date: -1, 'student.name': 1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendanceByStudent,
    getAttendanceByCourse
};
