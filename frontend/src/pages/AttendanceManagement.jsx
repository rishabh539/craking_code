import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaCheck, FaTimes, FaCalendarAlt, FaSave } from 'react-icons/fa';

const AttendanceManagement = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (courses.length > 0) {
            if (courseId) {
                const course = courses.find(c => c._id === courseId);
                if (course) {
                    setSelectedCourse(course);
                    fetchStudents(courseId);
                } else {
                    console.warn('Course not found in faculty list');
                    setSelectedCourse(null);
                    setEnrollments([]);
                    setLoading(false);
                }
            } else {
                setSelectedCourse(null);
                setEnrollments([]);
                setLoading(false);
            }
        } else if (!loading) {
            // Already finished fetching courses and it was empty
            setLoading(false);
        }
    }, [courseId, courses]);

    const fetchCourses = async () => {
        try {
            const { data } = await API.get(`/courses/faculty/${user._id}`);
            setCourses(data);
            // If no courseId in URL, we can stop loading here
            if (!courseId) setLoading(false);
            // If courseId exists but not in data, we handle it in the useEffect
        } catch (error) {
            console.error('Error fetching courses:', error);
            setLoading(false);
        }
    };

    const fetchStudents = async (cid) => {
        setLoading(true);
        try {
            const { data } = await API.get(`/enrollments/course/${cid}`);
            const approvedEnrollments = data.filter(e => e.status === 'Approved');
            setEnrollments(approvedEnrollments);

            // Initialize attendance as Present for all
            const initialAttendance = {};
            approvedEnrollments.forEach(e => {
                initialAttendance[e.student._id] = 'Present';
            });
            setAttendance(initialAttendance);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
            setLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        const id = e.target.value;
        if (id) {
            navigate(`/faculty/attendance/${id}`);
        } else {
            navigate('/faculty/attendance');
            setSelectedCourse(null);
            setEnrollments([]);
        }
    };

    const toggleAttendance = (studentId) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSubmit = async () => {
        if (!selectedCourse) return;
        setMarking(true);
        try {
            const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
                studentId: studentId,
                status: status,
                remarks: ''
            }));

            await API.post('/attendance', {
                courseId: selectedCourse._id,
                date,
                attendanceRecords
            });
            alert('Attendance marked successfully!');
        } catch (error) {
            console.error('Error marking attendance:', error);
            alert('Error marking attendance');
        } finally {
            setMarking(false);
        }
    };

    if (loading && courses.length === 0) {
        return <Layout><div className="p-8 text-center text-gray-500">Loading courses...</div></Layout>;
    }

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
                <p className="text-gray-600 text-sm">Select a course and mark daily attendance for students.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            onChange={handleCourseChange}
                            value={selectedCourse?._id || ''}
                        >
                            <option value="">Choose a course...</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.courseCode} - {course.courseName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {selectedCourse && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{selectedCourse.courseName}</h3>
                            <div className="flex gap-4 mt-1">
                                <p className="text-xs text-gray-500">Code: <span className="font-semibold text-indigo-600">{selectedCourse.courseCode}</span></p>
                                <p className="text-xs text-gray-500">Students: <span className="font-semibold">{enrollments.length}</span></p>
                                <p className="text-xs text-indigo-600 font-bold border-l pl-4">Total Sessions: {enrollments.length > 0 ? (enrollments[0].totalClasses || 0) : 0}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={marking || enrollments.length === 0}
                            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all font-semibold"
                        >
                            <FaSave /> {marking ? 'Saving...' : 'Submit Attendance'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500 italic">Updating student list...</div>
                    ) : enrollments.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {enrollments.map(e => (
                                    <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{e.student?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.student?.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => toggleAttendance(e.student._id)}
                                                className={`flex items-center gap-2 mx-auto px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${attendance[e.student._id] === 'Present'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                            >
                                                {attendance[e.student._id] === 'Present' ? (
                                                    <><FaCheck /> Present</>
                                                ) : (
                                                    <><FaTimes /> Absent</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-gray-500 italic">No approved enrollments found for this course.</div>
                    )}
                </div>
            )}
        </Layout>
    );
};

export default AttendanceManagement;
