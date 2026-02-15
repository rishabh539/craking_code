import React, { useState, useEffect } from 'react';
import { FaBookmark, FaRegBookmark, FaDownload, FaEye } from 'react-icons/fa';
import Layout from '../components/Layout';
import API from '../services/api';

const ResourceLibrary = () => {
    const [resources, setResources] = useState([]);
    const [bookmarkedResources, setBookmarkedResources] = useState([]);
    const [filters, setFilters] = useState({
        resourceType: '',
        subject: '',
        semester: '',
        department: ''
    });
    const [activeTab, setActiveTab] = useState('all'); // all or bookmarks
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResources();
        fetchBookmarks();
    }, [filters]);

    const fetchResources = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.resourceType) params.append('resourceType', filters.resourceType);
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.semester) params.append('semester', filters.semester);
            if (filters.department) params.append('department', filters.department);

            const { data } = await API.get(`/resources?${params.toString()}`);
            setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookmarks = async () => {
        try {
            const { data } = await API.get('/resources/bookmarks/my');
            setBookmarkedResources(data);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    const handleBookmark = async (resourceId) => {
        try {
            await API.post(`/resources/${resourceId}/bookmark`);
            fetchResources();
            fetchBookmarks();
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleDownload = async (resourceId, filePath) => {
        try {
            await API.post(`/resources/${resourceId}/download`);
            // Trigger actual download
            const downloadUrl = filePath.startsWith('http') ? filePath : `${API.defaults.baseURL.replace('/api', '')}${filePath}`;
            window.open(downloadUrl, '_blank');
        } catch (error) {
            console.error('Error downloading:', error);
        }
    };

    const isBookmarked = (resourceId) => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        const resource = resources.find(r => r._id === resourceId);
        return resource?.bookmarks?.includes(user._id);
    };

    const displayResources = activeTab === 'all' ? resources : bookmarkedResources;

    if (loading) {
        return <Layout><div className="text-center">Loading...</div></Layout>;
    }

    return (
        <Layout>
            <h2 className="mb-6 text-2xl font-bold">Resource Library</h2>

            {/* Tabs */}
            <div className="flex mb-6 space-x-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600'}`}
                >
                    All Resources ({resources.length})
                </button>
                <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`pb-2 px-4 ${activeTab === 'bookmarks' ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-gray-600'}`}
                >
                    My Bookmarks ({bookmarkedResources.length})
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resource Type</label>
                    <select
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.resourceType}
                        onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="Notes">Notes</option>
                        <option value="Previous Papers">Previous Papers</option>
                        <option value="Reference Material">Reference Material</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Syllabus">Syllabus</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                        type="text"
                        placeholder="Enter subject"
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.subject}
                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <select
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.semester}
                        onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                    >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={filters.department}
                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    >
                        <option value="">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                    </select>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayResources.map((resource) => (
                    <div key={resource._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow hover:shadow-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                                <span className={`inline-block px-2 py-1 mt-1 text-xs font-semibold rounded ${resource.resourceType === 'Notes' ? 'bg-blue-100 text-blue-800' :
                                    resource.resourceType === 'Previous Papers' ? 'bg-green-100 text-green-800' :
                                        resource.resourceType === 'Reference Material' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {resource.resourceType}
                                </span>
                            </div>
                            <button
                                onClick={() => handleBookmark(resource._id)}
                                className="text-yellow-500 hover:text-yellow-600"
                            >
                                {isBookmarked(resource._id) ? <FaBookmark size={20} /> : <FaRegBookmark size={20} />}
                            </button>
                        </div>

                        <p className="mb-3 text-sm text-gray-600">{resource.description}</p>

                        <div className="mb-3 space-y-1 text-sm">
                            <p><span className="font-medium">Subject:</span> {resource.subject}</p>
                            {resource.semester && <p><span className="font-medium">Semester:</span> {resource.semester}</p>}
                            <p><span className="font-medium">Department:</span> {resource.department}</p>
                            <p><span className="font-medium">Uploaded by:</span> {resource.uploadedBy?.name}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 text-sm text-gray-500 border-t border-gray-200">
                            <div className="flex items-center space-x-3">
                                <span className="flex items-center">
                                    <FaEye className="mr-1" /> {resource.views}
                                </span>
                                <span className="flex items-center">
                                    <FaDownload className="mr-1" /> {resource.downloads}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDownload(resource._id, resource.filePath)}
                                className="px-3 py-1 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                            >
                                Download
                            </button>
                        </div>

                        {resource.tags && resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {resource.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {displayResources.length === 0 && (
                <div className="py-12 text-center text-gray-500">
                    {activeTab === 'all' ? 'No resources found with the selected filters.' : 'No bookmarked resources yet.'}
                </div>
            )}
        </Layout>
    );
};

export default ResourceLibrary;
