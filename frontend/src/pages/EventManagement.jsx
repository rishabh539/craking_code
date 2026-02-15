import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Layout from '../components/Layout';
import API from '../services/api';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventDate: '',
        endDate: '',
        eventType: 'Class',
        visibility: 'All',
        courseId: '',
        department: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchEvents();
        fetchCourses();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await API.get('/calendar');
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user'));
            if (user.role === 'faculty') {
                const { data } = await API.get(`/courses/faculty/${user._id}`);
                setCourses(data);
            } else {
                const { data } = await API.get('/courses');
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const eventPayload = {
                ...formData,
                course: formData.courseId || null
            };

            if (editingEvent) {
                await API.put(`/calendar/${editingEvent._id}`, eventPayload);
                setMessage('Event updated successfully!');
            } else {
                await API.post('/calendar', eventPayload);
                setMessage('Event created successfully!');
            }

            resetForm();
            fetchEvents();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error saving event');
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            eventDate: event.eventDate.split('T')[0],
            endDate: event.endDate ? event.endDate.split('T')[0] : '',
            eventType: event.eventType,
            visibility: event.visibility,
            courseId: event.course?._id || '',
            department: event.department || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            await API.delete(`/calendar/${eventId}`);
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting event');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            eventDate: '',
            endDate: '',
            eventType: 'Class',
            visibility: 'All',
            courseId: '',
            department: ''
        });
        setEditingEvent(null);
        setShowForm(false);
    };

    const getEventTypeBadge = (type) => {
        const colors = {
            'Exam': 'bg-red-100 text-red-800',
            'Assignment': 'bg-yellow-100 text-yellow-800',
            'Holiday': 'bg-green-100 text-green-800',
            'Institutional': 'bg-blue-100 text-blue-800',
            'Class': 'bg-purple-100 text-purple-800',
            'Other': 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Event Management</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                    <FaPlus className="mr-2" /> {showForm ? 'Cancel' : 'Create Event'}
                </button>
            </div>

            {message && (
                <div className={`mb-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Event Form */}
            {showForm && (
                <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow">
                    <h3 className="mb-4 text-lg font-semibold">{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
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
                                <label className="block text-sm font-medium text-gray-700">Event Type *</label>
                                <select
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.eventType}
                                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                                >
                                    <option value="Class">Class</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Assignment">Assignment</option>
                                    <option value="Holiday">Holiday</option>
                                    <option value="Institutional">Institutional</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Event Date *</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.eventDate}
                                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Visibility *</label>
                                <select
                                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.visibility}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                >
                                    <option value="All">All Students</option>
                                    <option value="Course-Specific">Course-Specific</option>
                                    <option value="Department">Department</option>
                                </select>
                            </div>
                            {formData.visibility === 'Course-Specific' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Course *</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.courseCode} - {course.courseName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {formData.visibility === 'Department' && (
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
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="submit"
                                className="px-6 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                            >
                                {editingEvent ? 'Update Event' : 'Create Event'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Events List */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
                <h3 className="mb-4 text-lg font-semibold">All Events</h3>
                {events.length === 0 ? (
                    <p className="text-gray-500">No events created yet.</p>
                ) : (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div key={event._id} className="flex items-center justify-between p-4 border border-gray-200 rounded hover:bg-gray-50">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h4 className="mr-3 text-lg font-medium">{event.title}</h4>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getEventTypeBadge(event.eventType)}`}>
                                            {event.eventType}
                                        </span>
                                    </div>
                                    <p className="mb-2 text-sm text-gray-600">{event.description}</p>
                                    <div className="flex space-x-4 text-sm text-gray-500">
                                        <span>📅 {new Date(event.eventDate).toLocaleDateString()}</span>
                                        <span>👁️ {event.visibility}</span>
                                        {event.course && <span>📚 {event.course.courseCode}</span>}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default EventManagement;
