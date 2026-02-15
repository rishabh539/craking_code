import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import API from '../services/api';

const StudentOpportunities = () => {
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOpp, setSelectedOpp] = useState(null);
    const [showApplyModal, setShowApplyModal] = useState(false);

    // Application Form
    const [resume, setResume] = useState(null);
    const [coverLetter, setCoverLetter] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [message, setMessage] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        category: '',
        department: '',
        stipend: false,
        search: ''
    });

    useEffect(() => {
        fetchOpportunities();
    }, [filters]);

    const fetchOpportunities = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.department) params.append('department', filters.department);
            if (filters.stipend) params.append('stipend', 'true');
            if (filters.search) params.append('search', filters.search);

            const { data } = await API.get(`/opportunities?${params.toString()}`);
            setOpportunities(data);
        } catch (error) {
            console.error('Error fetching opportunities', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('opportunityId', selectedOpp._id);
            formData.append('resume', resume);
            formData.append('coverLetter', coverLetter);
            formData.append('portfolio', portfolio);

            await API.post('/applications', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Application submitted successfully!');
            setShowApplyModal(false);
            setResume(null);
            setCoverLetter('');
            setPortfolio('');
        } catch (error) {
            setMessage('Error: ' + (error.response?.data?.message || 'Failed to submit'));
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-indigo-900">Opportunities Hub</h2>
                <p className="text-gray-600 mt-2">Discover internships, research papers, and faculty-led projects.</p>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <input
                    type="text"
                    placeholder="Search by title or skill..."
                    className="p-2 border rounded-lg"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
                <select
                    className="p-2 border rounded-lg"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                    <option value="">All Categories</option>
                    <option value="Internship">Internship</option>
                    <option value="Research">Research</option>
                    <option value="Project">Project</option>
                </select>
                <select
                    className="p-2 border rounded-lg"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Mechanical">Mechanical</option>
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.stipend}
                        onChange={(e) => setFilters({ ...filters, stipend: e.target.checked })}
                    />
                    <span className="text-sm font-medium">Stipend Available</span>
                </label>
            </div>

            {/* Opportunity Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? <p>Loading opportunities...</p> : opportunities.map(opp => (
                    <div key={opp._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                        <div className="flex justify-between mb-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">{opp.category}</span>
                            <span className="text-xs font-bold text-emerald-600">{opp.stipend === 'Unpaid' ? 'Unpaid' : 'Stipend: ' + opp.stipend}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{opp.description}</p>

                        <div className="mt-auto space-y-3">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {opp.requiredSkills.map(skill => (
                                    <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded uppercase tracking-wider">{skill}</span>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{opp.postedBy?.name}</p>
                                    <p className="text-[10px] text-gray-500">{opp.department}</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedOpp(opp); setShowApplyModal(true); }}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Application Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">Apply for {selectedOpp.title}</h3>
                            <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
                        </div>

                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resume (Required - PDF/Image)</label>
                                <input
                                    type="file"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                    onChange={(e) => setResume(e.target.files[0])}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Link to GitHub, Behance, etc."
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={portfolio}
                                    onChange={(e) => setPortfolio(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter / Why should we pick you?</label>
                                <textarea
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    rows="4"
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">Submit Application</button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default StudentOpportunities;
