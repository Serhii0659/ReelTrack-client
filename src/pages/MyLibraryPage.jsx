// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\MyLibraryPage.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Для прямого запиту до бекенду

// --- Додані імпорти компонентів ---
import MovieCard from '../components/MovieCard'; 
import SeriesCard from '../components/SeriesCard'; 
import ReviewItem from '../components/ReviewItem'; 
import SearchBar from '../components/SearchBar'; 
// -----------------------------------

// Базовий URL вашого серверного API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const MyLibraryPage = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [libraryItems, setLibraryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'watching', 'completed', 'plan_to_watch', 'dropped'
    const [searchTerm, setSearchTerm] = useState(''); // Стан для пошукового запиту

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            toast.info('Будь ласка, увійдіть, щоб переглянути вашу бібліотеку.');
            return;
        }

        const fetchUserWatchlist = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Користувач не авторизований.');
                }
                const response = await axios.get(`${API_BASE_URL}/api/watchlist`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLibraryItems(response.data.items); // <--- Виправлено тут: тепер отримуємо саме масив items
            } catch (err) {
                console.error('Помилка при отриманні списку перегляду:', err.response?.data || err.message);
                setError(err.message || 'Не вдалося завантажити вашу бібліотеку.');
                toast.error('Не вдалося завантажити вашу бібліотеку.');
                if (err.response?.status === 401) {
                    toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserWatchlist();
    }, [isAuthenticated, navigate, logout]);

    // Функція для фільтрації та пошуку
    const filteredAndSearchedItems = libraryItems.filter(item => {
        // Фільтрація за статусом
        const statusMatch = filterStatus === 'all' || item.status === filterStatus;

        // Пошук за назвою (без врахування регістру)
        const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());

        return statusMatch && searchMatch;
    });

    if (!isAuthenticated) {
        return null; // Перенаправлення вже відбувається в useEffect
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">
                Завантаження вашої бібліотеки...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500">
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-[#e50914]">Моя Бібліотека</h1>

                {/* SearchBar тут */}
                <div className="mb-8">
                    <SearchBar /> {/* Тепер йому не потрібні пропси searchTerm та onSearchChange */}
                </div>

                {/* Фільтри */}
                <div className="flex justify-center mb-8 space-x-4 flex-wrap gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`py-2 px-4 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Всі
                    </button>
                    <button
                        onClick={() => setFilterStatus('watching')}
                        className={`py-2 px-4 rounded-lg transition-colors ${filterStatus === 'watching' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Переглядаю
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`py-2 px-4 rounded-lg transition-colors ${filterStatus === 'completed' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Переглянуто
                    </button>
                    <button
                        onClick={() => setFilterStatus('plan_to_watch')}
                        className={`py-2 px-4 rounded-lg transition-colors ${filterStatus === 'plan_to_watch' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Планую
                    </button>
                    <button
                        onClick={() => setFilterStatus('dropped')}
                        className={`py-2 px-4 rounded-lg transition-colors ${filterStatus === 'dropped' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        Призупинено
                    </button>
                </div>

                {filteredAndSearchedItems.length === 0 && (
                    <p className="text-center text-gray-400 text-xl mt-10">
                        Ваша бібліотека за цим статусом порожня або не знайдено за запитом.
                        <br />
                        <Link to="/explore" className="text-blue-500 hover:underline">
                            Досліджуйте та додавайте контент!
                        </Link>
                    </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Використовуємо MovieCard або SeriesCard */}
                    {filteredAndSearchedItems.map(item => (
                        <React.Fragment key={item._id}>
                            {item.mediaType === 'movie' ? (
                                <MovieCard movie={item} /> // Передаємо об'єкт фільму в MovieCard
                            ) : (
                                <SeriesCard series={item} /> // Передаємо об'єкт серіалу в SeriesCard
                            )}
                            {/* Приклад розміщення ReviewItem, якщо ви хочете відображати відгуки тут */}
                            {/* {item.reviews && item.reviews.map(review => (
                                <ReviewItem key={review._id} review={review} />
                            ))} */}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyLibraryPage;