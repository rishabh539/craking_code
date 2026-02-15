import React, { useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const FacultyGrievanceForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Administrative');
    const [priority, setPriority] = useState('Medium');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/grievances', {
                title,
                description,
                category,
                priority,
                // Faculty grievances are rarely anonymous but we can add if needed
                isAnonymous: false
            });
            setMessage('Grievance submitted successfully!');
            setTitle('');
            setDescription('');
            setCategory('Administrative');
            setPriority('Medium');
        } catch (error) {
            setMessage('Error submitting grievance');
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Report an Issue</h2>
            {message && <p className={`mb-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Administrative">Administrative</option>
                            <option value="Technical">Technical</option>
                            <option value="Campus Facilities">Facilities</option>
                            <option value="Academic">Academic Operations</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
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
                    Submit Report
                </button>
            </form>
        </Layout>
    );
};

export default FacultyGrievanceForm;
