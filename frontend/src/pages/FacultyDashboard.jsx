import React from 'react';
import Layout from '../components/Layout';

const FacultyDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <Layout>
            <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
            <p className="mt-4">Welcome, {user?.name}</p>
        </Layout>
    );
};

export default FacultyDashboard;
