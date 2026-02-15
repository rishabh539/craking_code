import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { data } = await API.get('/applications/my');
            setApplications(data);
        } catch (error) {
            console.error('Error fetching applications', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted': return 'text-green-600 bg-green-50 border-green-200';
            case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
            case 'Shortlisted': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'Under Review': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <Layout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Your Application Ledger</h2>
                <p className="text-gray-600">Track and manage your research & internship requests.</p>
            </div>

            {loading ? <p>Loading history...</p> : (
                <div className="space-y-4">
                    {applications.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-500">You haven't applied for any opportunities yet.</p>
                        </div>
                    ) : applications.map(app => (
                        <div key={app._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{app.opportunity?.title}</h3>
                                    <p className="text-sm text-gray-500">Posted by {app.opportunity?.postedBy?.name} • {app.opportunity?.department}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                                        {app.status}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Applied On</p>
                                        <p className="text-sm font-medium text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4 pt-6 border-t border-gray-50">
                                <div className="flex flex-wrap gap-4">
                                    <a href={`http://localhost:5000/${app.resume}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                                        <span>📄 View Resume</span>
                                    </a>
                                    {app.portfolio && (
                                        <a href={app.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition">
                                            <span>🔗 Portfolio Link</span>
                                        </a>
                                    )}
                                </div>

                                {/* Messages View */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Communication Thread</h4>
                                    {app.messages?.length > 0 ? (
                                        <div className="space-y-3 mb-4">
                                            {app.messages.map((m, i) => (
                                                <div key={i} className={`flex flex-col ${m.sender === app.student ? 'items-end' : 'items-start'}`}>
                                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.sender === app.student ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'}`}>
                                                        <p className="text-[10px] font-bold opacity-70 mb-1">{m.sender === app.student ? 'You' : 'Faculty'}</p>
                                                        <p>{m.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic mb-4">No messages yet. Faculty will contact you here if needed.</p>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Type a reply..."
                                            className="flex-1 text-sm border-0 bg-white rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            id={`reply-${app._id}`}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && e.target.value) {
                                                    try {
                                                        await API.post(`/applications/${app._id}/messages`, { content: e.target.value });
                                                        e.target.value = '';
                                                        fetchApplications();
                                                    } catch (err) { alert('Failed to send'); }
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={async () => {
                                                const input = document.getElementById(`reply-${app._id}`);
                                                if (input.value) {
                                                    try {
                                                        await API.post(`/applications/${app._id}/messages`, { content: input.value });
                                                        input.value = '';
                                                        fetchApplications();
                                                    } catch (err) { alert('Failed to send'); }
                                                }
                                            }}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default MyApplications;
