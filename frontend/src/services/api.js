import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
});

// Track if we're already redirecting to prevent multiple 401 redirects
let isRedirecting = false;

// Add a request interceptor to include the token in headers
// Reads from sessionStorage (per-tab isolated) instead of localStorage
API.interceptors.request.use(
    (config) => {
        try {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (error) {
            console.error('Failed to parse user from sessionStorage:', error);
            sessionStorage.removeItem('user');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only redirect once per tab, prevents race condition with multiple 401s
            if (!isRedirecting) {
                isRedirecting = true;
                sessionStorage.removeItem('user');
                setTimeout(() => {
                    window.location.href = '/login';
                    setTimeout(() => { isRedirecting = false; }, 2000);
                }, 100);
            }
        }
        return Promise.reject(error);
    }
);

export default API;
