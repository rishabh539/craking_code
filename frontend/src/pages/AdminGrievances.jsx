import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaSearch, FaFilter, FaCheckCircle, FaClock, FaExclamationCircle, FaUser, FaPaperclip, FaChevronDown, FaTimes, FaUserPlus } from 'react-icons/fa';

const AdminGrievances = () => {
    const [grievances, setGrievances] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    // Assignment State
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
    const [selectedFacultyId, setSelectedFacultyId] = useState('');

    // Filters
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGrievances();
        fetchFaculty();
    }, [filterCategory, filterPriority, filterStatus]);

    const fetchGrievances = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            if (filterPriority) params.append('priority', filterPriority);
            if (filterStatus) params.append('status', filterStatus);

            const { data } = await API.get(`/grievances?${params.toString()}`);
            setGrievances(data);
        } catch (error) {
            console.error('Error fetching grievances', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        try {
            const { data } = await API.get('/users');
            const facultyMembers = data.filter(user => user.role === 'faculty');
            setFaculty(facultyMembers);
        } catch (error) {
            console.error('Error fetching faculty', error);
        }
    };

    const openAssignModal = (id) => {
        setSelectedGrievanceId(id);
        setSelectedFacultyId('');
        setAssignModalOpen(true);
    };

    const handleAssign = async () => {
        if (!selectedFacultyId) return alert('Please select a Faculty member');

        try {
            await API.put(`/grievances/${selectedGrievanceId}/assign`, { facultyId: selectedFacultyId });
            fetchGrievances();
            setAssignModalOpen(false);
        } catch (error) {
            console.error('Error assigning', error);
            alert('Failed to assign');
        }
    };

    const filteredGrievances = grievances.filter(g =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.submittedBy?.name && g.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const StatusBadge = ({ status }) => {
        switch (status) {
            case 'Resolved': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit"><FaCheckCircle /> Resolved</span>;
            case 'In Progress': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit"><FaClock /> In Progress</span>;
            case 'Under Review': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit"><FaExclamationCircle /> Reviewing</span>;
            default: return <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">{status}</span>;
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Oversight Console</h2>
                    <p className="text-sm text-gray-500 font-bold">Monitor and assign institutional grievances.</p>
                </div>
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

            {/* Advanced Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <select className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-black outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="Academic">Academic</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Technical">Technical</option>
                    <option value="Campus Facilities">Facilities</option>
                </select>
                <select className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-black outline-none" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <select className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-black outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                </select>
                <button
                    onClick={() => { setFilterCategory(''); setFilterPriority(''); setFilterStatus(''); }}
                    className="p-3 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                    Clear Filters
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredGrievances.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold italic">No records match the current criteria.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                                <th className="px-6 py-4">Case Info</th>
                                <th className="px-6 py-4">Metadata</th>
                                <th className="px-6 py-4">Assignment</th>
                                <th className="px-6 py-4">Current Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredGrievances.map((g) => (
                                <tr key={g._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5 align-top">
                                        <p className="text-sm font-black text-gray-900 mb-1">{g.title}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">
                                                {g.isAnonymous ? '?' : g.submittedBy?.name?.charAt(0)}
                                            </div>
                                            <span className="text-xs text-gray-500">{g.isAnonymous ? 'Anonymous' : g.submittedBy?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold text-gray-700">{g.category}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded w-fit ${g.priority === 'High' ? 'bg-red-50 text-red-600' :
                                                    g.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                                }`}>
                                                {g.priority}
                                            </span>
                                            <span className="text-[10px] text-gray-400">{new Date(g.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        {g.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                    {g.assignedTo.name.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{g.assignedTo.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-gray-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        <StatusBadge status={g.status} />
                                    </td>
                                    <td className="px-6 py-5 align-top text-right">
                                        <button
                                            onClick={() => openAssignModal(g._id)}
                                            className="px-3 py-1.5 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-sm"
                                        >
                                            <FaUserPlus className="inline mr-1 mb-0.5" /> Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Assignment Modal */}
            {assignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-gray-100 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Assign Faculty</h3>
                            <button onClick={() => setAssignModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select Personnel</label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                                    value={selectedFacultyId}
                                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                                >
                                    <option value="">Select Faculty Member...</option>
                                    {faculty.map(f => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                                    ))}
                                </select>
                                <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setAssignModalOpen(false)}
                                className="py-3 rounded-xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                className="py-3 rounded-xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminGrievances;
