import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const ScholarsLedger = () => {
    const [tasks, setTasks] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        category: 'Assignments',
        priority: 'Medium',
        deadline: '',
        milestones: []
    });
    const [newMilestone, setNewMilestone] = useState('');

    useEffect(() => {
        fetchTasks();
        fetchAnalytics();
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await API.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const { data } = await API.get('/tasks/analytics');
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics', error);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tasks', newTask);
            setShowTaskForm(false);
            setNewTask({ title: '', description: '', category: 'Assignments', priority: 'Medium', deadline: '', milestones: [] });
            fetchTasks();
            fetchAnalytics();
        } catch (error) {
            console.error('Error adding task', error);
        }
    };

    const toggleTaskStatus = async (task) => {
        const nextStatus = task.status === 'To Do' ? 'In Progress' : (task.status === 'In Progress' ? 'Completed' : 'To Do');
        try {
            await API.put(`/tasks/${task._id}`, { status: nextStatus });
            fetchTasks();
            fetchAnalytics();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const toggleMilestone = async (taskId, milestoneIndex) => {
        const task = tasks.find(t => t._id === taskId);
        const updatedMilestones = [...task.milestones];
        updatedMilestones[milestoneIndex].isCompleted = !updatedMilestones[milestoneIndex].isCompleted;

        try {
            await API.put(`/tasks/${taskId}`, { milestones: updatedMilestones });
            fetchTasks();
        } catch (error) {
            console.error('Error updating milestone', error);
        }
    };

    const addMilestoneToForm = () => {
        if (newMilestone.trim()) {
            setNewTask({
                ...newTask,
                milestones: [...newTask.milestones, { text: newMilestone, isCompleted: false }]
            });
            setNewMilestone('');
        }
    };

    const calculateProgress = (milestones) => {
        if (!milestones || milestones.length === 0) return 0;
        const completed = milestones.filter(m => m.isCompleted).length;
        return Math.round((completed / milestones.length) * 100);
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 italic">The Scholar's Ledger</h2>
                    <p className="text-gray-600">Plot your path, track your triumphs.</p>
                </div>
                <button
                    onClick={() => setShowTaskForm(!showTaskForm)}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-1"
                >
                    {showTaskForm ? 'Cancel' : '+ New Quest'}
                </button>
            </div>

            {/* Analytics Header */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Total Quests</p>
                        <p className="text-2xl font-black text-indigo-900">{analytics.total}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Triumphs</p>
                        <p className="text-2xl font-black text-emerald-900">{analytics.completed}</p>
                    </div>
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">In Trial</p>
                        <p className="text-2xl font-black text-amber-900">{analytics.inProgress}</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">To Settle</p>
                        <p className="text-2xl font-black text-gray-900">{analytics.todo}</p>
                    </div>
                </div>
            )}

            {showTaskForm && (
                <form onSubmit={handleAddTask} className="mb-10 bg-white p-8 rounded-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4 max-w-2xl">
                    <h3 className="text-xl font-black uppercase">Define Your Next Quest</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Quest Title</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black outline-none"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                            <select
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black outline-none"
                                value={newTask.category}
                                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                            >
                                <option value="Assignments">Assignments</option>
                                <option value="Projects">Projects</option>
                                <option value="Personal Goals">Personal Goals</option>
                                <option value="Exam Preparation">Exam Preparation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Priority</label>
                            <select
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black outline-none"
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Milestones (Steps to success)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-black outline-none"
                                value={newMilestone}
                                onChange={(e) => setNewMilestone(e.target.value)}
                                placeholder="e.g. Gather research papers"
                            />
                            <button type="button" onClick={addMilestoneToForm} className="px-4 bg-gray-100 rounded-lg font-bold">+</button>
                        </div>
                        <div className="mt-2 space-y-1">
                            {newTask.milestones.map((m, idx) => (
                                <div key={idx} className="text-sm bg-gray-50 p-2 rounded flex justify-between">
                                    <span>{m.text}</span>
                                    <button onClick={() => setNewTask({ ...newTask, milestones: newTask.milestones.filter((_, i) => i !== idx) })} className="text-red-500">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-gray-800 transition">Begin Quest</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map(task => (
                    <div key={task._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-all flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${task.priority === 'High' ? 'bg-red-50 border-red-200 text-red-700' :
                                    task.priority === 'Low' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                                }`}>
                                {task.priority} Priority
                            </span>
                            <button onClick={() => toggleTaskStatus(task)} className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-colors ${task.status === 'Completed' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}>
                                {task.status}
                            </button>
                        </div>

                        <h3 className="text-xl font-extrabold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-xs font-bold text-gray-400 mb-4">{task.category}</p>

                        {task.milestones && task.milestones.length > 0 && (
                            <div className="mb-6 flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Progress</span>
                                    <span className="text-[10px] font-black text-indigo-600">{calculateProgress(task.milestones)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full transition-all duration-500"
                                        style={{ width: `${calculateProgress(task.milestones)}%` }}
                                    ></div>
                                </div>
                                <div className="space-y-2">
                                    {task.milestones.map((m, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={m.isCompleted}
                                                onChange={() => toggleMilestone(task._id, idx)}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className={`text-xs font-medium transition-colors ${m.isCompleted ? 'line-through text-gray-400' : 'text-gray-600 group-hover:text-black'}`}>
                                                {m.text}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400">
                                📅 {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                            </span>
                            <div className="flex gap-2">
                                <button className="text-gray-400 hover:text-red-500 transition-colors" title="Remove Quest">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default ScholarsLedger;
