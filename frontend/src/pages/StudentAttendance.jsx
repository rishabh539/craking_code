import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const StudentAttendance = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const { data } = await API.get('/enrollments/my');
            // Show all enrollments but emphasize approved ones
            setEnrollments(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <Layout><div className="flex justify-center p-8 text-gray-500">Loading attendance data...</div></Layout>;
    }

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Attendance</h2>
                <p className="text-gray-600 text-sm">Course-wise attendance summary and exam eligibility.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Eligibility</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {enrollments.length > 0 ? (
                                enrollments.map((e, index) => (
                                    <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{e.course?.courseCode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.course?.courseName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-semibold">{e.classesAttended || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-semibold">{e.classesAbsent || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{e.totalClasses || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-sm font-bold ${parseFloat(e.attendancePercentage) < 75 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {e.attendancePercentage}%
                                                </span>
                                                <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                                                    <div
                                                        className={`h-1 rounded-full ${parseFloat(e.attendancePercentage) < 75 ? 'bg-red-500' : 'bg-green-600'}`}
                                                        style={{ width: `${Math.min(100, parseFloat(e.attendancePercentage))}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {e.status !== 'Approved' ? (
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter ${e.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                        e.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                                                            'bg-gray-50 text-gray-500 border border-gray-200'
                                                    }`}>
                                                    {e.status}
                                                </span>
                                            ) : e.isEligibleForExam !== false ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <FaCheckCircle className="text-emerald-500" /> Eligible
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-rose-50 text-rose-700 border border-rose-200">
                                                    <FaTimesCircle className="text-rose-500" /> Ineligible
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500 italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <FaInfoCircle className="text-gray-300 w-8 h-8" />
                                            <span>No approved course enrollments found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                    <FaInfoCircle /> Attendance Policy
                </h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                    A minimum of 75% attendance is required in each course to be automatically eligible for end-semester examinations.
                    Final eligibility is subject to clearance by the Academic Administration.
                </p>
            </div>
        </Layout>
    );
};

export default StudentAttendance;
