import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const AdminAnnouncements = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [announcements, setAnnouncements] = useState([]);

    const [scope, setScope] = useState('Institutional');
    const [courseId, setCourseId] = useState('');
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchAnnouncements();
        fetchCourses();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await API.get('/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/announcements', { title, content, scope, courseId: scope === 'Course' ? courseId : undefined });
            setTitle('');
            setContent('');
            setScope('Institutional');
            setCourseId('');
            fetchAnnouncements();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Manage Announcements</h2>

            <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-lg bg-gray-50 p-6 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                        <select
                            className="w-full px-3 py-2 border rounded"
                            value={scope}
                            onChange={(e) => setScope(e.target.value)}
                        >
                            <option value="Institutional">Institutional (All)</option>
                            <option value="Course">Specific Course</option>
                        </select>
                    </div>
                    {scope === 'Course' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                            <select
                                className="w-full px-3 py-2 border rounded"
                                required
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                            >
                                <option value="">Select a course...</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.courseCode} - {c.courseName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Title"
                        required
                        className="w-full px-3 py-2 border rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <textarea
                        placeholder="Content"
                        required
                        className="w-full px-3 py-2 border rounded"
                        rows="3"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                </div>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded">Post Announcement</button>
            </form>

            <div className="space-y-4">
                {announcements.map((a) => (
                    <div key={a._id} className="p-4 bg-white rounded shadow">
                        <h3 className="font-bold">{a.title}</h3>
                        <p>{a.content}</p>
                        <p className="text-xs text-gray-500">Posted by: {a.postedBy.name} on {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default AdminAnnouncements;
