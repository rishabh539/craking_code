import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../services/api';

const MyEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const { data } = await API.get('/enrollments/my');
            setEnrollments(data);
        } catch (error) {
            console.error('Error fetching enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (enrollmentId) => {
        if (!window.confirm('Are you sure you want to withdraw from this course?')) {
            return;
        }

        try {
            await API.delete(`/enrollments/${enrollmentId}`);
            fetchEnrollments();
        } catch (error) {
            alert(error.response?.data?.message || 'Error withdrawing from course');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Approved': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Rejected': 'bg-red-100 text-red-800',
            'Withdrawn': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getAttendanceColor = (percentage) => {
        if (percentage >= 75) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return <Layout><div className="text-center">Loading...</div></Layout>;
    }

    return (
        <Layout>
            <h2 className="mb-6 text-2xl font-bold">My Enrolled Courses</h2>

            {enrollments.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="mb-4 text-gray-500">You haven't enrolled in any courses yet.</p>
                    <button
                        onClick={() => navigate('/student/courses/enroll')}
                        className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                    >
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                        <div key={enrollment._id} className="p-6 bg-white border border-gray-200 rounded-lg shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {enrollment.course?.courseCode} - {enrollment.course?.courseName}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(enrollment.status)}`}>
                                            {enrollment.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Credits</p>
                                            <p className="text-lg font-semibold">{enrollment.course?.credits}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Attendance</p>
                                            <p className={`text-lg font-semibold ${getAttendanceColor(enrollment.attendancePercentage)}`}>
                                                {enrollment.attendancePercentage.toFixed(1)}%
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Internal Marks</p>
                                            <p className="text-lg font-semibold">{enrollment.internalMarks}/100</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Assignments</p>
                                            <p className="text-lg font-semibold">
                                                {enrollment.assignmentsCompleted}/{enrollment.totalAssignments}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-sm text-gray-600">
                                        <p><span className="font-medium">Faculty:</span> {enrollment.course?.faculty?.name}</p>
                                        <p><span className="font-medium">Department:</span> {enrollment.course?.department}</p>
                                        <p><span className="font-medium">Enrolled on:</span> {new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <button
                                        onClick={() => navigate(`/student/courses/${enrollment.course?._id}`)}
                                        className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                    >
                                        View Details
                                    </button>
                                    {enrollment.status === 'Approved' && (
                                        <button
                                            onClick={() => handleWithdraw(enrollment._id)}
                                            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                                        >
                                            Withdraw
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bars */}
                            <div className="mt-4 space-y-2">
                                <div>
                                    <div className="flex justify-between mb-1 text-xs">
                                        <span>Attendance Progress</span>
                                        <span>{enrollment.attendancePercentage.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${enrollment.attendancePercentage >= 75 ? 'bg-green-600' :
                                                    enrollment.attendancePercentage >= 60 ? 'bg-yellow-600' :
                                                        'bg-red-600'
                                                }`}
                                            style={{ width: `${enrollment.attendancePercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default MyEnrollments;
