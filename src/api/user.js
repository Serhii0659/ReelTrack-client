// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\api\user.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Допоміжна функція для отримання заголовків авторизації
export const getAuthHeaders = () => { // Експортуємо, якщо вона потрібна в інших місцях
    const token = localStorage.getItem('token');
    console.log('Значення токена з localStorage (getAuthHeaders):', token); // Змінив текст для більшої ясності
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
 * @param {Object} userData - Об'єкт з даними для оновлення (username, email, newPassword тощо).
 * @returns {Promise<Object>} - Оновлений об'єкт користувача.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const updateUserProfile = async (userData) => {
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


// ОНОВЛЕНО: Ендпоінти для бібліотеки/списку перегляду тепер використовують '/api/watchlist'
/**
 * Отримує список контенту в бібліотеці поточного користувача.
 * @returns {Promise<Array>} - Масив об'єктів контенту.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchUserLibrary = async () => {
    try {
        // Змінено: Використовуємо '/api/watchlist'
        const response = await axios.get(`${API_BASE_URL}/api/watchlist`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Помилка при отриманні бібліотеки користувача:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Видаляє контент з бібліотеки користувача.
 * @param {string} contentId - ID контенту, який потрібно видалити.
 * @returns {Promise<Object>} - Відповідь від сервера.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const removeContentFromUserLibrary = async (contentId) => {
    try {
        // Змінено: Використовуємо '/api/watchlist/:contentId'
        const response = await axios.delete(`${API_BASE_URL}/api/watchlist/${contentId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`Помилка при видаленні контенту ${contentId} з бібліотеки:`, error.response?.data || error.message);
        throw error;
    }
};

// --- НОВІ ФУНКЦІЇ ДЛЯ ДЕТАЛЕЙ КОНТЕНТУ ТА ВІДГУКІВ ---

/**
 * Функція для отримання деталей контенту (фільму/серіалу).
 * @param {string} mediaType - Тип медіа (наприклад, 'movie' або 'tv').
 * @param {string} tmdbId - ID контенту з TMDB.
 * @returns {Promise<Object>} - Деталі контенту.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchContentDetails = async (mediaType, tmdbId) => {
    try {
        // Деталі контенту зазвичай публічні, тому getAuthHeaders() тут не додається.
        const response = await axios.get(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching content details:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Функція для отримання всіх відгуків для певного контенту.
 * @param {string} mediaType - Тип медіа (наприклад, 'movie' або 'tv').
 * @param {string} tmdbId - ID контенту з TMDB.
 * @returns {Promise<Array>} - Масив об'єктів відгуків.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchContentReviews = async (mediaType, tmdbId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews`, getAuthHeaders());
        return response.data; 
    } catch (error) {
        console.error("Error fetching content reviews:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Функція для надсилання або оновлення відгуку.
 * @param {Object} reviewData - Об'єкт, що містить дані відгуку (mediaType, tmdbId, rating, comment, reviewId (для оновлення)).
 * @returns {Promise<Object>} - Відповідь від сервера (зазвичай, оновлений або створений об'єкт відгуку).
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const submitContentReview = async (reviewData) => {
    try {
        const { mediaType, tmdbId, rating, comment, reviewId } = reviewData;
        let response;
        const headers = getAuthHeaders(); // Отримуємо заголовки авторизації

        if (reviewId) {
            // Оновлення існуючого відгуку
            response = await axios.put(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews/${reviewId}`, { rating, comment }, headers);
        } else {
            // Створення нового відгуку
            response = await axios.post(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews`, { rating, comment }, headers);
        }
        return response.data;
    } catch (error) {
        console.error("Error submitting review:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Функція для додавання/видалення контенту з бібліотеки користувача.
 *
 * @param {Object} contentData - Об'єкт, що містить дані контенту (mediaType, tmdbId, title, poster_path, release_date тощо).
 * @returns {Promise<Object>} - Відповідь від сервера (зазвичай, { message: "...", added: true/false }).
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const toggleContentInUserLibrary = async (contentData) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/watchlist/toggle`, // <-- ВИПРАВЛЕНО: Правильний URL для маршруту бекенду
            contentData, // Передаємо повний об'єкт з даними контенту
            getAuthHeaders()
        );
        return response.data; // Очікуємо, що бекенд поверне, чи було додано/видалено
    } catch (error) {
        console.error('Помилка при зміні статусу контенту в бібліотеці:', error.response?.data || error.message);
        throw error;
    }
};