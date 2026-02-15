import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaBook, FaUser, FaBuilding, FaGraduationCap, FaCheckCircle, FaPercentage, FaMarker } from 'react-icons/fa';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null); // ID of assignment being submitted
    const [submissionFile, setSubmissionFile] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCourseAndEnrollment();
    }, [id]);

    const fetchCourseAndEnrollment = async () => {
        try {
            // Fetch course details
            const courseRes = await API.get(`/courses/${id}`);
            setCourse(courseRes.data);

            // Fetch my enrollments to find the specific progress for this course
            const enrollmentsRes = await API.get('/enrollments/my');
            const myEnrollment = enrollmentsRes.data.find(e => e.course?._id === id);
            setEnrollment(myEnrollment);

            // Fetch assignments for this course
            const assignmentsRes = await API.get(`/assignments/course/${id}`);
            setAssignments(assignmentsRes.data);

        } catch (error) {
            console.error('Error fetching course details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, assignmentId) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setSubmitting(assignmentId);
            const formData = new FormData();
            formData.append('submissionFile', file);

            await API.post(`/assignments/${assignmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Assignment submitted successfully!');
            fetchCourseAndEnrollment(); // Refresh data
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error submitting assignment');
        } finally {
            setSubmitting(null);
        }
    };

    const getFileLink = (path) => {
        if (!path) return null;
        return `${API.defaults.baseURL.replace('/api', '')}${path}`;
    };

    if (loading) {
        return <Layout><div className="flex justify-center items-center h-64"><p className="animate-pulse text-indigo-600 font-bold">Loading Course Intel...</p></div></Layout>;
    }

    if (!course) {
        return <Layout><div className="text-center py-12"><p className="text-gray-500">Course not found.</p></div></Layout>;
    }

    return (
        <Layout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button onClick={() => navigate(-1)} className="text-sm font-bold text-gray-500 hover:text-black mb-2 flex items-center gap-1">
                        ← Back to Enrollments
                    </button>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{course.courseCode}: {course.courseName}</h2>
                </div>
                <div className="text-right">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${course.courseType === 'Core' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                        course.courseType === 'Elective' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                        {course.courseType} Course
                    </span>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 font-bold ${message.includes('Error') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    {message.includes('Error') ? '⚠️' : '✅'} {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Progress Card (if enrolled) */}
                    {enrollment && (
                        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                                <FaCheckCircle className="text-emerald-400" /> Your Academic Standing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Attendance</p>
                                    <p className="text-3xl font-black text-emerald-400">{(enrollment.attendancePercentage || 0).toFixed(1)}%</p>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
                                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${enrollment.attendancePercentage}%` }}></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Internal Marks</p>
                                    <p className="text-3xl font-black text-indigo-400">{enrollment.internalMarks || 0}/100</p>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
                                        <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${enrollment.internalMarks}%` }}></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Assignments</p>
                                    <p className="text-3xl font-black text-amber-400">{enrollment.assignmentsCompleted || 0}<span className="text-sm font-medium text-gray-500">/{enrollment.totalAssignments || 0}</span></p>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
                                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(enrollment.assignmentsCompleted / enrollment.totalAssignments) * 100 || 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center capitalize">
                                <span className="text-xs font-bold text-gray-500 italic">Enrollment Status: {enrollment.status}</span>
                                {enrollment.status === 'Approved' && (
                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">Active Scholar</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Assignments List */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-black">A</span>
                            Course Assignments
                        </h3>
                        {assignments.length === 0 ? (
                            <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold italic tracking-tight">No active calls for assignments found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {assignments.map(asm => {
                                    const user_id = JSON.parse(sessionStorage.getItem('user'))._id;
                                    const submission = asm.submissions?.find(s => s.student === user_id || s.student?._id === user_id);

                                    return (
                                        <div key={asm._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-black text-gray-900 tracking-tight">{asm.title}</h4>
                                                        {asm.attachments?.length > 0 && (
                                                            <a
                                                                href={getFileLink(asm.attachments[0])}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 hover:bg-indigo-100"
                                                            >
                                                                📄 QUESTION PAPER
                                                            </a>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium mb-4">{asm.description}</p>
                                                    <div className="flex gap-4">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                                                            Due {new Date(asm.deadline).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                                            Weight: {asm.maxMarks} Marks
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    {submission ? (
                                                        <div className="space-y-2">
                                                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-[10px] font-black uppercase">
                                                                ✅ Submitted
                                                            </span>
                                                            {submission.marks !== undefined && (
                                                                <p className="text-sm font-black text-indigo-600">Grade: {submission.marks}/{asm.maxMarks}</p>
                                                            )}
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase italic mt-1">
                                                                Filed {new Date(submission.submittedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="application/pdf"
                                                                className="hidden"
                                                                id={`submit-${asm._id}`}
                                                                onChange={(e) => handleFileUpload(e, asm._id)}
                                                                disabled={submitting === asm._id}
                                                            />
                                                            <label
                                                                htmlFor={`submit-${asm._id}`}
                                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all ${submitting === asm._id ? 'bg-gray-100 text-gray-400 animate-pulse' : 'bg-black text-white hover:bg-indigo-600'}`}
                                                            >
                                                                {submitting === asm._id ? '📤 Filing...' : '📤 Submit PDF'}
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Description Card */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FaBook className="w-24 h-24" />
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FaBook className="text-indigo-600" /> Course Description
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            {course.description || "The syllabus and detailed objective for this course are managed by the department directorate. Please contact the faculty for a detailed printed copy."}
                        </p>
                    </div>

                    {/* Progress Card (if enrolled) */}
                    {enrollment && (
                        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                                <FaCheckCircle className="text-emerald-400" /> Your Academic Standing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Attendance</p>
                                    <p className="text-3xl font-black text-emerald-400">{enrollment.attendancePercentage.toFixed(1)}%</p>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
                                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${enrollment.attendancePercentage}%` }}></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Internal Marks</p>
                                    <p className="text-3xl font-black text-indigo-400">{enrollment.internalMarks}/100</p>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
                                        <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${enrollment.internalMarks}%` }}></div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Assignments</p>
                                    <p className="text-3xl font-black text-amber-400">{enrollment.assignmentsCompleted}<span className="text-sm font-medium text-gray-500">/{enrollment.totalAssignments}</span></p>
                                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3">
                                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(enrollment.assignmentsCompleted / enrollment.totalAssignments) * 100 || 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center capitalize">
                                <span className="text-xs font-bold text-gray-500 italic">Enrollment Status: {enrollment.status}</span>
                                {enrollment.status === 'Approved' && (
                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold">Active Scholar</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Faculty Card */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black uppercase text-gray-400 mb-4 tracking-tighter">Assigned Faculty</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                                {course.faculty?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{course.faculty?.name}</p>
                                <p className="text-xs text-gray-500">{course.faculty?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                        <h3 className="text-sm font-black uppercase text-gray-400 mb-4 tracking-tighter">Course Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><FaMarker className="text-indigo-400" /> Credits</span>
                                <span className="text-sm font-black">{course.credits}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><FaBuilding className="text-indigo-400" /> Department</span>
                                <span className="text-sm font-black">{course.department}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-500 flex items-center gap-2"><FaGraduationCap className="text-indigo-400" /> Semester</span>
                                <span className="text-sm font-black">{course.semester}</span>
                            </div>
                        </div>
                    </div>

                    {/* Prerequisites */}
                    {course.prerequisites?.length > 0 && (
                        <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                            <h3 className="text-xs font-black uppercase text-indigo-400 mb-3 tracking-tighter">Prerequisites</h3>
                            <div className="flex flex-wrap gap-2">
                                {course.prerequisites.map((p, idx) => (
                                    <span key={idx} className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 border border-indigo-100 shadow-sm">{p}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default CourseDetails;
