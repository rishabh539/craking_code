import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaPlus, FaSearch, FaFilter, FaCircle, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const GrievanceList = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                // Simulate network delay for smooth UI
                setLoading(true);
                const { data } = await API.get('/grievances');
                setGrievances(data);
            } catch (error) {
                console.error('Error fetching grievances', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrievances();
    }, []);

    const filteredGrievances = grievances.filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || g.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
            case 'In Progress': return 'text-blue-500 bg-blue-50 border-blue-200';
            case 'Under Review': return 'text-amber-500 bg-amber-50 border-amber-200';
            default: return 'text-gray-500 bg-gray-50 border-gray-200';
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'Resolved': return <FaCheckCircle />;
            case 'In Progress': return <FaClock />; // Or a spinner icon
            case 'Under Review': return <FaExclamationCircle />;
            default: return <FaCircle className="text-xs" />;
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Grievance Portal</h2>
                    <p className="text-sm text-gray-500 font-bold">Track and manage your submitted concerns.</p>
                </div>
                <Link
                    to="/student/submit-grievance"
                    className="px-6 py-3 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition shadow-lg hover:shadow-gray-200 flex items-center gap-2"
                >
                    <FaPlus className="text-sm" /> New Grievance
                </Link>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search grievances..."
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-black outline-none font-bold text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-black outline-none font-bold text-sm appearance-none cursor-pointer transition-all"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredGrievances.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold text-lg">No grievances found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredGrievances.map((g) => (
                        <div key={g._id} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-2 h-full ${g.priority === 'High' ? 'bg-red-500' :
                                    g.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                                }`}></div>

                            <div className="pl-4 flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 border ${getStatusColor(g.status)}`}>
                                            <StatusIcon status={g.status} /> {g.status}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                            {g.category}
                                        </span>
                                        {g.isAnonymous && (
                                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gray-900 text-white">
                                                Anonymous
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{g.title}</h3>
                                    <p className="text-gray-500 font-medium text-sm line-clamp-2 mb-4">{g.description}</p>

                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        <span>📅 {new Date(g.createdAt).toLocaleDateString()}</span>
                                        <span>📍 {g.location || 'N/A'}</span>
                                    </div>
                                </div>

                                {g.history && g.history.length > 0 && (
                                    <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Latest Activity</h4>
                                        <div className="space-y-3">
                                            {g.history.slice().reverse().slice(0, 2).map((h, index) => (
                                                <div key={index} className="flex gap-3 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>
                                                    <div>
                                                        <p className="font-bold text-gray-700">{h.action}</p>
                                                        {h.remarks && <p className="text-xs text-gray-500 italic mt-0.5">"{h.remarks}"</p>}
                                                        <p className="text-[10px] text-gray-400 mt-1 font-mono">{new Date(h.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default GrievanceList;
