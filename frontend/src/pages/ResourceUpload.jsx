import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const ResourceUpload = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        resourceType: 'Notes',
        subject: '',
        course: '',
        semester: '',
        department: '',
        year: new Date().getFullYear(),
        tags: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [myResources, setMyResources] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMyCourses();
        fetchMyResources();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const { data } = await API.get(`/courses/faculty/${user._id}`);
            setCourses(data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchMyResources = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            const { data } = await API.get(`/resources?uploadedBy=${user._id}`);
            setMyResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setMessage('Error: Please select a PDF file to upload');
            return;
        }

        setLoading(true);

        try {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            const data = new FormData();
            data.append('resourceFile', selectedFile);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('resourceType', formData.resourceType);
            data.append('subject', formData.subject);
            data.append('department', formData.department);
            data.append('year', formData.year);
            if (formData.course) data.append('course', formData.course);
            if (formData.semester) data.append('semester', formData.semester);
            tagsArray.forEach(tag => data.append('tags', tag));

            await API.post('/resources', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Resource uploaded successfully! Waiting for admin approval.');
            setFormData({
                title: '',
                description: '',
                resourceType: 'Notes',
                subject: '',
                course: '',
                semester: '',
                department: '',
                year: new Date().getFullYear(),
                tags: ''
            });
            setSelectedFile(null);
            fetchMyResources();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error uploading resource');
        } finally {
            setLoading(false);
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

    return (
        <Layout>
            <h2 className="mb-6 text-2xl font-bold">Upload Academic Resource</h2>

            {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Resource Type *</label>
                            <select
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.resourceType}
                                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                            >
                                <option value="Notes">Notes</option>
                                <option value="Previous Papers">Previous Papers</option>
                                <option value="Reference Material">Reference Material</option>
                                <option value="Assignment">Assignment</option>
                                <option value="Syllabus">Syllabus</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subject *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course (Optional)</label>
                            <select
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.course}
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            >
                                <option value="">Select Course</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseCode} - {course.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Semester</label>
                            <select
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.semester}
                                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            >
                                <option value="">Select Semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Department *</label>
                            <select
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            >
                                <option value="">Select Department</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Civil">Civil</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Year</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resource File (PDF Only) *</label>
                        <input
                            type="file"
                            required
                            accept="application/pdf"
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                        <p className="mt-1 text-xs text-gray-500 font-bold text-indigo-600">Select a PDF file to store on institutional servers.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="e.g., algorithms, data structures, important"
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Uploading...' : 'Upload Resource'}
                    </button>
                </form>
            </div>

            {/* My Uploaded Resources */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
                <h3 className="mb-4 text-lg font-semibold">My Uploaded Resources</h3>
                {myResources.length === 0 ? (
                    <p className="text-gray-500">No resources uploaded yet.</p>
                ) : (
                    <div className="space-y-3">
                        {myResources.map((resource) => (
                            <div key={resource._id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                                <div>
                                    <h4 className="font-medium">{resource.title}</h4>
                                    <p className="text-sm text-gray-600">{resource.subject} - {resource.resourceType}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(resource.approvalStatus)}`}>
                                    {resource.approvalStatus}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ResourceUpload;
