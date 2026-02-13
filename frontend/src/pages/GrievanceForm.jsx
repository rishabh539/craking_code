import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import API from '../services/api';

const GrievanceForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/grievances', { title, description });
            setMessage('Grievance submitted successfully!');
            setTimeout(() => navigate('/student/grievances'), 2000);
        } catch (error) {
            setMessage('Error submitting grievance');
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Submit Grievance</h2>
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
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none"
                >
                    Submit
                </button>
            </form>
        </Layout>
    );
};

export default GrievanceForm;
