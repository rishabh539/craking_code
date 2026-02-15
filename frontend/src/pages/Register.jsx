import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaBuilding, FaIdCard, FaArrowRight, FaUniversity } from 'react-icons/fa';

const Register = () => {
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [rollNumber, setRollNumber] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [department, setDepartment] = useState('Computer Science');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. Domain validation
        if (!email.endsWith('@college.edu')) {
            return setError('Registration allowed only for @college.edu email addresses');
        }

        // 2. Password matching
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        // 3. ID validation
        if (role === 'student' && !rollNumber) {
            return setError('Roll number is required');
        }
        if ((role === 'faculty' || role === 'admin') && !employeeId) {
            return setError('Employee ID is required');
        }

        setIsLoading(true);

        try {
            const payload = {
                name,
                email,
                password,
                role,
                department,
                ...(role === 'student' ? { rollNumber } : { employeeId })
            };

            const { data } = await API.post('/auth/register', payload);
            login(data);

            setTimeout(() => {
                if (data.role === 'admin') navigate('/admin');
                else if (data.role === 'faculty') navigate('/faculty');
                else navigate('/student');
            }, 500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-hidden">
            {/* Left Side - Brand & Visuals */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-950 to-black opacity-90"></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500 opacity-5 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl"></div>

                <div className="relative z-10 text-white max-w-xl">
                    <div className="mb-8 inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                        <FaUniversity className="text-emerald-400" />
                        <span className="text-sm font-bold tracking-widest uppercase text-emerald-100">Join the Network</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter mb-6 leading-tight">
                        Begin Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Academic Journey</span>
                    </h1>
                    <p className="text-lg text-gray-300 mb-10 leading-relaxed font-light">
                        Create your institutional identity. Connect with the campus ecosystem, track your growth, and access world-class resources.
                    </p>

                    <div className="space-y-4">
                        {[
                            { title: 'Student Access', desc: 'Course enrollment, assignments, and grievance support.' },
                            { title: 'Faculty & Admin', desc: 'Academic management, resource control, and oversight.' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">✓</div>
                                <div>
                                    <h4 className="font-bold text-white mb-0.5">{item.title}</h4>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-lg bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative z-20">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create Identity</h2>
                        <p className="text-gray-500 text-sm font-medium">Enter your details to register in the portal.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                            <span className="text-lg">⚠️</span> {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Name & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative group">
                                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-700 text-sm"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">College Email</label>
                                <div className="relative group">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="user@college.edu"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-700 text-sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role & Dept */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Role</label>
                                <div className="relative">
                                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 text-sm appearance-none cursor-pointer"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    >
                                        <option value="student">Student</option>
                                        <option value="faculty">Faculty</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                                <div className="relative">
                                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 text-sm appearance-none cursor-pointer"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    >
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                        <option value="Administration">Administration</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* ID */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                {role === 'student' ? 'Roll Number' : 'Employee ID'}
                            </label>
                            <div className="relative group">
                                <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    placeholder={role === 'student' ? 'e.g. 2024CS101' : 'e.g. EMP404'}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-700 text-sm"
                                    value={role === 'student' ? rollNumber : employeeId}
                                    onChange={(e) => role === 'student' ? setRollNumber(e.target.value) : setEmployeeId(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-700 text-sm"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                                <div className="relative group">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-gray-700 text-sm"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Complete Registration <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            Already have an identity?{' '}
                            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                Secure Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
