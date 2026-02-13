import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaFileAlt, FaFileUpload, FaUsers, FaSignOutAlt, FaBullhorn } from 'react-icons/fa';

const Sidebar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
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
                                <Link to="/student/grievances" className={linkClass('/student/grievances')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">My Grievances</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/student/notes" className={linkClass('/student/notes')}>
                                    <FaFileAlt className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Academic Notes</span>
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
                            <li>
                                <Link to="/faculty/notes" className={linkClass('/faculty/notes')}>
                                    <FaFileUpload className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                                    <span className="ml-3">Upload Notes</span>
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
