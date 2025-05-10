// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\context\AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Базовий URL вашого серверного API (повинен бути в .env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Додано стан завантаження

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('Frontend: Token from localStorage in checkAuth (before trim):', token); // Для налагодження

            if (token) {
                // Видаляємо будь-які зайві пробіли (включно з новими рядками) з токена
                const trimmedToken = token.trim();
                console.log('Frontend: Token from localStorage in checkAuth (after trim):', trimmedToken); // Для налагодження

                try {
                    // Перевіряємо валідність токена на бекенді
                    const response = await axios.get(`${API_BASE_URL}/api/auth/verify-token`, {
                        headers: {
                            Authorization: `Bearer ${trimmedToken}` // ВИКОРИСТОВУЙТЕ ОБРІЗАНИЙ ТОКЕН ТУТ
                        }
                    });
                    if (response.status === 200 && response.data.isValid) {
                        setIsAuthenticated(true);
                        setUser(response.data.user); // Припускаємо, що бекенд повертає дані користувача
                    } else {
                        localStorage.removeItem('token');
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Помилка перевірки токена:', error);
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
            setLoading(false); // Завершуємо завантаження після перевірки
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            const { accessToken, user: userData } = response.data;

            console.log('Frontend Login: Received accessToken:', accessToken); // <--- ДОДАНО ЦЕЙ РЯДОК

            localStorage.setItem('token', accessToken); // Зберігаємо access token
            setIsAuthenticated(true);
            setUser(userData);
            return response.data;
        } catch (error) {
            console.error('Помилка входу:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { name: username, email, password });
            // При реєстрації сервер може повертати лише повідомлення, а не токен.
            // Якщо сервер повертає токен при реєстрації, використовуйте його так само, як у login
            // const { accessToken, user: userData } = response.data;
            // localStorage.setItem('token', accessToken);
            // setIsAuthenticated(true);
            // setUser(userData);
            return response.data; // Зазвичай при реєстрації не відбувається автоматичний вхід, тому токен не потрібен тут
        } catch (error) {
            console.error('Помилка реєстрації:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    // Показуємо спінер завантаження, поки йде перевірка автентифікації
    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">Завантаження автентифікації...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};