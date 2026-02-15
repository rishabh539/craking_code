import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import Layout from '../components/Layout';
import API from '../services/api';

const ResourceApproval = () => {
    const [resources, setResources] = useState([]);
    const [filter, setFilter] = useState('Pending');
    const [selectedResource, setSelectedResource] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
    }, [filter]);

    const fetchResources = async () => {
        try {
            const { data } = await API.get(`/resources?approvalStatus=${filter}`);
            setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (resourceId) => {
        try {
            await API.put(`/resources/${resourceId}/approve`, {
                status: 'Approved'
            });
            fetchResources();
            setSelectedResource(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Error approving resource');
        }
    };

    const handleReject = async (resourceId) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            await API.put(`/resources/${resourceId}/approve`, {
                status: 'Rejected',
                rejectionReason
            });
            fetchResources();
            setSelectedResource(null);
            setRejectionReason('');
        } catch (error) {
            alert(error.response?.data?.message || 'Error rejecting resource');
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            'Approved': 'bg-green-100 text-green-800',
            'Pending': 'bg-yellow-100 text-yellow-800',
            'Rejected': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return <Layout><div className="text-center">Loading...</div></Layout>;
    }

    return (
        <Layout>
            <h2 className="mb-6 text-2xl font-bold">Resource Approval</h2>

            {/* Filter Tabs */}
            <div className="flex mb-6 space-x-4 border-b border-gray-200">
                <button
                    onClick={() => setFilter('Pending')}
                    className={`pb-2 px-4 ${filter === 'Pending' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600'}`}
                >
                    Pending ({resources.filter(r => r.approvalStatus === 'Pending').length})
                </button>
                <button
                    onClick={() => setFilter('Approved')}
                    className={`pb-2 px-4 ${filter === 'Approved' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600'}`}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('Rejected')}
                    className={`pb-2 px-4 ${filter === 'Rejected' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600'}`}
                >
                    Rejected
                </button>
            </div>

            {/* Resources Table */}
            <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Subject</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Uploaded By</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {resources.map((resource) => (
                            <tr key={resource._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{resource.title}</div>
                                    <div className="text-sm text-gray-500">{resource.description.substring(0, 50)}...</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold bg-blue-100 rounded text-blue-800">
                                        {resource.resourceType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{resource.subject}</div>
                                    <div className="text-sm text-gray-500">Sem {resource.semester || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{resource.uploadedBy?.name}</div>
                                    <div className="text-sm text-gray-500">{resource.uploadedBy?.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(resource.approvalStatus)}`}>
                                        {resource.approvalStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                    <button
                                        onClick={() => setSelectedResource(resource)}
                                        className="mr-3 text-indigo-600 hover:text-indigo-900"
                                    >
                                        <FaEye className="inline" /> View
                                    </button>
                                    {resource.approvalStatus === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(resource._id)}
                                                className="mr-3 text-green-600 hover:text-green-900"
                                            >
                                                <FaCheck className="inline" /> Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedResource(resource);
                                                    setRejectionReason('');
                                                }}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FaTimes className="inline" /> Reject
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {resources.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        No {filter.toLowerCase()} resources found.
                    </div>
                )}
            </div>

            {/* Resource Detail Modal */}
            {selectedResource && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl">
                        <h3 className="mb-4 text-xl font-bold">{selectedResource.title}</h3>

                        <div className="mb-4 space-y-2">
                            <p><span className="font-medium">Description:</span> {selectedResource.description}</p>
                            <p><span className="font-medium">Resource Type:</span> {selectedResource.resourceType}</p>
                            <p><span className="font-medium">Subject:</span> {selectedResource.subject}</p>
                            <p><span className="font-medium">Department:</span> {selectedResource.department}</p>
                            {selectedResource.semester && <p><span className="font-medium">Semester:</span> {selectedResource.semester}</p>}
                            <p><span className="font-medium">Uploaded By:</span> {selectedResource.uploadedBy?.name} ({selectedResource.uploadedBy?.email})</p>
                            <p><span className="font-medium">File Path:</span> <a href={selectedResource.filePath} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{selectedResource.filePath}</a></p>
                            {selectedResource.tags && selectedResource.tags.length > 0 && (
                                <p><span className="font-medium">Tags:</span> {selectedResource.tags.join(', ')}</p>
                            )}
                        </div>

                        {selectedResource.approvalStatus === 'Pending' && (
                            <div className="pt-4 border-t border-gray-200">
                                <label className="block mb-2 text-sm font-medium text-gray-700">Rejection Reason (if rejecting)</label>
                                <textarea
                                    className="w-full px-3 py-2 mb-3 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    rows="3"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                ></textarea>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleApprove(selectedResource._id)}
                                        className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                                    >
                                        <FaCheck className="inline mr-1" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedResource._id)}
                                        className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                                    >
                                        <FaTimes className="inline mr-1" /> Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedResource(null);
                                            setRejectionReason('');
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedResource.approvalStatus !== 'Pending' && (
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ResourceApproval;
