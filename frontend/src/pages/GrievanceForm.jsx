import React, { useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const GrievanceForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Academic');
    const [priority, setPriority] = useState('Low');
    const [location, setLocation] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('priority', priority);
            formData.append('location', location);
            formData.append('isAnonymous', isAnonymous);
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const response = await API.post('/grievances', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Grievance submitted:', response.data);
            setMessage('Grievance submitted successfully!');
            setTitle('');
            setDescription('');
            setCategory('Academic');
            setPriority('Low');
            setLocation('');
            setIsAnonymous(false);
            setAttachment(null);
            // Reset file input manually
            document.getElementById('attachment-input').value = '';
        } catch (error) {
            console.error('Error submitting grievance:', error);
            const errorMsg = error.response?.data?.message || 'Error submitting grievance (Max 15MB)';
            setMessage(`Error: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Submit a Grievance</h2>
            {message && (
                <div className={`p-4 mb-4 rounded-lg flex items-center gap-2 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                        type="checkbox"
                        id="anonymous"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">Submit Anonymously</label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief summary of the issue"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="Academic">Academic</option>
                            <option value="Hostel">Hostel</option>
                            <option value="Administrative">Administrative</option>
                            <option value="Technical">Technical</option>
                            <option value="Campus Facilities">Campus Facilities</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                    <input
                        type="text"
                        placeholder="e.g. Library, Block A"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                    <textarea
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide as much detail as possible..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Documentation / Proof (Max 15MB)</label>
                    <input
                        id="attachment-input"
                        type="file"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 mb-1"
                        onChange={(e) => setAttachment(e.target.files[0])}
                    />
                    <p className="text-xs text-gray-500">Allowed: PDF, Images, DOCX</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-8 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all font-semibold disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
                    </button>
                </div>
            </form>
        </Layout>
    );
};

export default GrievanceForm;
