import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const FacultyGrievances = () => {
    const [grievances, setGrievances] = useState([]);

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const { data } = await API.get('/grievances/assigned');
            setGrievances(data);
        } catch (error) {
            console.error('Error fetching grievances', error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await API.put(`/grievances/${id}/status`, { status });
            fetchGrievances();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">Assigned Grievances</h2>
            <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                Title
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                Submitted By
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                Status
                            </th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {grievances.map((grievance) => (
                            <tr key={grievance._id}>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <p className="text-gray-900 whitespace-no-wrap">{grievance.title}</p>
                                    <p className="text-gray-600 whitespace-no-wrap text-xs">{grievance.description}</p>
                                </td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <p className="text-gray-900 whitespace-no-wrap">{grievance.submittedBy?.name}</p>
                                </td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight text-white rounded-full 
                                        ${grievance.status === 'Resolved' ? 'bg-green-500' :
                                            grievance.status === 'Under Review' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                        <span className="relative">{grievance.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    {grievance.status !== 'Resolved' && (
                                        <div className="flex gap-2">
                                            {grievance.status !== 'Under Review' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(grievance._id, 'Under Review')}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    Mark Review
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleStatusUpdate(grievance._id, 'Resolved')}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Mark Resolved
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default FacultyGrievances;
