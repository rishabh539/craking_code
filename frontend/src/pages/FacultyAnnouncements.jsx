import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaBullhorn, FaPaperPlane, FaHistory } from 'react-icons/fa';

const FacultyAnnouncements = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [myAnnouncements, setMyAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [coursesRes, announcementsRes] = await Promise.all([
                API.get(`/courses/faculty/${user._id}`),
                API.get('/announcements')
            ]);
            setCourses(coursesRes.data);
            setMyAnnouncements(announcementsRes.data.filter(a => a.postedBy._id === user._id));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }
        setPosting(true);
        try {
            await API.post('/announcements', {
                title,
                content,
                scope: 'Course',
                courseId: selectedCourse
            });
            setTitle('');
            setContent('');
            setSelectedCourse('');
            fetchInitialData();
            alert('Announcement posted successfully!');
        } catch (error) {
            console.error('Error posting announcement:', error);
            alert('Error posting announcement');
        } finally {
            setPosting(false);
        }
    };

    if (loading) return <Layout><div className="p-8 text-center text-gray-500">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaBullhorn className="text-indigo-600" /> Course Announcements
                </h2>
                <p className="text-gray-600 text-sm">Post updates and notifications specifically for your enrolled students.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Post Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <FaPaperPlane className="text-sm text-indigo-500" /> New Broadcast
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Assignment Due Date"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea
                                    required
                                    placeholder="Detailed message for students..."
                                    rows="4"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={posting}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all font-semibold flex justify-center items-center gap-2"
                            >
                                {posting ? 'Posting...' : 'Send to Students'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <FaHistory className="text-sm text-indigo-500" /> Recent Posts
                        </h3>
                        <div className="space-y-4">
                            {myAnnouncements.length > 0 ? (
                                myAnnouncements.map((a) => (
                                    <div key={a._id} className="p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{a.title}</h4>
                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {a.course?.courseCode || 'General'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{a.content}</p>
                                        <div className="flex justify-between text-[11px] text-gray-400">
                                            <span>Posted for: {a.course?.courseName || 'Institutional Scope'}</span>
                                            <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-gray-400 italic">
                                    No announcements posted yet. Use the form to start broadcasting information to your students.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FacultyAnnouncements;
