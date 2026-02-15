import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const CourseEnrollment = () => {
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({
        department: '',
        semester: '',
        courseType: ''
    });
    const [currentCredits, setCurrentCredits] = useState(0);
    const [maxCredits, setMaxCredits] = useState(24);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchUserCredits();
    }, [filters]);

    const fetchCourses = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.department) params.append('department', filters.department);
            if (filters.semester) params.append('semester', filters.semester);
            if (filters.courseType) params.append('courseType', filters.courseType);

            const { data } = await API.get(`/courses?${params.toString()}`);
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchUserCredits = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const { data } = await API.get(`/enrollments/my`);

            const totalCredits = data
                .filter(e => e.status === 'Approved' || e.status === 'Pending')
                .reduce((sum, e) => sum + (e.course?.credits || 0), 0);

            setCurrentCredits(totalCredits);
            setMaxCredits(user.maxCredits || 24);
        } catch (error) {
            console.error('Error fetching credits:', error);
        }
    };

    const handleEnroll = async (courseId, credits) => {
        if (currentCredits + credits > maxCredits) {
            setMessage(`Cannot enroll: Credit limit exceeded (${currentCredits + credits}/${maxCredits})`);
            return;
        }

        setLoading(true);
        try {
            await API.post('/enrollments/enroll', { courseId });
            setMessage('Successfully enrolled in course!');
            setCurrentCredits(currentCredits + credits);
            fetchCourses();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error enrolling in course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Course Enrollment</h2>
                <div className="mt-2 p-4 bg-indigo-50 rounded">
                    <p className="text-lg font-semibold">
                        Credits: <span className="text-indigo-600">{currentCredits}</span> / {maxCredits}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${(currentCredits / maxCredits) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('Error') || message.includes('Cannot') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                        <option value="">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <select
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.semester}
                        onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                    >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Course Type</label>
                    <select
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.courseType}
                        onChange={(e) => setFilters({ ...filters, courseType: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                        <option value="Lab">Lab</option>
                    </select>
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <div key={course._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{course.courseCode}</h3>
                                <p className="text-sm text-gray-600">{course.courseName}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${course.courseType === 'Core' ? 'bg-blue-100 text-blue-800' :
                                course.courseType === 'Elective' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                }`}>
                                {course.courseType}
                            </span>
                        </div>

                        <div className="mt-3 space-y-1 text-sm">
                            <p><span className="font-medium">Credits:</span> {course.credits}</p>
                            <p><span className="font-medium">Semester:</span> {course.semester}</p>
                            <p><span className="font-medium">Faculty:</span> {course.faculty?.name}</p>
                            <p><span className="font-medium">Seats:</span> {course.seatsAvailable}/{course.seatCapacity}</p>
                        </div>

                        {course.description && (
                            <p className="mt-2 text-sm text-gray-600">{course.description}</p>
                        )}

                        <button
                            onClick={() => handleEnroll(course._id, course.credits)}
                            disabled={loading || course.seatsAvailable === 0}
                            className={`w-full px-4 py-2 mt-4 text-white rounded focus:outline-none ${course.seatsAvailable === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {course.seatsAvailable === 0 ? 'Full' : 'Enroll'}
                        </button>
                    </div>
                ))}
            </div>

            {courses.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                    No courses available with the selected filters.
                </div>
            )}
        </Layout>
    );
};

export default CourseEnrollment;
