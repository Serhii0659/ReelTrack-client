import axios from 'axios';

// Визначаємо базовий URL для API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Додаємо Interceptor для автоматичного додавання токена в заголовок Authorization
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Додаємо Interceptor для автоматичного оновлення токену
axiosInstance.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        // Якщо помилка 401 і це не запит на оновлення токену
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

                // Зберігаємо нові токени
                localStorage.setItem('authToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);

                // Повторюємо оригінальний запит з новим токеном
                originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Якщо refresh token недійсний - виходимо
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('authUser');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;