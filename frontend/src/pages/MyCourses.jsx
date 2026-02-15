import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../services/api';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const { data } = await API.get(`/courses/faculty/${user._id}`);

            // Fetch enrollment count for each course
            const coursesWithStats = await Promise.all(
                data.map(async (course) => {
                    const enrollments = await API.get(`/enrollments/course/${course._id}`);
                    return {
                        ...course,
                        enrolledCount: enrollments.data.length
                    };
                })
            );

            setCourses(coursesWithStats);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Layout><div className="text-center">Loading...</div></Layout>;
    }

    return (
        <Layout>
            <h2 className="mb-6 text-2xl font-bold">My Courses</h2>

            {courses.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                    No courses assigned yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div key={course._id} className="p-6 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
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

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Credits:</span>
                                    <span className="font-medium">{course.credits}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Semester:</span>
                                    <span className="font-medium">{course.semester}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Enrolled:</span>
                                    <span className="font-medium">{course.enrolledCount}/{course.seatCapacity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Department:</span>
                                    <span className="font-medium">{course.department}</span>
                                </div>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${(course.enrolledCount / course.seatCapacity) * 100}%` }}
                                ></div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                    onClick={() => navigate(`/faculty/attendance/${course._id}`)}
                                    className="px-3 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
                                >
                                    Attendance
                                </button>
                                <button
                                    onClick={() => navigate(`/faculty/assignments/${course._id}`)}
                                    className="px-3 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                                >
                                    Assignments
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default MyCourses;
