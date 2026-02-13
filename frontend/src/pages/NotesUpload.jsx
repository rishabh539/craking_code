import React, { useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const NotesUpload = () => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('noteFile', file);

        try {
            await API.post('/notes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Note uploaded successfully!');
            setTitle('');
            setSubject('');
            setFile(null);
        } catch (error) {
            setMessage('Error uploading note');
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Upload Academic Note</h2>
            {message && <p className={`mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">PDF File</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        required
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleFileChange}
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none"
                >
                    Upload Note
                </button>
            </form>
        </Layout>
    );
};

export default NotesUpload;
