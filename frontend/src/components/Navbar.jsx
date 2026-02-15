import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-indigo-600">AEGIS Portal</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationDropdown />
                        <div className="flex items-center">
                            <div className="flex items-center ml-3">
                                <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300">
                                    <span className="sr-only">Open user menu</span>
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                        {user?.name?.charAt(0)}
                                    </div>
                                </button>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
