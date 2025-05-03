import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance'; // Створимо цей файл далі
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true); // Для перевірки початкового стану
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                setToken(storedToken);
                // TODO: Додати запит для перевірки валідності токена на бекенді
                // та отримання актуальних даних користувача.
                // Наприклад, створити ендпоінт /api/auth/me
                // Поки що розкодуємо токен (не найнадійніший спосіб без перевірки)
                try {
                    // Дуже спрощено: припускаємо, що якщо токен є, то користувач валідний
                    // В реальному додатку потрібна перевірка токена на бекенді!
                    const storedUser = localStorage.getItem('authUser');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    } else {
                        // Якщо користувача немає в localStorage, але є токен - треба отримати дані
                        // Або просто видалити токен, якщо немає ендпоінту /me
                        logout(); // Простіший варіант поки що
                    }
                } catch (error) {
                    console.error("Error decoding token or fetching user data:", error);
                    logout(); // Вийти, якщо токен недійсний або дані не отримано
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });

            // Зберігаємо токени та дані користувача
            localStorage.setItem('authToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('authUser', JSON.stringify(response.data.user));

            setToken(response.data.accessToken);
            setUser(response.data.user);
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            alert('Login failed: ' + (error.response?.data?.message || error.message));
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authUser');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        try {
            await axiosInstance.post('/auth/register', { name, email, password });
            // Після успішної реєстрації можна автоматично логінити або перенаправляти на логін
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.message || error.message);
            alert('Registration failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await axiosInstance.post('/auth/logout', { refreshToken });
            } catch (error) {
                console.error('Logout failed:', error.response?.data?.message || error.message);
            }
        }

        // Очищаємо локальні дані
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    const isAuthenticated = !!token && !!user; // Вважаємо автентифікованим, якщо є токен І дані користувача

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, register, loading }}>
            {!loading && children} {/* Показуємо додаток тільки після завершення перевірки */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};