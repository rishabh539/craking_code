import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import API from '../services/api';

const AuthContext = createContext();

// Use sessionStorage for per-tab session isolation
// Each browser tab gets its own independent session
const STORAGE = sessionStorage;
const STORAGE_KEY = 'user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Safely read user from sessionStorage
    const getStoredUser = useCallback(() => {
        try {
            const storedUser = STORAGE.getItem(STORAGE_KEY);
            if (!storedUser) return null;
            const parsed = JSON.parse(storedUser);
            if (!parsed || !parsed.token || !parsed._id || !parsed.role) {
                STORAGE.removeItem(STORAGE_KEY);
                return null;
            }
            return parsed;
        } catch (e) {
            console.error('Failed to parse stored user:', e);
            STORAGE.removeItem(STORAGE_KEY);
            return null;
        }
    }, []);

    useEffect(() => {
        const hydrateSession = async () => {
            const storedUser = getStoredUser();
            if (!storedUser) {
                setLoading(false);
                return;
            }

            try {
                // Verify token is still valid with backend and get fresh user data
                const { data } = await API.get('/auth/me', {
                    headers: { Authorization: `Bearer ${storedUser.token}` }
                });
                // Merge fresh backend data with stored token
                const fullUser = { ...data, token: storedUser.token };
                setUser(fullUser);
                STORAGE.setItem(STORAGE_KEY, JSON.stringify(fullUser));
            } catch (error) {
                console.error('Session hydration failed:', error);
                STORAGE.removeItem(STORAGE_KEY);
                setUser(null);
            }
            setLoading(false);
        };

        hydrateSession();
    }, [getStoredUser]);

    const login = useCallback((userData) => {
        if (!userData || !userData.token || !userData._id || !userData.role) {
            console.error('Invalid user data received during login');
            return;
        }
        STORAGE.setItem(STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        // Only clears THIS tab's session — other tabs are unaffected
        STORAGE.removeItem(STORAGE_KEY);
        setUser(null);
        window.location.href = '/login';
    }, []);

    const updateUserData = useCallback((newData) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...newData };
            STORAGE.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserData, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
