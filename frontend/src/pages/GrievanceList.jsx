import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';
import { Link } from 'react-router-dom';

const GrievanceList = () => {
    const [grievances, setGrievances] = useState([]);

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const { data } = await API.get('/grievances/my');
                setGrievances(data);
            } catch (error) {
                console.error('Error fetching grievances', error);
            }
        };
        fetchGrievances();
    }, []);

    return (
        <Layout>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">My Grievances</h2>
                <Link to="/student/submit-grievance" className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700">
                    Submit New
                </Link>
            </div>
            <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                Title
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                Status
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {grievances.map((grievance) => (
                            <tr key={grievance._id}>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <p className="text-gray-900 whitespace-no-wrap">{grievance.title}</p>
                                </td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight text-white rounded-full 
                                        ${grievance.status === 'Resolved' ? 'bg-green-500' :
                                            grievance.status === 'Under Review' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                        <span className="relative">{grievance.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <p className="text-gray-900 whitespace-no-wrap">{new Date(grievance.createdAt).toLocaleDateString()}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default GrievanceList;
