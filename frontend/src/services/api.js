import axios from 'axios';
// import { toast } from 'react-hot-toast'; // Optional: for user feedback

const BASE_URL = import.meta.env.PROD
    ? 'https://craking-backend.onrender.com/api'
    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
API.interceptors.request.use((req) => {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
        const user = sessionStorage.getItem('user');
        if (user) {
            const { token } = JSON.parse(user);
            req.headers.Authorization = `Bearer ${token}`;
        }
    }
    return req;
});

// Response interceptor for error handling
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
            // toast.error('Request timed out. Please try again.');
        }
        else if (error.response?.status === 401) {
            sessionStorage.removeItem('user');
            // Use window.location only if not already on login page to avoid loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
