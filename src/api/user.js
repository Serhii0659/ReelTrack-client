// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\api\user.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Допоміжна функція для отримання заголовків авторизації
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Користувач не авторизований. Будь ласка, увійдіть.');
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

/**
 * Додає контент до бібліотеки користувача.
 *
 * @param {Object} contentData - Об'єкт, що містить дані контенту (tmdbId, mediaType, status, title, posterPath, releaseDate, genres, overview тощо).
 * @returns {Promise<Object>} - Відповідь від сервера.
 * @throws {Error} - Викидає помилку, якщо запит не вдався (наприклад, 401 якщо не авторизовано).
 */
export const addContentToUserLibrary = async (contentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/watchlist`, // Переконайтеся, що це правильний ендпоінт на вашому бекенді
            contentData,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Помилка при додаванні контенту до бібліотеки користувача:', error.response?.data || error.message);
        throw error; // Перекидаємо помилку для подальшої обробки в компоненті
    }
};

/**
 * Отримує профіль поточного авторизованого користувача.
 *
 * @returns {Promise<Object>} - Об'єкт з даними профілю користувача.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchUserProfile = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Помилка при отриманні профілю користувача:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Оновлює профіль користувача.
 *
 * @param {Object} userData - Об'єкт з даними для оновлення (username, email, newPassword тощо).
 * @returns {Promise<Object>} - Оновлений об'єкт користувача.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const updateUserProfile = async (userData) => { // Змінено: видалено 'avatarUrl' з JSDoc
    try {
        const response = await axios.put(`${API_BASE_URL}/api/users/profile`, userData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Помилка при оновленні профілю користувача:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Отримує список друзів поточного користувача.
 *
 * @returns {Promise<Array>} - Масив об'єктів друзів.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchFriends = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/friends`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Помилка при отриманні списку друзів:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Отримує список запитів на додавання в друзі.
 *
 * @returns {Promise<Array>} - Масив об'єктів запитів.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchFriendRequests = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/friends/requests`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Помилка при отриманні запитів на дружбу:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Надсилає запит на додавання в друзі.
 *
 * @param {string} userId - ID користувача, якому надсилається запит.
 * @returns {Promise<Object>} - Відповідь від сервера.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const sendFriendRequest = async (userId) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/friends/request/${userId}`, {}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Помилка при надсиланні запиту на дружбу користувачу ${userId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Приймає запит на додавання в друзі.
 *
 * @param {string} requestId - ID запиту на додавання в друзі.
 * @returns {Promise<Object>} - Відповідь від сервера.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const acceptFriendRequest = async (requestId) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/friends/request/${requestId}/accept`, {}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Помилка при прийнятті запиту на дружбу ${requestId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Відхиляє запит на додавання в друзі або видаляє друга.
 *
 * @param {string} friendIdOrRequestId - ID друга для видалення, або ID запиту для відхилення.
 * @param {boolean} isRequest - Чи це ID запиту (true) або ID друга (false).
 * @returns {Promise<Object>} - Відповідь від сервера.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const rejectOrRemoveFriend = async (friendIdOrRequestId, isRequest = false) => {
    try {
        const endpoint = isRequest 
            ? `${API_BASE_URL}/api/friends/request/${friendIdOrRequestId}/reject` 
            : `${API_BASE_URL}/api/friends/${friendIdOrRequestId}`;
        
        const method = isRequest ? axios.put : axios.delete; 

        const response = await method(endpoint, {}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Помилка при ${isRequest ? 'відхиленні запиту' : 'видаленні друга'} ${friendIdOrRequestId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Шукає користувачів за іменем користувача.
 *
 * @param {string} query - Рядок для пошуку (частина імені користувача).
 * @returns {Promise<Array>} - Масив об'єктів користувачів.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const searchUsers = async (query) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Помилка при пошуку користувачів:', error.response?.data || error.message);
        throw error;
    }
};