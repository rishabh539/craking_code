import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const AcademicCalendar = () => {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCalendar();
    }, []);

    const fetchCalendar = async () => {
        try {
            const { data } = await API.get('/calendar/my');
            setEvents(data);
        } catch (error) {
            console.error('Error fetching calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventTypeColor = (type) => {
        const colors = {
            'Exam': 'bg-red-100 text-red-800 border-red-300',
            'Assignment': 'bg-blue-100 text-blue-800 border-blue-300',
            'Holiday': 'bg-green-100 text-green-800 border-green-300',
            'Institutional': 'bg-purple-100 text-purple-800 border-purple-300',
            'Class': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Other': 'bg-gray-100 text-gray-800 border-gray-300'
        };
        return colors[type] || colors['Other'];
    };

    const filteredEvents = filter === 'all'
        ? events
        : events.filter(e => e.eventType === filter);

    const upcomingEvents = filteredEvents.filter(e => new Date(e.eventDate) >= new Date());
    const pastEvents = filteredEvents.filter(e => new Date(e.eventDate) < new Date());

    if (loading) {
        return <Layout><div className="text-center">Loading...</div></Layout>;
    }

    return (
        <Layout>
            <h2 className="mb-6 text-2xl font-bold">Academic Calendar</h2>

            {/* Filter */}
            <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Filter by Event Type</label>
                <select
                    className="w-full px-3 py-2 border border-gray-300 rounded md:w-64 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Events</option>
                    <option value="Exam">Exams</option>
                    <option value="Assignment">Assignments</option>
                    <option value="Holiday">Holidays</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Class">Classes</option>
                </select>
            </div>

            {/* Upcoming Events */}
            <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold">Upcoming Events</h3>
                {upcomingEvents.length === 0 ? (
                    <p className="text-gray-500">No upcoming events.</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                            <div
                                key={event._id}
                                className={`p-4 border-l-4 rounded ${getEventTypeColor(event.eventType)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-semibold">{event.title}</h4>
                                            <span className="px-2 py-1 text-xs font-semibold rounded bg-white/50">
                                                {event.eventType}
                                            </span>
                                        </div>
                                        {event.description && (
                                            <p className="mt-1 text-sm">{event.description}</p>
                                        )}
                                        {event.course && (
                                            <p className="mt-1 text-sm font-medium">
                                                Course: {event.course.courseCode} - {event.course.courseName}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-4 text-right">
                                        <p className="text-sm font-semibold">
                                            {new Date(event.eventDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {event.endDate && (
                                            <p className="text-xs text-gray-600">
                                                to {new Date(event.endDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Events */}
            <div>
                <h3 className="mb-4 text-xl font-semibold text-gray-600">Past Events</h3>
                {pastEvents.length === 0 ? (
                    <p className="text-gray-500">No past events.</p>
                ) : (
                    <div className="space-y-3 opacity-60">
                        {pastEvents.slice(0, 10).map((event) => (
                            <div
                                key={event._id}
                                className={`p-3 border-l-4 rounded ${getEventTypeColor(event.eventType)}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{event.title}</h4>
                                        {event.course && (
                                            <p className="text-sm">
                                                {event.course.courseCode}
                                            </p>
                                        )}
                                    </div>
                                    <p className="ml-4 text-sm">
                                        {new Date(event.eventDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AcademicCalendar;
