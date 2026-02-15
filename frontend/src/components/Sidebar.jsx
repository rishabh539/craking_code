import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FaHome,
    FaFileAlt,
    FaFileUpload,
    FaBullhorn,
    FaBriefcase,
    FaUsers,
    FaSignOutAlt,
    FaTasks,
    FaLightbulb
} from 'react-icons/fa';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
    };

    const isActive = (path) => location.pathname === path;

    const linkClass = (path) => `flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group ${isActive(path) ? 'bg-gray-200' : ''}`;

    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0">
            <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
                <ul className="space-y-2 font-medium">
                    {user?.role === 'student' && (
                        <>
                            <li>
                                <Link to="/student" className={linkClass('/student')}>
                                    <FaHome className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/ledger" className={linkClass('/student/ledger')}>
                                    <FaTasks className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Scholar's Ledger</span>
                                </Link>
                            </li>

                            {/* Academic Section */}
                            <li className="pt-4 mt-4 border-t border-gray-200">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Academic</p>
                            </li>
                            <li>
                                <Link to="/student/courses/enroll" className={linkClass('/student/courses/enroll')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Enroll in Courses</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/courses/my" className={linkClass('/student/courses/my')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">My Courses</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/attendance" className={linkClass('/student/attendance')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">My Attendance</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/calendar" className={linkClass('/student/calendar')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Calendar</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/resources" className={linkClass('/student/resources')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Resource Library</span>
                                </Link>
                            </li>

                            {/* Opportunities Section */}
                            <li className="pt-4 mt-4 border-t border-gray-200">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Opportunities</p>
                            </li>
                            <li>
                                <Link to="/student/opportunities" className={linkClass('/student/opportunities')}>
                                    <FaLightbulb className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Opportunity Hub</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/applications" className={linkClass('/student/applications')}>
                                    <FaBriefcase className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Applied Jobs/Projects</span>
                                </Link>
                            </li>

                            {/* Grievance Section */}
                            <li className="pt-4 mt-4 border-t border-gray-200">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Grievances</p>
                            </li>
                            <li>
                                <Link to="/student/submit-grievance" className={linkClass('/student/submit-grievance')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Submit Grievance</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/grievances" className={linkClass('/student/grievances')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">My Grievances</span>
                                </Link>
                            </li>
                        </>
                    )}

                    {user?.role === 'faculty' && (
                        <>
                            <li>
                                <Link to="/faculty" className={linkClass('/faculty')}>
                                    <FaHome className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Dashboard</span>
                                </Link>
                            </li>

                            {/* Academic Section */}
                            <li className="pt-4 mt-4 border-t border-gray-200">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Academic</p>
                            </li>
                            <li>
                                <Link to="/faculty/courses" className={linkClass('/faculty/courses')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">My Courses</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faculty/attendance" className={linkClass('/faculty/attendance')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Attendance</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faculty/resources" className={linkClass('/faculty/resources')}>
                                    <FaFileUpload className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Upload Resources</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faculty/events" className={linkClass('/faculty/events')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Event Management</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faculty/announcements" className={linkClass('/faculty/announcements')}>
                                    <FaBullhorn className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Announcements</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faculty/opportunities" className={linkClass('/faculty/opportunities')}>
                                    <FaBriefcase className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Opportunity Board</span>
                                </Link>
                            </li>

                            {/* Grievance Section */}
                            <li className="pt-4 mt-4 border-t border-gray-200">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Grievances</p>
                            </li>
                            <li>
                                <Link to="/faculty/grievances" className={linkClass('/faculty/grievances')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Assigned Grievances</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/faculty/report" className={linkClass('/faculty/report')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Report Issue</span>
                                </Link>
                            </li>
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <>
                            <li>
                                <Link to="/admin" className={linkClass('/admin')}>
                                    <FaHome className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Dashboard</span>
                                </Link>
                            </li>

                            {/* Academic Section */}
                            <li className="pt-4 mt-4 border-t border-gray-200">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">Academic</p>
                            </li>
                            <li>
                                <Link to="/admin/courses" className={linkClass('/admin/courses')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Manage Courses</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/resources" className={linkClass('/admin/resources')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Resource Approval</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/events" className={linkClass('/admin/events')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Event Management</span>
                                </Link>
                            </li>

                            {/* System Section */}
                            <li className="pt-4 mt-4 border-t border-gray-200">
                                <p className="px-2 text-xs font-semibold text-gray-400 uppercase">System</p>
                            </li>
                            <li>
                                <Link to="/admin/users" className={linkClass('/admin/users')}>
                                    <FaUsers className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Manage Users</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/grievances" className={linkClass('/admin/grievances')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">All Grievances</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/admin/announcements" className={linkClass('/admin/announcements')}>
                                    <FaBullhorn className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Announcements</span>
                                </Link>
                            </li>
                        </>
                    )}

                    <li>
                        <button onClick={handleLogout} className="flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
                            <FaSignOutAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                            <span className="ml-3">Logout</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
