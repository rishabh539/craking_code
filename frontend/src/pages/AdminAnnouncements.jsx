import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const AdminAnnouncements = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const { data } = await API.get('/announcements');
            setAnnouncements(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/announcements', { title, content });
            setTitle('');
            setContent('');
            fetchAnnouncements();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Manage Announcements</h2>

            <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-lg">
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
