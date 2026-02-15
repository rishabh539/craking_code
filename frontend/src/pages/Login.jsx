import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUser, FaLock, FaArrowRight, FaUniversity } from 'react-icons/fa';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { data } = await API.post('/auth/login', { identifier, password });
            login(data);

            // Add a small delay for smoother transition
            setTimeout(() => {
                if (data.role === 'admin') navigate('/admin');
                else if (data.role === 'faculty') navigate('/faculty');
                else navigate('/student');
            }, 500);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-hidden">
            {/* Left Side - Brand & Visuals */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-800 to-indigo-900 opacity-90"></div>

                {/* Descriptive Background Circles */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500 opacity-20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

                <div className="relative z-10 text-white max-w-xl">
                    <div className="mb-8 inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                        <FaUniversity className="text-indigo-200" />
                        <span className="text-sm font-bold tracking-widest uppercase text-indigo-100">Official Portal</span>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter mb-6 leading-tight">
                        AEGIS <br />
                        <span className="text-indigo-200">Academic Suite</span>
                    </h1>
                    <p className="text-xl text-indigo-100 mb-10 leading-relaxed font-light">
                        The unified platform for academic management. Access courses, track progress, and manage institutional resources with precision.
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="font-bold text-lg mb-1">Secure Access</h3>
                            <p className="text-xs text-indigo-200 opacity-70">Role-based encrypted session handling.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="font-bold text-lg mb-1">Real-time Sync</h3>
                            <p className="text-xs text-indigo-200 opacity-70">Live academic ledger and event tracking.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 relative z-20">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4 shadow-sm">
                            <FaGraduationCap />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-gray-500 text-sm font-medium">Please enter your credentials to access the vault.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Identity</label>
                            <div className="relative group">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Roll Number / Employee ID"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-400 hover:border-gray-200"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Passcode</label>
                            <div className="relative group">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-400 hover:border-gray-200"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <a href="#" className="text-xs font-black text-indigo-500 hover:underline uppercase tracking-wide">Forgot Credentials?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Secure Login <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            New to the Institution?{' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                                Register Identity
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
