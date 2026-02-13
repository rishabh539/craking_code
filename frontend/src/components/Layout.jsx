import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <Sidebar />
            <div className="p-4 sm:ml-64 pt-20">
                {children}
            </div>
        </div>
    );
};

export default Layout;
