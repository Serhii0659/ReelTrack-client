import axios from 'axios';

// Використовуємо змінну середовища для базового URL API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Допоміжна функція для отримання заголовків авторизації
// Перевіряє наявність токена в localStorage і повертає об'єкт заголовків або порожній об'єкт.
export const getAuthHeaders = () => {
    // Використовуйте ключ, під яким ви зберігаєте токен авторизації (наприклад, 'authToken' або 'token')
    const token = localStorage.getItem('authToken');
    // console.log('Значення токена з localStorage (getAuthHeaders):', token); // Залиште для налагодження, якщо потрібно

    if (!token) {
        // Повертаємо порожній об'єкт заголовків, якщо токен відсутній.
        // Компоненти, що викликають ці функції, повинні обробляти відсутність авторизації.
        console.warn('Attempted to get auth headers but no token found.');
        return {};
        // АБО, якщо ви хочете, щоб функція завжди кидала помилку при відсутності токена:
        // throw new Error('Користувач не авторизований. Будь ласка, увійдіть.');
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
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
        if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований для додавання до бібліотеки.');
        }
        const response = await axios.post(
            `${API_BASE_URL}/api/watchlist`, // Ендпоінт для додавання нового елемента до списку перегляду
            contentData,
            authConfig // Передаємо об'єкт конфігурації Axios
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
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
        if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data;
    } catch (error) {
        console.error(`Помилка при отриманні профілю користувача:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Оновлює профіль користувача.
 * @param {Object} userData - Об'єкт з даними для оновлення (name, email, password, watchlistPrivacy тощо).
 * @param {File} [avatarFile] - Файл аватара для завантаження (необов'язково).
 * @returns {Promise<Object>} - Оновлений об'єкт користувача.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const updateUserProfile = async (userData, avatarFile) => {
    try {
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }

        const formData = new FormData();
        // Додаємо дані користувача до FormData
        for (const key in userData) {
            if (userData[key] !== undefined) {
                formData.append(key, userData[key]);
            }
        }
        // Додаємо файл аватара, якщо він є
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        // При завантаженні файлів Content-Type має бути 'multipart/form-data'
        // Axios автоматично встановить правильний Content-Type при використанні FormData,
        // але ми можемо явно вказати його, якщо потрібно.
        const config = {
            headers: {
                ...authConfig.headers, // Копіюємо заголовки авторизації
                // 'Content-Type': 'multipart/form-data' // Axios додасть це сам
            }
        };

        const response = await axios.put(`${API_BASE_URL}/api/users/profile`, formData, config);
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
         const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        const response = await axios.get(`${API_BASE_URL}/api/users/friends`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data; // Очікуємо масив друзів
    } catch (error) {
        console.error('Помилка при отриманні списку друзів:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Отримує список отриманих запитів на додавання в друзі.
 * @returns {Promise<Array>} - Масив об'єктів запитів.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchFriendRequests = async () => {
    try {
         const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        const response = await axios.get(`${API_BASE_URL}/api/users/friends/requests`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data; // Очікуємо масив запитів
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
         const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це /api/users/friends/request/:userId
        const response = await axios.post(`${API_BASE_URL}/api/users/friends/request/${userId}`, {}, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data;
    } catch (error) {
        console.error(`Помилка при надсиланні запиту на дружбу користувачу ${userId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Приймає запит на додавання в друзі.
 * @param {string} userId - ID користувача, від якого отримано запит (це ID користувача, а не ID запиту).
 * @returns {Promise<Object>} - Відповідь від сервера.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const acceptFriendRequest = async (userId) => { // Змінено параметр на userId згідно з маршрутом бекенду
    try {
         const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це /api/users/friends/accept/:userId
        const response = await axios.post(`${API_BASE_URL}/api/users/friends/accept/${userId}`, {}, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data;
    } catch (error) {
        console.error(`Помилка при прийнятті запиту на дружбу від користувача ${userId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Відхиляє запит на додавання в друзі або видаляє друга.
 * @param {string} userId - ID користувача, якого потрібно відхилити або видалити.
 * @returns {Promise<Object>} - Відповідь від сервера.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
// ВИПРАВЛЕНО: Спрощено функцію відповідно до маршруту DELETE /api/users/friends/remove/:userId
export const rejectOrRemoveFriend = async (userId) => {
    try {
         const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це DELETE /api/users/friends/remove/:userId
        const response = await axios.delete(`${API_BASE_URL}/api/users/friends/remove/${userId}`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data; // Очікуємо повідомлення про успіх
    } catch (error) {
        console.error(`Помилка при відхиленні запиту або видаленні друга користувача ${userId}:`, error.response?.data || error.message);
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
     // Цей ендпоінт /api/users/search не був явно вказаний у наданій документації,
     // але якщо він існує на бекенді і вимагає авторизації:
    try {
         const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований для пошуку.');
        }
        const response = await axios.get(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data;
    } catch (error) {
        console.error('Помилка при пошуку користувачів:', error.response?.data || error.message);
        throw error;
    }
};


// ОНОВЛЕНО: Ендпоінти для бібліотеки/списку перегляду тепер використовують '/api/watchlist'
/**
 * Отримує список контенту в бібліотеці поточного користувача.
 * @param {Object} [params] - Параметри запиту (наприклад, { status: 'completed', page: 1 }).
 * @returns {Promise<Object>} - Об'єкт з даними списку перегляду (items, totalPages тощо).
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchUserWatchlist = async (params = {}) => { // Змінено назву на fetchUserWatchlist для ясності
    try {
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це GET /api/watchlist
        const response = await axios.get(`${API_BASE_URL}/api/watchlist`, { headers: authConfig.headers, params }); // Додаємо параметри запиту
        return response.data; // Очікуємо об'єкт з items, totalPages тощо
    } catch (error) {
        console.error('Помилка при отриманні списку перегляду користувача:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Отримує список перегляду іншого користувача (з перевіркою приватності на бекенді).
 * @param {string} userId - ID користувача, чий список перегляду потрібно отримати.
 * @param {Object} [params] - Параметри запиту (наприклад, { status: 'completed', page: 1 }).
 * @returns {Promise<Object>} - Об'єкт з даними списку перегляду друга.
 * @throws {Error} - Викидає помилку, якщо запит не вдався (403 якщо приватний).
 */
export const fetchFriendWatchlist = async (userId, params = {}) => {
    try {
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             // Можливо, варто дозволити запит без авторизації, якщо список публічний?
             // Це залежить від реалізації бекенду. Якщо бекенд обробляє публічний доступ,
             // можна не кидати помилку тут, а передати порожні заголовки.
             // Припускаємо, що для отримання списку друга потрібна авторизація.
             throw new Error('Користувач не авторизований для перегляду списку друзів.');
        }
        // Згідно з документацією, це GET /api/users/:userId/watchlist
        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/watchlist`, { headers: authConfig.headers, params });
        return response.data; // Очікуємо об'єкт з friendName, items, totalPages тощо
    } catch (error) {
        console.error(`Помилка при отриманні списку перегляду друга ${userId}:`, error.response?.data || error.message);
        throw error;
    }
};


/**
 * Оновлює елемент у списку перегляду користувача.
 * @param {string} itemId - ID елемента списку перегляду.
 * @param {Object} updateData - Дані для оновлення (status, userRating, episodesWatched, userNotes тощо).
 * @returns {Promise<Object>} - Оновлений об'єкт елемента списку перегляду.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const updateWatchlistItem = async (itemId, updateData) => {
    try {
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це PUT /api/watchlist/:id
        const response = await axios.put(`${API_BASE_URL}/api/watchlist/${itemId}`, updateData, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data;
    } catch (error) {
        console.error(`Помилка при оновленні елемента списку перегляду ${itemId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Видаляє елемент зі списку перегляду користувача.
 * @param {string} itemId - ID елемента списку перегляду.
 * @returns {Promise<Object>} - Відповідь від сервера (зазвичай, { message: "..." }).
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const deleteWatchlistItem = async (itemId) => {
    try {
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це DELETE /api/watchlist/:id
        const response = await axios.delete(`${API_BASE_URL}/api/watchlist/${itemId}`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data; // Очікуємо повідомлення про успіх
    } catch (error) {
        console.error(`Помилка при видаленні елемента списку перегляду ${itemId}:`, error.response?.data || error.message);
        throw error;
    }
};

/**
 * Отримує деталі конкретного елемента списку перегляду.
 * @param {string} itemId - ID елемента списку перегляду.
 * @returns {Promise<Object>} - Об'єкт елемента списку перегляду.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchWatchlistItemDetails = async (itemId) => {
    try {
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це GET /api/watchlist/:id
        const response = await axios.get(`${API_BASE_URL}/api/watchlist/${itemId}`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data; // Очікуємо об'єкт елемента списку перегляду
    } catch (error) {
        console.error(`Помилка при отриманні деталей елемента списку перегляду ${itemId}:`, error.response?.data || error.message);
        throw error;
    }
};


// --- Функції для деталей контенту та відгуків (зверніть увагу, деякі можуть бути в content.js) ---
// ЦІ ФУНКЦІЇ ПОВИННІ БУТИ ОГОЛОШЕНІ ЛИШЕ ОДИН РАЗ У ФАЙЛІ

/**
 * Функція для отримання деталей контенту (фільму/серіалу) з вашого бекенду.
 * @param {string} mediaType - Тип медіа (наприклад, 'movie' або 'tv').
 * @param {string} tmdbId - ID контенту з TMDB.
 * @returns {Promise<Object>} - Деталі контенту.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchContentDetails = async (mediaType, tmdbId) => {
    try {
        // Цей ендпоінт на бекенді (/api/content/:mediaType/:tmdbId) може бути публічним.
        // Якщо він вимагає авторизацію, додайте getAuthHeaders().
        const response = await axios.get(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching content details from backend:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Функція для отримання всіх відгуків для певного контенту з вашого бекенду.
 * @param {string} mediaType - Тип медіа (наприклад, 'movie' або 'tv').
 * @param {string} tmdbId - ID контенту з TMDB.
 * @returns {Promise<Array>} - Масив об'єктів відгуків.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const fetchContentReviews = async (mediaType, tmdbId) => {
    try {
         // Цей ендпоінт на бекенді (/api/content/:mediaType/:tmdbId/reviews) може бути публічним або вимагати авторизації.
         // Якщо бекенд вимагає авторизацію, додайте getAuthHeaders().
        const response = await axios.get(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews`);
        return response.data;
    } catch (error) {
        console.error("Error fetching content reviews from backend:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Функція для надсилання або оновлення відгуку на вашому бекенді.
 * @param {Object} reviewData - Об'єкт, що містить дані відгуку (mediaType, tmdbId, rating, comment, reviewId (для оновлення), contentTitle, contentPosterPath).
 * @returns {Promise<Object>} - Відповідь від сервера (зазвичай, оновлений або створений об'єкт відгуку).
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const submitContentReview = async (reviewData) => {
    try {
        // ВИПРАВЛЕНО: Додано contentTitle та contentPosterPath до деструктуризації
        const { mediaType, tmdbId, rating, comment, reviewId, contentTitle, contentPosterPath } = reviewData;
        let response;
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації

        if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований для надсилання відгуку.');
        }

        // ВИПРАВЛЕНО: Додано contentTitle та contentPosterPath до тіла запиту
        const dataToSend = {
            rating,
            comment,
            contentTitle, // Додаємо contentTitle
            contentPosterPath // Додаємо contentPosterPath (якщо є)
        };

        if (reviewId) {
            // Оновлення існуючого відгуку: PUT /api/content/:mediaType/:tmdbId/reviews/:reviewId
            // При оновленні, можливо, не потрібно надсилати tmdbId, mediaType, contentTitle, contentPosterPath
            // Це залежить від реалізації бекенду. Якщо бекенд очікує лише rating та comment для оновлення,
            // залиште dataToSend як { rating, comment }.
            // Якщо бекенд дозволяє оновлення інших полів, додайте їх до dataToSend.
            response = await axios.put(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews/${reviewId}`, dataToSend, authConfig); // Передаємо об'єкт конфігурації Axios
        } else {
            // Створення нового відгуку: POST /api/content/:mediaType/:tmdbId/reviews
            // При створенні потрібні всі обов'язкові поля
            const createData = {
                ...dataToSend,
                tmdbId: String(tmdbId), // Переконайтесь, що tmdbId є рядком, якщо так очікує бекенд
                mediaType
            };
            response = await axios.post(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews`, createData, authConfig); // Передаємо об'єкт конфігурації Axios
        }
        return response.data;
    } catch (error) {
        console.error("Error submitting review to backend:", error.response?.data || error.message);
        throw error;
    }
};


/**
 * Функція для отримання відгуків та оцінок, залишених поточним користувачем.
 * Ця функція отримує дані з ендпоінта /api/users/my-reviews на вашому бекенді.
 * @returns {Promise<Array>} - Масив об'єктів відгуків.
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const getUserReviews = async () => {
    try {
        // Цей запит вимагає авторизації, оскільки отримує дані конкретного користувача
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований для перегляду своїх відгуків.');
        }
        // Згідно з документацією бекенду, ендпоінт для відгуків користувача: /api/users/my-reviews
        const response = await axios.get(`${API_BASE_URL}/api/users/my-reviews`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data; // Очікуємо масив відгуків
    } catch (error) {
        console.error('Помилка при отриманні відгуків користувача:', error.response?.data || error.message);
        throw error;
    }
};


/**
 * Функція для додавання/видалення контенту з бібліотеки користувача.
 * Використовує ендпоінт бекенду /api/watchlist/toggle.
 * @param {Object} contentData - Об'єкт, що містить дані контенту (mediaType, tmdbId, title, poster_path, release_date тощо).
 * @returns {Promise<Object>} - Відповідь від сервера (зазвичай, { message: "...", added: true/false }).
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const toggleContentInUserLibrary = async (contentData) => {
    try {
         const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований для зміни бібліотеки.');
        }
        // Згідно з документацією бекенду, ендпоінт для перемикання: /api/watchlist/toggle
        const response = await axios.post(
            `${API_BASE_URL}/api/watchlist/toggle`, // <-- ВИПРАВЛЕНО: Правильний URL для маршруту бекенду
            contentData, // Передаємо повний об'єкт з даними контенту
            authConfig // Передаємо об'єкт конфігурації Axios
        );
        return response.data; // Очікуємо, що бекенд поверне, чи було додано/видалено
    } catch (error) {
        console.error('Помилка при зміні статусу контенту в бібліотеці:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Функція для видалення контенту з бібліотеки користувача.
 * @param {string} itemId - ID елемента списку перегляду.
 * @returns {Promise<Object>} - Відповідь від сервера (зазвичай, { message: "..." }).
 * @throws {Error} - Викидає помилку, якщо запит не вдався.
 */
export const removeContentFromUserLibrary = async (itemId) => { // Змінено параметр на itemId для ясності
    try {
        const authConfig = getAuthHeaders(); // Отримуємо конфігурацію авторизації
         if (!authConfig.headers || !authConfig.headers.Authorization) {
             throw new Error('Користувач не авторизований.');
        }
        // Згідно з документацією, це DELETE /api/watchlist/:id
        const response = await axios.delete(`${API_BASE_URL}/api/watchlist/${itemId}`, authConfig); // Передаємо об'єкт конфігурації Axios
        return response.data; // Очікуємо повідомлення про успіх
    } catch (error) {
        console.error(`Помилка при видаленні елемента списку перегляду ${itemId}:`, error.response?.data || error.message);
        throw error;
    }
};



