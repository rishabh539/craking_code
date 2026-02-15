import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [distributions, setDistributions] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeRole, setActiveRole] = useState('All');
    const [confirmDelete, setConfirmDelete] = useState(null); // User to delete
    const [adminPassword, setAdminPassword] = useState('');
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, distRes] = await Promise.all([
                API.get(`/users?role=${activeRole}&search=${search}`),
                API.get('/enrollments/distribution/all')
            ]);
            setUsers(usersRes.data);
            setDistributions(distRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeRole]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchData();
        }
    };

    const toggleStatus = async (userId) => {
        try {
            await API.patch(`/users/${userId}/status`);
            fetchData();
            setMessage('User status updated successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating status');
        }
    };

    const handleDelete = async () => {
        if (!adminPassword) {
            alert('Admin password required for permanent deletion');
            return;
        }

        try {
            // In a real app, we'd verify the password on the backend
            // For now, we proceed with the delete call
            await API.delete(`/users/${confirmDelete._id}`);
            setConfirmDelete(null);
            setAdminPassword('');
            fetchData();
            setMessage('User permanently removed from institutional records');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting user');
        }
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Institutional Personnel</h2>
                    <p className="text-sm text-gray-500 font-bold">Manage, deactivate, or purge user credentials from AEGIS.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search Name / Email / ID..."
                        className="px-4 py-2 border-2 border-gray-100 rounded-xl focus:border-black outline-none transition-all text-sm font-bold w-64 uppercase tracking-tighter"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <button
                        onClick={fetchData}
                        className="bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                    >
                        Search
                    </button>
                </div>
            </div>

            {message && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl font-black text-xs animate-in slide-in-from-top-4 duration-300">
                    ✅ {message}
                </div>
            )}

            <div className="flex gap-2 mb-6">
                {['All', 'Student', 'Faculty', 'Admin'].map(role => (
                    <button
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeRole === role
                                ? 'bg-black text-white border-black shadow-lg scale-105'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        {role}s
                    </button>
                ))}
            </div>

            <div className="overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-100 border-t-black rounded-full animate-spin"></div>
                    </div>
                )}
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4 text-left font-black">Personnel</th>
                            <th className="px-6 py-4 text-left font-black">Identity</th>
                            <th className="px-6 py-4 text-left font-black">Department</th>
                            <th className="px-6 py-4 text-left font-black">Scholar Statistics</th>
                            <th className="px-6 py-4 text-center font-black">Status</th>
                            <th className="px-6 py-4 text-right font-black">Management</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50/50 transition-all group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${user.role === 'admin' ? 'bg-rose-100 text-rose-600' :
                                                user.role === 'faculty' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 tracking-tight">{user.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'admin' ? 'bg-rose-500' :
                                                        user.role === 'faculty' ? 'bg-indigo-500' : 'bg-emerald-500'
                                                    }`}></span>
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-[10px] font-black text-gray-900 font-mono tracking-widest">{user.rollNumber || user.employeeId || 'SYS-ADMIN-N/A'}</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">{user.role}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter bg-gray-100 px-2 py-1 rounded-lg">
                                        {user.department}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-sm bg-white border-b border-gray-200">
                                    {user.role === 'student' ? (
                                        <div className="flex gap-2 text-[10px] font-black font-mono">
                                            <div className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-indigo-700">C:{distributions[user._id]?.Core || 0}</div>
                                            <div className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-emerald-700">E:{distributions[user._id]?.Elective || 0}</div>
                                            <div className="bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-amber-700">L:{distributions[user._id]?.Lab || 0}</div>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-gray-300 italic">Not Required</span>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`inline-block px-3 py-1 text-[10px] font-black rounded-full border ${user.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                        {user.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {user.role !== 'admin' && (
                                            <>
                                                <button
                                                    onClick={() => toggleStatus(user._id)}
                                                    className={`p-2 rounded-xl border transition-all ${user.isActive !== false
                                                            ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                                        }`}
                                                    title={user.isActive !== false ? 'Deactivate Access' : 'Restore Access'}
                                                >
                                                    {user.isActive !== false ? '🔒' : '🔓'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(user)}
                                                    className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all font-bold"
                                                    title="Permanent Purge"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !loading && (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-bold italic">No personnel matches the current search criteria.</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 text-3xl mb-6 mx-auto border-4 border-rose-100">
                            ⚠️
                        </div>
                        <h3 className="text-2xl font-black text-center text-gray-900 mb-2">Critical Purge Required?</h3>
                        <p className="text-center text-gray-500 text-sm font-bold mb-8 leading-relaxed">
                            You are about to permanently remove <span className="text-black font-black underline decoration-rose-500 decoration-2">{confirmDelete.name}</span> from the institutional database. This action is irreversible. All related task data will be neutralized.
                        </p>

                        <div className="mb-6">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Verify Admin Authorization</label>
                            <input
                                type="password"
                                placeholder="ENTER ADMIN PASSWORD"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none transition-all font-black text-center tracking-widest text-lg"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setConfirmDelete(null);
                                    setAdminPassword('');
                                }}
                                className="py-4 rounded-3xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleDelete}
                                className="py-4 rounded-3xl bg-black text-white font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-gray-200"
                            >
                                Confirm Purge
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ManageUsers;
