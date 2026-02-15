import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../services/api';

const AssignmentManagement = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
        maxMarks: 100
    });
    const [file, setFile] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCourseAndAssignments();
    }, [courseId]);

    const fetchCourseAndAssignments = async () => {
        try {
            const [courseRes, assignmentsRes] = await Promise.all([
                API.get(`/courses/${courseId}`),
                API.get(`/assignments/course/${courseId}`)
            ]);
            setCourse(courseRes.data);
            setAssignments(assignmentsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('courseId', courseId);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('deadline', formData.deadline);
            data.append('maxMarks', formData.maxMarks);
            if (file) {
                data.append('assignmentFile', file);
            }

            await API.post('/assignments', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Assignment created successfully!');
            setShowForm(false);
            setFormData({ title: '', description: '', deadline: '', maxMarks: 100 });
            setFile(null);
            fetchCourseAndAssignments();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error creating assignment');
        }
    };

    const handleGrade = async (assignmentId, submissionId, marks, feedback) => {
        try {
            await API.put(`/assignments/${assignmentId}/grade/${submissionId}`, {
                marks: parseInt(marks),
                feedback
            });
            setMessage('Assignment graded successfully!');
            fetchCourseAndAssignments();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error grading assignment');
        }
    };

    const getFileLink = (path) => {
        if (!path) return null;
        return `${API.defaults.baseURL.replace('/api', '')}${path}`;
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Assignment Management</h2>
                <p className="text-gray-600 font-medium">{course?.courseCode} - {course?.courseName}</p>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded-lg border shadow-sm flex items-center gap-2 ${message.includes('Error') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                    <span className="font-bold">{message.includes('Error') ? '⚠️' : '✅'}</span> {message}
                </div>
            )}

            <button
                onClick={() => {
                    setShowForm(!showForm);
                    setFile(null);
                }}
                className={`px-6 py-2.5 mb-6 text-white rounded-xl shadow-md transition-all font-bold ${showForm ? 'bg-gray-500 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
                {showForm ? 'Cancel Operation' : '+ Create New Assignment'}
            </button>

            {showForm && (
                <div className="p-8 mb-8 bg-white border border-gray-100 rounded-3xl shadow-xl">
                    <h3 className="mb-6 text-xl font-bold text-gray-800 border-b pb-4">New Assignment Call</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-tighter">Assignment Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. End Semester Viva Voce"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-tighter">Detailed Description</label>
                                    <textarea
                                        required
                                        placeholder="Outline the submission requirements..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-tighter">Deadline</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-tighter">Max Marks</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.maxMarks}
                                            onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-tighter">Reference PDF (Question Paper)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,image/*"
                                            className="hidden"
                                            id="assignmentFile"
                                            onChange={(e) => {
                                                const selectedFile = e.target.files[0];
                                                if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
                                                    alert('File size exceeds 20MB institutional limit');
                                                    return;
                                                }
                                                setFile(selectedFile);
                                            }}
                                        />
                                        <label
                                            htmlFor="assignmentFile"
                                            className={`w-full flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'}`}
                                        >
                                            {file ? (
                                                <span className="text-indigo-600 font-bold flex items-center gap-2 text-sm uppercase">📎 {file.name}</span>
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-gray-500">Click to upload Assignment Blueprint</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase">PDF, DOC, DOCX, or IMAGES accepted</p>
                                                    <p className="text-[10px] text-gray-400 font-black italic">MAX FILE SIZE 20MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-black text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-900 shadow-lg shadow-gray-200 transition-all"
                        >
                            Publish Assignment
                        </button>
                    </form>
                </div>
            )}

            {/* Assignments List */}
            <div className="grid gap-6">
                {assignments.map((assignment) => (
                    <div key={assignment._id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-8 border-b border-gray-50">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{assignment.title}</h3>
                                        {assignment.attachments?.length > 0 && (
                                            <a
                                                href={getFileLink(assignment.attachments[0])}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100"
                                            >
                                                📄 VIEW PDF
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-2xl">{assignment.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-4 py-1.5 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Target Marks</p>
                                        <p className="text-lg font-black text-indigo-900">{assignment.maxMarks}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase italic">
                                        Due {new Date(assignment.deadline).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">
                                        {assignment.submissions?.length || 0}
                                    </div>
                                    <span className="ml-4 text-xs font-black text-gray-400 uppercase tracking-widest">Submissions Locked In</span>
                                </div>

                                <button
                                    onClick={() => setSelectedAssignment(selectedAssignment === assignment._id ? null : assignment._id)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${selectedAssignment === assignment._id ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {selectedAssignment === assignment._id ? 'Close Drawer' : 'View Submissions'}
                                </button>
                            </div>
                        </div>

                        {selectedAssignment === assignment._id && (
                            <div className="p-8 bg-gray-50/50 rounded-b-3xl">
                                <h4 className="text-sm font-black text-gray-400 uppercase mb-6 tracking-widest">Scholar Submissions</h4>
                                {assignment.submissions?.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
                                        <p className="text-gray-400 font-bold italic tracking-tight">No academic filings recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden border border-gray-200 rounded-3xl bg-white">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Scholar Name</th>
                                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase">Timestamp</th>
                                                    <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase">Filing (PDF)</th>
                                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">Grading</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {assignment.submissions.map((submission) => (
                                                    <tr key={submission._id} className="hover:bg-indigo-50/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-black text-gray-900">{submission.student?.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">{submission.student?.email}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <p className="text-xs text-gray-500 font-bold">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                                                            <p className="text-[10px] text-gray-400">{new Date(submission.submittedAt).toLocaleTimeString()}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <a
                                                                href={getFileLink(submission.filePath)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 text-[10px] font-black"
                                                            >
                                                                📥 DOWNLOAD PDF
                                                            </a>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {submission.marks !== undefined ? (
                                                                <div>
                                                                    <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-xs font-black">
                                                                        {submission.marks} / {assignment.maxMarks}
                                                                    </div>
                                                                    {submission.feedback && (
                                                                        <p className="text-[10px] text-gray-500 mt-1 italic">"{submission.feedback}"</p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <GradeForm
                                                                    assignmentId={assignment._id}
                                                                    submissionId={submission._id}
                                                                    maxMarks={assignment.maxMarks}
                                                                    onGrade={handleGrade}
                                                                />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {assignments.length === 0 && (
                <div className="py-12 text-center text-gray-500 italic font-medium">
                    No assignments created yet for this course board.
                </div>
            )}
        </Layout>
    );
};

const GradeForm = ({ assignmentId, submissionId, maxMarks, onGrade }) => {
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onGrade(assignmentId, submissionId, marks, feedback);
        setMarks('');
        setFeedback('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <input
                type="number"
                placeholder="Marks"
                required
                min="0"
                max={maxMarks}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
            />
            <input
                type="text"
                placeholder="Feedback (optional)"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
            />
            <button
                type="submit"
                className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
            >
                Grade
            </button>
        </form>
    );
};

export default AssignmentManagement;
