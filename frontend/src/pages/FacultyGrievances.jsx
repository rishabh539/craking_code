import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaSearch, FaFilter, FaCheckCircle, FaClock, FaExclamationCircle, FaUser, FaPaperclip, FaChevronDown, FaTimes } from 'react-icons/fa';

const FacultyGrievances = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [statusToUpdate, setStatusToUpdate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/grievances');
            setGrievances(data);
        } catch (error) {
            console.error('Error fetching grievances', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusClick = (grievance, status) => {
        setSelectedGrievance(grievance);
        setStatusToUpdate(status);
        setRemarks('');
    };

    const confirmStatusUpdate = async () => {
        if (!selectedGrievance) return;
        try {
            await API.put(`/grievances/${selectedGrievance._id}/status`, {
                status: statusToUpdate,
                remarks
            });
            fetchGrievances();
            setSelectedGrievance(null);
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const filteredGrievances = grievances.filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (g.description && g.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'All' || g.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'Resolved': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 w-fit"><FaCheckCircle /> Resolved</span>;
            case 'In Progress': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 w-fit"><FaClock /> In Progress</span>;
            case 'Under Review': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 w-fit"><FaExclamationCircle /> Reviewing</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-wider w-fit">{status}</span>;
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Case Management</h2>
                    <p className="text-sm text-gray-500 font-bold">Review and resolve assigned student grievances.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Cases..."
                            className="pl-10 pr-4 py-2 bg-white border-2 border-gray-100 rounded-xl focus:border-black outline-none font-bold text-xs w-64 uppercase tracking-wide"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'Pending', 'Under Review', 'In Progress', 'Resolved'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${filterStatus === status
                            ? 'bg-black text-white border-black shadow-lg'
                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredGrievances.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold italic">No active cases found.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest text-left">
                                <th className="px-6 py-4">Status & Priority</th>
                                <th className="px-6 py-4">Case Details</th>
                                <th className="px-6 py-4">Submitted By</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredGrievances.map((g) => (
                                <tr key={g._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5 align-top w-48">
                                        <div className="flex flex-col gap-2">
                                            <StatusBadge status={g.status} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit ${g.priority === 'High' ? 'bg-red-50 text-red-600' :
                                                g.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                {g.priority} Priority
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        <p className="text-sm font-black text-gray-900 mb-1">{g.title}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2 max-w-md mb-2">{g.description}</p>
                                        <div className="flex gap-2">
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">
                                                {g.category}
                                            </span>
                                            {g.attachment && (
                                                <a href={`${import.meta.env.PROD ? 'https://craking-backend.onrender.com' : 'http://localhost:5000'}/${g.attachment}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline">
                                                    <FaPaperclip /> Attachment
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {g.isAnonymous ? '?' : g.submittedBy?.name?.charAt(0) || <FaUser />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">
                                                    {g.isAnonymous ? 'Anonymous' : g.submittedBy?.name}
                                                </p>
                                                <p className="text-[10px] text-gray-400">
                                                    {new Date(g.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 align-top text-right">
                                        {g.status !== 'Resolved' && (
                                            <div className="flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                {g.status !== 'In Progress' && (
                                                    <button
                                                        onClick={() => handleStatusClick(g, 'In Progress')}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors w-fit border border-blue-100"
                                                    >
                                                        Start Review
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleStatusClick(g, 'Resolved')}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors w-fit border border-emerald-100"
                                                >
                                                    Resolve Case
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Update Modal */}
            {selectedGrievance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Update Status</h3>
                            <button onClick={() => setSelectedGrievance(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 font-medium mb-4">
                                You are marking this case as <span className="text-black font-black uppercase">{statusToUpdate}</span>.
                            </p>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Resolution Remarks</label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-sm min-h-[100px]"
                                placeholder="Enter details about the action taken..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSelectedGrievance(null)}
                                className="py-3 rounded-xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusUpdate}
                                className="py-3 rounded-xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Confirm Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default FacultyGrievances;
