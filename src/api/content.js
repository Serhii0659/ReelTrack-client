import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const getNewReleases = async (page = 1) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/now_playing`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'uk-UA',
                page
            }
        });
        return response.data.results;
    } catch (error) {
        console.error("Помилка отримання нових релізів:", error);
        throw error;
    }
};

export const getTrendingContent = async (type = 'all', time_window = 'day', page = 1) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/${type}/${time_window}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'uk-UA',
                page
            }
        });
        return response.data.results;
    } catch (error) {
        console.error(`Помилка отримання трендового контенту (${type}/${time_window}):`, error);
        throw error;
    }
};

export const searchContent = async (query) => {
    if (!query || query.length < 2) {
        return [];
    }
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
            params: {
                api_key: TMDB_API_KEY,
                query,
                language: 'uk-UA'
            }
        });
        return response.data.results.filter(
            item => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
        );
    } catch (error) {
        console.error("Помилка пошуку контенту:", error);
        throw error;
    }
};

export const fetchContentDetails = async (mediaType, tmdbId) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'uk-UA',
                append_to_response: 'credits,videos,recommendations,reviews'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Помилка отримання деталей для ${mediaType}/${tmdbId}:`, error);
        throw error;
    }
};