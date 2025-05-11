// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\api\content.js
import axios from 'axios';

// Отримайте ваш TMDB API ключ з змінних середовища
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Функція для отримання нових релізів
export const getNewReleases = async (page = 1) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'uk-UA', // Або мова, яку ви хочете використовувати
                page: page // <--- ПЕРЕКОНАЙТЕСЯ, ЩО ЦЕ ЧИСЛО
            }
        });
        // Повертаємо лише результати
        return response.data.results;
    } catch (error) {
        console.error("Помилка отримання нових релізів:", error);
        throw error;
    }
};

// --- ДОДАНО: ФУНКЦІЯ ДЛЯ ОТРИМАННЯ ТРЕНДОВОГО КОНТЕНТУ ---
export const getTrendingContent = async (type = 'all', time_window = 'day', page = 1) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/${type}/${time_window}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'uk-UA',
                page: page
            }
        });
        // Повертаємо лише результати
        return response.data.results;
    } catch (error) {
        console.error(`Помилка отримання трендового контенту (${type}/${time_window}):`, error);
        throw error;
    }
};

// Функція для пошуку фільмів та серіалів (використовує TMDB multi-search)
export const searchContent = async (query) => {
    if (!query || query.length < 2) {
        return [];
    }
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
            params: {
                api_key: TMDB_API_KEY,
                query: query,
                language: 'uk-UA' // Можете змінити мову за потреби
            }
        });
        // Фільтруємо результати, щоб залишити лише фільми та серіали, що мають постер
        return response.data.results.filter(
            item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );
    } catch (error) {
        console.error("Помилка пошуку контенту:", error);
        throw error;
    }
};

// Залиште існуючу функцію fetchContentDetails, якщо вона у вас є
export const fetchContentDetails = async (mediaType, tmdbId) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'uk-UA', // Можете змінити мову за потреби
                append_to_response: 'credits,videos,recommendations,reviews' // Додайте необхідні дані
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Помилка отримання деталей для ${mediaType}/${tmdbId}:`, error);
        throw error;
    }
};