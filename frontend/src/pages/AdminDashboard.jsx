import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaClipboardList, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGrievances: 0,
        pendingGrievances: 0,
        resolvedGrievances: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalResources: 0
    });
    const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [analyticsRes, configRes] = await Promise.all([
                API.get('/users/analytics'),
                API.get('/admin/config')
            ]);
            setStats(analyticsRes.data);

            const enrollmentConfig = configRes.data.find(c => c.key === 'isEnrollmentOpen');
            if (enrollmentConfig) setIsEnrollmentOpen(enrollmentConfig.value);
        } catch (error) {
            console.error('Error fetching dashboard data', error);
        }
    };

    const toggleEnrollment = async () => {
        try {
            const { data } = await API.put('/admin/config/isEnrollmentOpen', { value: !isEnrollmentOpen });
            setIsEnrollmentOpen(data.value);
        } catch (error) {
            alert('Failed to update enrollment window');
        }
    };



    return (
        <Layout>
            <div className="mb-8 p-1">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">Command Center</p>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">University Oversight</h1>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-full border border-red-200 uppercase tracking-tighter">Administrator overdrive</span>
                </div>
                <p className="text-gray-500 mt-1 font-medium">Global system metrics and administrative protocols.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                {[
                    { title: 'Total Users', count: stats.totalUsers, icon: <FaUsers />, theme: 'blue' },
                    { title: 'Courses', count: stats.totalCourses, icon: <FaClipboardList />, theme: 'emerald' },
                    { title: 'Enrollments', count: stats.totalEnrollments, icon: <FaCheckCircle />, theme: 'violet' },
                    { title: 'Academic Vault', count: stats.totalResources, icon: <FaClipboardList />, theme: 'amber' },
                    { title: 'Grievances', count: stats.totalGrievances, icon: <FaClipboardList />, theme: 'indigo' },
                    { title: 'Pending', count: stats.pendingGrievances, icon: <FaExclamationCircle />, theme: 'rose' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                        <div className={`w-12 h-12 rounded-2xl ${stat.theme === 'blue' ? 'bg-blue-50 text-blue-600' :
                            stat.theme === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                                stat.theme === 'violet' ? 'bg-violet-50 text-violet-600' :
                                    stat.theme === 'amber' ? 'bg-amber-50 text-amber-600' :
                                        stat.theme === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                            'bg-rose-50 text-rose-600'
                            } flex items-center justify-center text-xl mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.title}</p>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.count}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-20 -mt-20 blur-3xl transition-opacity opacity-0 group-hover:opacity-100 duration-1000"></div>

                <h3 className="relative text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Master System Control
                </h3>

                <div className="relative flex flex-col md:flex-row items-center justify-between p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg">
                    <div className="mb-6 md:mb-0 text-center md:text-left">
                        <p className="text-lg font-black text-gray-900">Enrollment Lifecycle</p>
                        <p className="text-sm text-gray-500 font-medium max-w-md mt-1 italic">
                            {isEnrollmentOpen
                                ? "The gateway is currently open. Students are actively securing their future seats."
                                : "The gateway is locked. All course registers are currently finalized."}
                        </p>
                    </div>

                    <div className="flex flex-col items-center">
                        <button
                            onClick={toggleEnrollment}
                            className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:scale-105 active:scale-95 ${isEnrollmentOpen
                                ? 'bg-indigo-600 text-white shadow-indigo-200'
                                : 'bg-gray-200 text-gray-600 shadow-gray-100'
                                }`}
                        >
                            {isEnrollmentOpen ? 'Window Active' : 'Initiate Window'}
                        </button>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">Auth: Institutional Overdrive</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
