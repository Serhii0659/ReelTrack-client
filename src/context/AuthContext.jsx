import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const AUTH_TOKEN_KEY = 'authToken';
    const REFRESH_TOKEN_KEY = 'refreshToken';

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

            if (!token && !refreshToken) {
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsAuthenticated(true);
                setUser(response.data);
            } catch (error) {
                if (error.response?.status === 401 && refreshToken) {
                    try {
                        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
                        localStorage.setItem(AUTH_TOKEN_KEY, refreshResponse.data.accessToken);
                        localStorage.setItem(REFRESH_TOKEN_KEY, refreshResponse.data.refreshToken);

                        setIsAuthenticated(true);
                        const userResponse = await axios.get(`${API_BASE_URL}/api/users/profile`, {
                            headers: { Authorization: `Bearer ${refreshResponse.data.accessToken}` }
                        });
                        setUser(userResponse.data);
                    } catch {
                        logout();
                    }
                } else {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const { accessToken, refreshToken, user: userData } = response.data;
            localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            setIsAuthenticated(true);
            setUser(userData);
            return response.data;
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { name: username, email, password });
        return response.data;
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            if (refreshToken) {
                await axios.post(`${API_BASE_URL}/api/auth/logout`, { refreshToken });
            }
        } catch {
            // Ignore backend logout errors
        } finally {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem('authUser');
            setIsAuthenticated(false);
            setUser(null);
            navigate('/login');
        }
    };

    const contextValue = {
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        setUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
