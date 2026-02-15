import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        credits: 3,
        semester: 1,
        department: 'Computer Science',
        courseType: 'Elective',
        faculty: '',
        seatCapacity: 60,
        description: ''
    });
    const [selectedCourseForStudents, setSelectedCourseForStudents] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [studentLoading, setStudentLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchFaculty();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/courses?status=Active');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchFaculty = async () => {
        try {
            const { data } = await API.get('/users?role=faculty');
            setFaculty(data);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCourse) {
                await API.put(`/courses/${editingCourse._id}`, formData);
            } else {
                await API.post('/courses', formData);
            }
            setShowForm(false);
            setEditingCourse(null);
            resetForm();
            fetchCourses();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving course');
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            courseCode: course.courseCode,
            courseName: course.courseName,
            credits: course.credits,
            semester: course.semester,
            department: course.department,
            courseType: course.courseType,
            faculty: course.faculty?._id || '',
            seatCapacity: course.seatCapacity,
            description: course.description || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to archive this course?')) return;

        try {
            await API.delete(`/courses/${courseId}`);
            fetchCourses();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting course');
        }
    };

    const handleViewStudents = async (course) => {
        setSelectedCourseForStudents(course);
        setStudentLoading(true);
        try {
            const { data } = await API.get(`/enrollments/course/${course._id}`);
            setEnrolledStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setStudentLoading(false);
        }
    };

    const toggleEligibility = async (enrollmentId, currentStatus) => {
        try {
            await API.put(`/enrollments/${enrollmentId}/eligibility`, { isEligible: !currentStatus });
            // Update local state
            setEnrolledStudents(enrolledStudents.map(e =>
                e._id === enrollmentId ? { ...e, isEligibleForExam: !currentStatus } : e
            ));
        } catch (error) {
            alert('Failed to update eligibility');
        }
    };

    const resetForm = () => {
        setFormData({
            courseCode: '',
            courseName: '',
            credits: 3,
            semester: 1,
            department: 'Computer Science',
            courseType: 'Elective',
            faculty: '',
            seatCapacity: 60,
            description: ''
        });
    };

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Course Management</h2>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingCourse(null);
                        resetForm();
                    }}
                    className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                    {showForm ? 'Cancel' : 'Add Course'}
                </button>
            </div>

            {showForm && (
                <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow">
                    <h3 className="mb-4 text-lg font-semibold">
                        {editingCourse ? 'Edit Course' : 'Add New Course'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Course Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.courseCode}
                                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Course Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.courseName}
                                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Credits</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="6"
                                    required
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.credits}
                                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Semester</label>
                                <select
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <select
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Mechanical">Mechanical</option>
                                    <option value="Civil">Civil</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Course Type</label>
                                <select
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.courseType}
                                    onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                                >
                                    <option value="Core">Core</option>
                                    <option value="Elective">Elective</option>
                                    <option value="Lab">Lab</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Faculty</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.faculty}
                                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                >
                                    <option value="">Select Faculty</option>
                                    {faculty.map(f => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Seat Capacity</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.seatCapacity}
                                    onChange={(e) => setFormData({ ...formData, seatCapacity: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                        >
                            {editingCourse ? 'Update Course' : 'Create Course'}
                        </button>
                    </form>
                </div>
            )}

            {/* Courses Table */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Credits</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Semester</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Faculty</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Seats</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course._id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{course.courseCode}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{course.courseName}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{course.credits}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{course.semester}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{course.faculty?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                    {course.seatsAvailable}/{course.seatCapacity}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    <button
                                        onClick={() => handleEdit(course)}
                                        className="mr-3 text-indigo-600 hover:text-indigo-900"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleViewStudents(course)}
                                        className="mr-3 text-green-600 hover:text-green-900"
                                    >
                                        Students
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Archive
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Students List for Selected Course */}
            {selectedCourseForStudents && (
                <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                            Enrolled Students: {selectedCourseForStudents.courseCode}
                        </h3>
                        <button
                            onClick={() => setSelectedCourseForStudents(null)}
                            className="text-gray-500 hover:text-gray-700 font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {studentLoading ? (
                        <div className="text-center py-4 text-gray-500">Loading students...</div>
                    ) : enrolledStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Attendance</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Exam Eligibility</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {enrolledStudents.map((enrollment) => (
                                        <tr key={enrollment._id}>
                                            <td className="px-4 py-3 text-sm text-gray-900">{enrollment.student.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{enrollment.student.email}</td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                {enrollment.attendancePercentage}% ({enrollment.classesAttended}/{enrollment.totalClasses})
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <button
                                                    onClick={() => toggleEligibility(enrollment._id, enrollment.isEligibleForExam)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${enrollment.isEligibleForExam
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {enrollment.isEligibleForExam ? 'Eligible' : 'Ineligible'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500 italic">No students enrolled in this course</div>
                    )}
                </div>
            )}
        </Layout>
    );
};

export default CourseManagement;
