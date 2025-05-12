import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return {};
    }
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

// Додавання контенту до бібліотеки користувача
export const addContentToUserLibrary = async (contentData) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для додавання до бібліотеки.');
    }
    const response = await axios.post(
        `${API_BASE_URL}/api/watchlist`,
        contentData,
        authConfig
    );
    return response.data;
};

// Профіль користувача
export const fetchUserProfile = async () => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/users/profile`, authConfig);
    return response.data;
};

export const updateUserProfile = async (userData, avatarFile) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const formData = new FormData();
    for (const key in userData) {
        if (Object.prototype.hasOwnProperty.call(userData, key) && userData[key] !== undefined) {
            formData.append(key, userData[key]);
        }
    }
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }
    const config = {
        headers: {
            ...authConfig.headers
        }
    };
    const response = await axios.put(`${API_BASE_URL}/api/users/profile`, formData, config);
    return response.data;
};

// Друзі
export const fetchFriends = async () => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/users/friends`, authConfig);
    return response.data;
};

export const fetchFriendRequests = async () => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/users/friends/requests`, authConfig);
    return response.data;
};

export const sendFriendRequest = async (userId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.post(`${API_BASE_URL}/api/users/friends/request/${userId}`, {}, authConfig);
    return response.data;
};

export const acceptFriendRequest = async (userId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.post(`${API_BASE_URL}/api/users/friends/accept/${userId}`, {}, authConfig);
    return response.data;
};

export const rejectOrRemoveFriend = async (userId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.delete(`${API_BASE_URL}/api/users/friends/remove/${userId}`, authConfig);
    return response.data;
};

export const searchUsers = async (query) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для пошуку.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, authConfig);
    return response.data;
};

// Watchlist
export const getWatchlist = async (params = {}) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для отримання списку перегляду.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/watchlist`, { headers: authConfig.headers, params });
    return response.data;
};

export const fetchFriendWatchlist = async (userId, params = {}) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для перегляду списку друзів.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}/watchlist`, { headers: authConfig.headers, params });
    return response.data;
};

export const updateWatchlistItem = async (itemId, updateData) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.put(`${API_BASE_URL}/api/watchlist/${itemId}`, updateData, authConfig);
    return response.data;
};

export const deleteWatchlistItem = async (itemId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.delete(`${API_BASE_URL}/api/watchlist/${itemId}`, authConfig);
    return response.data;
};

export const fetchWatchlistItemDetails = async (itemId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/watchlist/${itemId}`, authConfig);
    return response.data;
};

export const getUserWatchlistStatus = async (mediaType, tmdbId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        return { exists: false, internalId: null, status: null };
    }
    const response = await axios.get(`${API_BASE_URL}/api/watchlist`, authConfig);
    const watchlistItems = response.data.items;
    const existingItem = watchlistItems.find(
        item => String(item.externalId) === String(tmdbId) && item.mediaType === mediaType
    );
    if (existingItem) {
        return { exists: true, internalId: existingItem._id, status: existingItem.status };
    } else {
        return { exists: false, internalId: null, status: null };
    }
};

// Content details & reviews
export const fetchContentDetails = async (mediaType, tmdbId) => {
    const response = await axios.get(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}`);
    return response.data;
};

export const fetchContentReviews = async (mediaType, tmdbId) => {
    const response = await axios.get(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews`);
    return response.data;
};

export const submitContentReview = async (reviewData) => {
    const { mediaType, tmdbId, rating, comment, reviewId, contentTitle, contentPosterPath } = reviewData;
    let response;
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для надсилання відгуку.');
    }
    const dataToSend = {
        rating,
        comment,
        contentTitle,
        contentPosterPath
    };
    if (reviewId) {
        response = await axios.put(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews/${reviewId}`, dataToSend, authConfig);
    } else {
        const createData = {
            ...dataToSend,
            tmdbId: String(tmdbId),
            mediaType
        };
        response = await axios.post(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/reviews`, createData, authConfig);
    }
    return response.data;
};

export const getUserReviews = async () => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для перегляду своїх відгуків.');
    }
    const response = await axios.get(`${API_BASE_URL}/api/users/my-reviews`, authConfig);
    return response.data;
};

export const deleteUserReview = async (reviewId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для видалення відгуку.');
    }
    const response = await axios.delete(`${API_BASE_URL}/api/users/my-reviews/${reviewId}`, authConfig);
    return response.data;
};

export const getUserReviewForContent = async (mediaType, tmdbId) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для отримання власного відгуку.');
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/content/${mediaType}/${tmdbId}/my-review`, authConfig);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
};

export const toggleContentInUserLibrary = async (contentData) => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        throw new Error('Користувач не авторизований для зміни бібліотеки.');
    }
    const response = await axios.post(
        `${API_BASE_URL}/api/watchlist/toggle`,
        contentData,
        authConfig
    );
    return response.data;
};

// Аутентифікація
export const registerUser = async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    if (response.data.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
    }
    return response.data;
};

export const verifyToken = async () => {
    const authConfig = getAuthHeaders();
    if (!authConfig.headers || !authConfig.headers.Authorization) {
        return null;
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/verify`, authConfig);
        return response.data.user;
    } catch {
        localStorage.removeItem('authToken');
        return null;
    }
};


