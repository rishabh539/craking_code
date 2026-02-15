import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const FacultyOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedOpp, setSelectedOpp] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [message, setMessage] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Internship',
        requiredSkills: '',
        duration: '',
        stipend: 'Unpaid',
        deadline: '',
        location: 'On-campus'
    });

    useEffect(() => {
        fetchMyOpportunities();
    }, []);

    const fetchMyOpportunities = async () => {
        try {
            const { data } = await API.get('/opportunities/my');
            setOpportunities(data);
        } catch (error) {
            console.error('Error fetching opportunities', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/opportunities', formData);
            setMessage('Opportunity posted successfully!');
            setShowForm(false);
            setFormData({
                title: '', description: '', category: 'Internship',
                requiredSkills: '', duration: '', stipend: 'Unpaid',
                deadline: '', location: 'On-campus'
            });
            fetchMyOpportunities();
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || 'Failed to post'));
        }
    };

    const viewApplicants = async (oppId) => {
        try {
            const { data } = await API.get(`/applications/opportunity/${oppId}`);
            setApplicants(data);
            const opp = opportunities.find(o => o._id === oppId);
            setSelectedOpp(opp);
        } catch (error) {
            console.error('Error fetching applicants', error);
        }
    };

    const updateStatus = async (appId, status) => {
        try {
            await API.put(`/applications/${appId}/status`, { status });
            viewApplicants(selectedOpp._id);
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">The Professor's Call</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    {showForm ? 'Cancel' : 'Post New Opportunity'}
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            {showForm && (
                <form onSubmit={handleCreate} className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 max-w-2xl">
                    <h3 className="text-lg font-bold">New Opportunity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border rounded-lg"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Research Assistant in ML"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                className="w-full px-4 py-2 border rounded-lg"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Internship">Internship</option>
                                <option value="Research">Research</option>
                                <option value="Project">Project</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Deadline</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 border rounded-lg"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Duration</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border rounded-lg"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="e.g. 3 Months"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stipend</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg"
                                value={formData.stipend}
                                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                                placeholder="e.g. 5000/mo or Unpaid"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Required Skills (comma separated)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg"
                            value={formData.requiredSkills}
                            onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                            placeholder="Python, ML, Data Analysis"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold">Post Entry</button>
                </form>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Your Postings</h3>
                    {opportunities.map(opp => (
                        <div key={opp._id} className="p-4 bg-white border rounded-xl shadow-sm hover:border-indigo-300 transition-all cursor-pointer"
                            onClick={() => viewApplicants(opp._id)}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg">{opp.title}</h4>
                                    <p className="text-xs text-gray-500">{opp.category} • {opp.location}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${opp.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {opp.status}
                                </span>
                            </div>
                            <div className="mt-2 flex gap-4 text-sm">
                                <span className="text-gray-600">📅 Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                                <span className="text-gray-600">👥 Applicants: {applicants.filter(a => a.opportunity === opp._id).length || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                    <h3 className="text-xl font-bold mb-4">Applicants {selectedOpp && `for ${selectedOpp.title}`}</h3>
                    {!selectedOpp ? (
                        <div className="h-full flex items-center justify-center text-gray-400">
                            Select a posting to view applicants
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applicants.length === 0 ? <p className="text-gray-500">No applications yet.</p> : applicants.map(app => (
                                <div key={app._id} className="p-4 border rounded-lg">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-bold">{app.student.name}</p>
                                            <p className="text-xs text-gray-500">{app.student.email} • Sem {app.student.semester}</p>
                                        </div>
                                        <select
                                            className="text-xs border rounded p-1"
                                            value={app.status}
                                            onChange={(e) => updateStatus(app._id, e.target.value)}
                                        >
                                            <option value="Submitted">Submitted</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <a href={`${import.meta.env.PROD ? 'https://craking-backend.onrender.com' : 'http://localhost:5000'}/${app.resume}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold hover:underline">View Resume</a>
                                        {app.portfolio && <a href={app.portfolio} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 font-bold hover:underline">Portfolio</a>}
                                    </div>

                                    {/* Messaging Section */}
                                    <div className="mt-4 pt-4 border-t">
                                        {app.messages?.length > 0 && (
                                            <div className="mb-3 space-y-2 max-h-32 overflow-y-auto">
                                                {app.messages.map((m, i) => (
                                                    <div key={i} className={`text-xs p-2 rounded ${m.sender === user._id ? 'bg-indigo-50 ml-4' : 'bg-gray-50 mr-4'}`}>
                                                        <p className="font-bold">{m.sender === user._id ? 'You' : 'Student'}:</p>
                                                        <p>{m.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Send a message..."
                                                className="flex-1 text-xs border rounded px-2 py-1"
                                                id={`msg-${app._id}`}
                                                onKeyDown={async (e) => {
                                                    if (e.key === 'Enter' && e.target.value) {
                                                        try {
                                                            await API.post(`/applications/${app._id}/messages`, { content: e.target.value });
                                                            e.target.value = '';
                                                            viewApplicants(selectedOpp._id);
                                                        } catch (err) { alert('Failed to send'); }
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={async () => {
                                                    const input = document.getElementById(`msg-${app._id}`);
                                                    if (input.value) {
                                                        try {
                                                            await API.post(`/applications/${app._id}/messages`, { content: input.value });
                                                            input.value = '';
                                                            viewApplicants(selectedOpp._id);
                                                        } catch (err) { alert('Failed to send'); }
                                                    }
                                                }}
                                                className="text-[10px] bg-black text-white px-2 py-1 rounded"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default FacultyOpportunities;
