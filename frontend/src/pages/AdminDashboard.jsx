import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { FaUsers, FaClipboardList, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const AdminDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGrievances: 0,
        pendingGrievances: 0,
        resolvedGrievances: 0,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await API.get('/users/analytics');
                setStats(data);
            } catch (error) {
                console.error('Error fetching analytics', error);
            }
        };
        fetchAnalytics();
    }, []);

    const StatCard = ({ title, count, icon, color }) => (
        <div className="flex items-center p-4 bg-white rounded-lg shadow-md">
            <div className={`p-3 mr-4 text-white rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="mb-2 text-sm font-medium text-gray-600">{title}</p>
                <p className="text-lg font-semibold text-gray-700">{count}</p>
            </div>
        </div>
    );

    return (
        <Layout>
            <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
            <p className="mb-8 text-gray-600">Welcome, {user?.name}</p>

            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Users"
                    count={stats.totalUsers}
                    icon={<FaUsers className="w-6 h-6" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Grievances"
                    count={stats.totalGrievances}
                    icon={<FaClipboardList className="w-6 h-6" />}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Pending Grievances"
                    count={stats.pendingGrievances}
                    icon={<FaExclamationCircle className="w-6 h-6" />}
                    color="bg-yellow-500"
                />
                <StatCard
                    title="Resolved Grievances"
                    count={stats.resolvedGrievances}
                    icon={<FaCheckCircle className="w-6 h-6" />}
                    color="bg-green-500"
                />
            </div>
        </Layout>
    );
};

export default AdminDashboard;
