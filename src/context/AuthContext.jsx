import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Імпортуємо useNavigate для перенаправлення

// 1. Створюємо контекст і експортуємо його як іменований експорт.
// Це виправляє помилку "doesn't provide an export named: 'AuthContext'".
export const AuthContext = createContext(null);

// Базовий URL вашого серверного API (повинен бути в .env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Стан завантаження при перевірці автентифікації
    const navigate = useNavigate(); // Ініціалізуємо useNavigate

    // --- ВИКОРИСТОВУЙТЕ ЦІ КЛЮЧІ ПОСЛІДОВНО ---
    const AUTH_TOKEN_KEY = 'authToken'; // Ключ для access token
    const REFRESH_TOKEN_KEY = 'refreshToken'; // Ключ для refresh token
    // --- ---

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true); // Починаємо завантаження
            // --- ВИКОРИСТОВУЙТЕ ПРАВИЛЬНІ КЛЮЧІ ---
            const token = localStorage.getItem(AUTH_TOKEN_KEY);
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            // --- ---

            console.log('AuthContext: Перевірка автентифікації...');
            console.log(`AuthContext: Знайдено ${AUTH_TOKEN_KEY} у localStorage:`, token ? 'Так' : 'Ні');
            console.log(`AuthContext: Знайдено ${REFRESH_TOKEN_KEY} у localStorage:`, refreshToken ? 'Так' : 'Ні');

            if (!token && !refreshToken) {
                // Немає токенів, користувач не автентифікований
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
                console.log('AuthContext: Токени відсутні. Користувач не автентифікований.');
                return;
            }

            // Спробувати використати існуючий токен або оновити його
            try {
                // Спробувати отримати профіль користувача з поточним токеном
                // Це захищений ендпоінт (/api/users/profile), який вимагає валідний accessToken
                const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
                    headers: {
                        // ВИКОРИСТОВУЙТЕ ЗНАЙДЕНИЙ ACCESS TOKEN
                        Authorization: `Bearer ${token}`
                    }
                });

                // Якщо запит успішний, токен валідний
                setIsAuthenticated(true);
                setUser(response.data); // Припускаємо, що бекенд повертає дані користувача
                console.log('AuthContext: Токен валідний. Користувач автентифікований.');

            } catch (error) {
                console.error('AuthContext: Помилка перевірки токена (можливо, прострочений):', error.response?.data || error.message);

                // Якщо помилка 401 (Unauthorized) і є refresh token, спробувати оновити токен
                if (error.response?.status === 401 && refreshToken) {
                    console.log('AuthContext: Токен недійсний, спроба оновлення...');
                    try {
                        // Ендпоінт для оновлення токена на бекенді
                        const refreshResponse = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });

                        // Оновлення токенів у localStorage
                        localStorage.setItem(AUTH_TOKEN_KEY, refreshResponse.data.accessToken);
                        localStorage.setItem(REFRESH_TOKEN_KEY, refreshResponse.data.refreshToken);

                        // Токени оновлено, тепер користувач автентифікований
                        setIsAuthenticated(true);
                        // Отримуємо дані користувача з оновленим токеном
                        const userResponseAfterRefresh = await axios.get(`${API_BASE_URL}/api/users/profile`, {
                            headers: {
                                Authorization: `Bearer ${refreshResponse.data.accessToken}`
                            }
                        });
                        setUser(userResponseAfterRefresh.data);
                        console.log('AuthContext: Токен успішно оновлено. Користувач автентифікований.');

                    } catch (refreshError) {
                        console.error('AuthContext: Помилка оновлення токена:', refreshError.response?.data || refreshError.message);
                        // Якщо оновлення не вдалося, токени недійсні
                        logout(); // Вийти з системи
                        console.log('AuthContext: Оновлення токена не вдалося. Користувач вийшов.');
                    }
                } else {
                    // Інша помилка або немає refresh token
                    logout(); // Вийти з системи
                    console.log('AuthContext: Помилка авторизації або відсутній refresh token. Користувач вийшов.');
                }
            } finally {
                setLoading(false); // Завершуємо завантаження
            }
        };

        checkAuth();
    }, []); // Пустий масив залежностей означає, що ефект виконується один раз при монтуванні

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            // --- ПЕРЕКОНАЙТЕСЯ, ЩО БЕКЕНД ПОВЕРТАЄ accessToken ТА refreshToken ---
            const { accessToken, refreshToken, user: userData } = response.data;

            console.log('AuthContext Login: Received accessToken:', accessToken);
            console.log('AuthContext Login: Received refreshToken:', refreshToken);

            // --- ЗБЕРІГАЄМО ОБИДВА ТОКЕНИ ПІД ПРАВИЛЬНИМИ КЛЮЧАМИ ---
            localStorage.setItem(AUTH_TOKEN_KEY, accessToken); // Зберігаємо access token
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); // Зберігаємо refresh token
            // --- ---

            setIsAuthenticated(true);
            setUser(userData); // Встановлюємо дані користувача
            console.log('AuthContext Login: Вхід успішний. Токени збережено.');

            // Можливо, перенаправити користувача після успішного входу
            // navigate('/'); // Наприклад, на головну сторінку

            return response.data; // Повертаємо дані, якщо потрібно компоненту, що викликає
        } catch (error) {
            console.error('AuthContext Login: Помилка входу:', error.response?.data?.message || error.message);
            setIsAuthenticated(false); // Встановлюємо неавтентифікований стан при помилці входу
            setUser(null);
            // Можливо, відобразіть повідомлення про помилку користувачеві
            throw error; // Перекидаємо помилку для обробки в компоненті входу
        }
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { name: username, email, password });
            // При реєстрації сервер може повертати лише повідомлення про успіх.
            // Якщо сервер повертає токени при реєстрації і ви хочете автовхід:
            // const { accessToken, refreshToken, user: userData } = response.data;
            // localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
            // localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            // setIsAuthenticated(true);
            // setUser(userData);
            console.log('AuthContext Register: Реєстрація успішна.', response.data);
            return response.data; // Зазвичай при реєстрації не відбувається автоматичний вхід
        } catch (error) {
            console.error('AuthContext Register: Помилка реєстрації:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    // Функція для виходу користувача
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
            // Надсилаємо запит на бекенд для деактивації refresh token (якщо є)
            if (refreshToken) {
                await axios.post(`${API_BASE_URL}/api/auth/logout`, { refreshToken });
                console.log('AuthContext Logout: Запит на logout надіслано на бекенд.');
            }
        } catch (error) {
            console.error('AuthContext Logout: Помилка при надсиланні logout на бекенд:', error.response?.data || error.message);
            // Продовжуємо локальний вихід навіть якщо запит до бекенду не вдався
        } finally {
            // --- ВИДАЛЯЄМО ОБИДВА ТОКЕНИ ---
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            // Можливо, також видаліть дані користувача, якщо зберігали окремо
            localStorage.removeItem('authUser'); // Видаляємо, якщо ви зберігаєте тут об'єкт користувача
            // --- ---

            setIsAuthenticated(false);
            setUser(null);
            console.log('AuthContext Logout: Локальний вихід успішний. Токени видалено.');
            // Перенаправлення на сторінку входу
            navigate('/login');
        }
    };

    // Значення, які надаються контекстом
    const contextValue = {
        isAuthenticated,
        user,
        loading, // Надаємо стан завантаження
        login,
        register, // Якщо ви використовуєте реєстрацію через AuthContext
        logout,
        setUser, // Додаємо setUser для можливості оновлення інформації про користувача (наприклад, після оновлення профілю)
    };

    // Показуємо спінер завантаження, поки йде перевірка автентифікації
    // Ви можете використовувати ваш компонент Spinner тут
    // if (loading) {
    //     return <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">Завантаження автентифікації...</div>;
    // }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// 2. Створюємо кастомний хук для зручного використання контексту
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) { // Перевіряємо на null, оскільки початкове значення createContext(null)
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
