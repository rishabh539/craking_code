import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaTasks, FaFileAlt, FaLightbulb, FaBriefcase, FaGraduationCap } from 'react-icons/fa';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [distribution, setDistribution] = useState({ Core: 0, Elective: 0, Lab: 0 });
    const [tasks, setTasks] = useState([]);
    const [featuredOpportunities, setFeaturedOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [enrollmentsRes, eventsRes, distRes, tasksRes, oppsRes] = await Promise.all([
                API.get('/enrollments/my'),
                API.get('/calendar/my'),
                API.get('/enrollments/distribution/my'),
                API.get('/tasks'),
                API.get('/opportunities')
            ]);

            setEnrollments(enrollmentsRes.data);
            setDistribution(distRes.data);
            setTasks(tasksRes.data.filter(t => t.status !== 'Completed').slice(0, 3));
            setFeaturedOpportunities(oppsRes.data.slice(0, 3));

            const upcoming = eventsRes.data
                .filter(e => new Date(e.eventDate) >= new Date())
                .slice(0, 5);
            setUpcomingEvents(upcoming);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalCredits = enrollments.reduce((sum, e) => sum + (e.course?.credits || 0), 0);
    const avgAttendance = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.attendancePercentage || 0), 0) / enrollments.length
        : 0;

    return (
        <Layout>
            <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">Overview</p>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome, {user?.name}</h1>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full border border-indigo-200 uppercase tracking-tighter">Student Session</span>
                </div>
                <p className="text-gray-500 mt-1">Here's what's happening in your academic world today.</p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Syncing your ledger...</p>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-700">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="relative group overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                            <p className="relative text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Enrolled</p>
                            <p className="relative text-3xl font-black text-indigo-900">{enrollments.length} <span className="text-sm font-bold text-gray-400">Courses</span></p>
                        </div>
                        <div className="relative group overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                            <p className="relative text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Credits</p>
                            <p className="relative text-3xl font-black text-emerald-900">{totalCredits} <span className="text-sm font-bold text-gray-400">Earned</span></p>
                        </div>
                        <div className="relative group overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                            <p className="relative text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Attendance</p>
                            <p className={`relative text-3xl font-black ${avgAttendance >= 75 ? 'text-green-600' : 'text-amber-600'}`}>
                                {avgAttendance.toFixed(1)}%
                            </p>
                        </div>
                        <div className="relative group overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                            <p className="relative text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Timeline</p>
                            <p className="relative text-3xl font-black text-purple-900">{upcomingEvents.length} <span className="text-sm font-bold text-gray-400">Events</span></p>
                        </div>
                    </div>

                    {/* Credit Roadmap */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">Your Credit Roadmap</h3>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border">Requirement Sync: Active</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { label: 'Core', value: distribution.Core, color: 'bg-indigo-600', text: 'text-indigo-700', bg: 'bg-indigo-50' },
                                { label: 'Elective', value: distribution.Elective, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                                { label: 'Lab', value: distribution.Lab, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' }
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className={`text-xs font-black uppercase tracking-widest ${item.text}`}>{item.label}</span>
                                        <span className="text-lg font-black">{item.value || 0}</span>
                                    </div>
                                    <div className={`w-full ${item.bg} rounded-full h-3 overflow-hidden p-0.5 border border-gray-100`}>
                                        <div
                                            className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out shadow-lg`}
                                            style={{ width: `${(item.value / totalCredits) * 100 || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Enrollment Gate', desc: 'Secure your future seats.', path: '/student/courses/enroll', theme: 'indigo' },
                            { title: 'Academic Vault', desc: 'Resources & lecture notes.', path: '/student/resources', theme: 'emerald' },
                            { title: 'Portal Events', desc: 'Stay ahead of deadlines.', path: '/student/calendar', theme: 'purple' }
                        ].map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className={`text-left p-6 rounded-3xl border border-gray-100 bg-white transition-all hover:border-${action.theme}-200 hover:shadow-xl hover:-translate-y-1 group`}
                            >
                                <h3 className={`font-black text-lg text-gray-900 group-hover:text-${action.theme}-600 transition-colors`}>{action.title}</h3>
                                <p className="text-sm text-gray-500 font-medium">{action.desc}</p>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Ledger Peek */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900">Personal Ledger</h3>
                                <button onClick={() => navigate('/student/ledger')} className="text-xs font-black text-indigo-500 hover:underline underline-offset-4">Open Ledger →</button>
                            </div>
                            <div className="space-y-6 flex-1">
                                {tasks.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-3xl opacity-50">
                                        <p className="text-sm font-bold text-gray-400">The ledger is empty. Start a quest.</p>
                                    </div>
                                ) : tasks.map(task => (
                                    <div key={task._id} className="group cursor-pointer" onClick={() => navigate('/student/ledger')}>
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <p className="text-sm font-black text-gray-800 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{task.category}</p>
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${task.priority === 'High' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                                                }`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-indigo-600 h-full transition-all duration-700 delay-300"
                                                style={{ width: `${(task.milestones?.filter(m => m.isCompleted).length / task.milestones?.length) * 100 || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-gray-900">Academic Timeline</h3>
                                <button onClick={() => navigate('/student/calendar')} className="text-xs font-black text-indigo-500 hover:underline underline-offset-4">Full Schedule →</button>
                            </div>
                            <div className="space-y-4">
                                {upcomingEvents.length === 0 ? (
                                    <p className="text-sm font-bold text-gray-400 py-8 text-center bg-gray-50 rounded-3xl border border-dashed">Timeline clear.</p>
                                ) : upcomingEvents.map(event => (
                                    <div key={event._id} className="flex items-center gap-5 p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all group">
                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform ${event.eventType === 'Assignment' ? 'bg-rose-500 text-white shadow-rose-200' :
                                            event.eventType === 'Exam' ? 'bg-amber-500 text-white shadow-amber-200' :
                                                'bg-indigo-600 text-white shadow-indigo-200'
                                            }`}>
                                            <span className="text-[10px] uppercase opacity-80">{new Date(event.eventDate).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-xl leading-none">{new Date(event.eventDate).getDate()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">{event.title}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{event.eventType} • {event.course?.courseCode || 'Portal'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-900">{new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default StudentDashboard;
