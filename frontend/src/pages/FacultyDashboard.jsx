import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaClipboardList, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ opportunities: 0, pendingApps: 0 });
    const [recentOpps, setRecentOpps] = useState([]);
    const [courseSummary, setCourseSummary] = useState({
        courseCount: 0,
        studentCount: 0,
        pendingAssignments: 0,
        attendanceMarkedToday: false
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [oppsRes, summaryRes] = await Promise.all([
                API.get('/opportunities/faculty/my'),
                API.get(`/courses/faculty/${user._id}/summary`)
            ]);

            setStats({
                opportunities: oppsRes.data.length,
                pendingApps: oppsRes.data.reduce((acc, curr) => acc + (curr.applicants?.filter(a => a.status === 'Under Review').length || 0), 0)
            });
            setRecentOpps(oppsRes.data.slice(0, 3));
            setCourseSummary(summaryRes.data);
        } catch (error) {
            console.error('Error fetching faculty dashboard data', error);
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">Directorate</p>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight tracking-tight">Professor {user?.name}</h1>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full border border-emerald-200 uppercase tracking-tighter">Faculty Session</span>
                </div>
                <p className="text-gray-500 mt-1 italic font-serif">"The guidance of one is the spark for many."</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[
                    { label: 'Active Calls', value: stats.opportunities, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Pending Review', value: stats.pendingApps, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'My Courses', value: courseSummary.courseCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Students', value: courseSummary.studentCount, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Open Tasks', value: courseSummary.pendingAssignments, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Attendance Today', value: courseSummary.attendanceMarkedToday ? '✓' : '✗', color: courseSummary.attendanceMarkedToday ? 'text-green-600' : 'text-red-600', bg: courseSummary.attendanceMarkedToday ? 'bg-green-50' : 'bg-red-50' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color} ${stat.bg} w-12 h-12 flex items-center justify-center rounded-2xl shadow-inner`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5 duration-700">
                {/* Board Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-900">Opportunity Board</h3>
                        <button onClick={() => navigate('/faculty/opportunities')} className="text-xs font-black text-indigo-500 hover:underline underline-offset-4 font-serif">Manage All Postings →</button>
                    </div>

                    {recentOpps.length === 0 ? (
                        <div className="p-16 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center bg-gray-50/50">
                            <p className="text-gray-400 font-bold italic">The board is currently quiet. No active calls posted.</p>
                            <button onClick={() => navigate('/faculty/opportunities')} className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest">+ Post New Opportunity</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentOpps.map(opp => (
                                <div key={opp._id} className="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-indigo-600 transition-all cursor-pointer overflow-hidden relative" onClick={() => navigate('/faculty/opportunities')}>
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                                    <div className="relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{opp.category}</span>
                                            <span className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-50">
                                                {opp.applicants?.length || 0} Applicants
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{opp.title}</h4>
                                        <p className="text-xs text-gray-500 font-medium mt-1">📍 {opp.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900">Faculty Pulse</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { title: 'Post Announcement', icon: '📢', path: '/faculty/announcements', theme: 'indigo' },
                            { title: 'Mark Attendance', icon: '📅', path: '/faculty/attendance', theme: 'emerald' },
                            { title: 'Upload Resources', icon: '📂', path: '/faculty/resources', theme: 'amber' },
                            { title: 'Event Management', icon: '🎪', path: '/faculty/events', theme: 'purple' }
                        ].map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className={`group p-5 rounded-[2rem] border border-gray-100 bg-white transition-all hover:border-${action.theme}-200 hover:shadow-xl hover:-translate-y-1 flex items-center gap-4`}
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform">{action.icon}</span>
                                <div className="text-left">
                                    <p className={`font-black text-sm text-gray-900 group-hover:text-${action.theme}-600 transition-colors`}>{action.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Action Required</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FacultyDashboard;
