import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const AdminGrievances = () => {
    const [grievances, setGrievances] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState({});

    useEffect(() => {
        fetchGrievances();
        fetchFaculty();
    }, []);

    const fetchGrievances = async () => {
        try {
            const { data } = await API.get('/grievances');
            setGrievances(data);
        } catch (error) {
            console.error('Error fetching grievances', error);
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

    const handleAssign = async (grievanceId) => {
        const facultyId = selectedFaculty[grievanceId];
        if (!facultyId) return alert('Please select a Faculty member');

        try {
            await API.put(`/grievances/${grievanceId}/assign`, { facultyId });
            fetchGrievances();
            alert('Assigned successfully');
        } catch (error) {
            console.error('Error assigning', error);
            alert('Failed to assign');
        }
    };

    return (
        <Layout>
            <h2 className="mb-4 text-2xl font-bold">All Grievances</h2>
            <div className="overflow-x-auto bg-white rounded shadow">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Title</th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Submitted By</th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Assigned To</th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Status</th>
                            <th className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grievances.map((g) => (
                            <tr key={g._id}>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{g.title}</td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{g.submittedBy?.name}</td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">{g.assignedTo?.name || 'Unassigned'}</td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight text-white rounded-full 
                                        ${g.status === 'Resolved' ? 'bg-green-500' :
                                            g.status === 'Under Review' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                        <span className="relative">{g.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                    <div className="flex gap-2">
                                        <select
                                            className="px-2 py-1 border rounded"
                                            onChange={(e) => setSelectedFaculty({ ...selectedFaculty, [g._id]: e.target.value })}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Faculty</option>
                                            {faculty.map(f => (
                                                <option key={f._id} value={f._id}>{f.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleAssign(g._id)}
                                            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AdminGrievances;
