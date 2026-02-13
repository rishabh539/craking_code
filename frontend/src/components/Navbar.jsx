import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    return (
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-indigo-600">AEGIS Portal</span>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center ml-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                                <FaUserCircle className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
