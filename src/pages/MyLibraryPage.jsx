// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\MyLibraryPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
// Імпортуємо потрібні функції API
import {
    getWatchlist,
    getUserReviews,
    updateWatchlistItem,
    deleteWatchlistItem,
    toggleContentInUserLibrary,
    fetchWatchlistItemDetails
} from '../api/user';
import Spinner from '../components/Spinner'; // Припускаємо, що у вас є компонент Spinner
import SearchBar from '../components/SearchBar'; // Імпорт компонента SearchBar
// --- ДОДАНО: Імпорт MovieCard та SeriesCard ---
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
// --- ВИДАЛЕНО: Імпорт ReviewCard (ReviewGroup залишаємо) ---
import { ReviewGroup } from '../components/ReviewCard'; // Імпортуємо тільки ReviewGroup
// --- ВИДАЛЕНО: Імпорт UserStatistics ---
// import UserStatistics from '../components/UserStatistics'; // Переконайтеся, що шлях правильний
// --- ---
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Визначимо статуси для зручності та перекладу
const STATUS_MAP = {
    watching: 'Переглядаються',
    completed: 'Завершено',
    on_hold: 'На паузі',
    dropped: 'Видалено/Закинуто',
    plan_to_watch: 'Заплановано',
};

const MyLibraryPage = () => {
    console.log('MyLibraryPage: Компонент MyLibraryPage рендериться.');

    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Стан для зберігання даних списку перегляду
    const [watchlistItems, setWatchlistItems] = useState([]);
    const [loadingWatchlist, setLoadingWatchlist] = useState(true);
    const [errorWatchlist, setErrorWatchlist] = useState(null);

    // Стан для відгуків користувача
    const [userReviews, setUserReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [errorReviews, setErrorReviews] = useState(null);

    // Стан для перемикання між вкладками
    const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist' або 'reviews'

    // СТАН ДЛЯ ПОШУКУ (керований)
    const [searchTerm, setSearchTerm] = useState('');

    // Функція для завантаження списку перегляду користувача
    const loadUserWatchlist = async () => {
        console.log('MyLibraryPage: loadUserWatchlist викликана.');
        // Не завантажуємо, якщо користувач не автентифікований або AuthContext ще завантажується
        if (!isAuthenticated || authLoading) {
            setLoadingWatchlist(false);
            setErrorWatchlist(null);
            setWatchlistItems([]);
            return;
        }

        setLoadingWatchlist(true);
        setErrorWatchlist(null);
        console.log('MyLibraryPage: Завантаження списку перегляду користувача...');
        try {
            const data = await getWatchlist();
            console.log('MyLibraryPage: Отримано список перегляду:', data);
            // Припускаємо, що getWatchlist повертає об'єкт з полем 'items'
            setWatchlistItems(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
            console.error('MyLibraryPage: Помилка завантаження списку перегляду:', err);
            const msg = err.response?.data?.message || 'Не вдалося завантажити список перегляду.';
            setErrorWatchlist(msg);
            toast.error(msg);
            setWatchlistItems([]); // Очищаємо список при помилці
            if (err.response?.status === 401) {
                toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
            }
        } finally {
            setLoadingWatchlist(false);
        }
    };

    // Функція для завантаження відгуків користувача
    const loadUserReviews = async () => {
            console.log('MyLibraryPage: loadUserReviews викликана.');
        if (!isAuthenticated || authLoading) {
            setLoadingReviews(false);
            setErrorReviews(null);
            setUserReviews([]);
            return;
        }

        setLoadingReviews(true);
        setErrorReviews(null);
        console.log('MyLibraryPage: Завантаження відгуків користувача...');
        try {
            const reviews = await getUserReviews();
            console.log('MyLibraryPage: Отримано відгуки:', reviews);
            // Припускаємо, що getUserReviews повертає масив відгуків
            setUserReviews(Array.isArray(reviews) ? reviews : []);
        } catch (error) {
            console.error('MyLibraryPage: Помилка завантаження відгуків:', error);
            const msg = error.response?.data?.message || 'Не вдалося завантажити відгуки.';
            setErrorReviews(msg);
            toast.error(msg);
            setUserReviews([]); // Очищаємо відгуки при помилці
            if (error.response?.status === 401) {
                toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
            }
        } finally {
            setLoadingReviews(false);
        }
    };


    useEffect(() => {
        console.log('MyLibraryPage: useEffect спрацював. isAuthenticated:', isAuthenticated, 'authLoading:', authLoading); // НОВИЙ ЛОГ

        if (!authLoading && !isAuthenticated) {
            console.log('MyLibraryPage: Користувач не автентифікований, перенаправлення на /login.'); // НОВИЙ ЛОГ
            navigate('/login');
            toast.info('Будь ласка, увійдіть, щоб переглянути вашу бібліотеку.');
            return;
        }

        if (isAuthenticated) {
            console.log('MyLibraryPage: Користувач автентифікований, спроба завантажити дані...'); // НОВИЙ ЛОГ
            loadUserWatchlist();
            loadUserReviews();
        }

    }, [isAuthenticated, authLoading, navigate]);

    // ВИКОРИСТАННЯ useMemo ДЛЯ ФІЛЬТРАЦІЇ та РОЗДІЛЕННЯ, А ТАКОЖ ДЛЯ СТАТУСІВ
    const {
        moviesByStatus,
        tvShowsByStatus,
        movieStatusBreakdown, // Ці змінні тепер не використовуються для відображення загальної статистики,
        tvShowStatusBreakdown // але залишені для можливості їх використання в майбутньому, якщо знадобиться.
    } = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();

        const filteredItems = watchlistItems.filter(item =>
            item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.genres?.some(genre => genre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            item.userNotes?.toLowerCase().includes(lowerCaseSearchTerm)
        );

        const movies = filteredItems.filter(item => item.mediaType === 'movie');
        const tvShows = filteredItems.filter(item => item.mediaType === 'tv');

        // Функція для групування елементів за статусом
        const groupItemsByStatus = (items) => {
            const grouped = {};
            for (const statusKey in STATUS_MAP) {
                grouped[statusKey] = items.filter(item => item.status === statusKey);
            }
            return grouped;
        };

        const moviesByStatus = groupItemsByStatus(movies);
        const tvShowsByStatus = groupItemsByStatus(tvShows);


        // Функція для розрахунку статистики статусу (залишаємо як було, хоча тепер можна рахувати з moviesByStatus/tvShowsByStatus)
        const calculateStatusBreakdown = (items) => {
            const breakdown = {
                watching: 0,
                completed: 0,
                on_hold: 0,
                dropped: 0,
                plan_to_watch: 0,
            };
            items.forEach(item => {
                if (breakdown[item.status] !== undefined) {
                    breakdown[item.status]++;
                }
            });
            return breakdown;
        };

        const movieStats = calculateStatusBreakdown(movies);
        const tvShowStats = calculateStatusBreakdown(tvShows);

        return { 
            moviesByStatus, 
            tvShowsByStatus,
            movieStatusBreakdown: movieStats,
            tvShowStatusBreakdown: tvShowStats
        };
    }, [watchlistItems, searchTerm]); // Перераховуємо лише при зміні списку або запиту


    // Обробник видалення елемента зі списку перегляду
    const handleDeleteItem = async (itemId) => {
        if (!itemId || typeof itemId !== 'string' || itemId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
            toast.error('Невірний ID елемента.');
            console.error('Attempted to delete with invalid itemId:', itemId);
            return;
        }

        try {
            await deleteWatchlistItem(itemId);
            toast.success('Елемент видалено зі списку перегляду.');
            // Оновлюємо список, видаляючи елемент з локального стану
            setWatchlistItems(prevItems => prevItems.filter(item => item._id !== itemId));
            // Можливо, також перезавантажити відгуки, якщо видалення елемента впливає на них
            // loadUserReviews();
        } catch (err) {
            console.error('Помилка видалення елемента:', err);
            const msg = err.response?.data?.message || 'Не вдалося видалити елемент.';
            toast.error(msg);
            setErrorWatchlist(msg); // Встановлюємо помилку для списку перегляду
        }
    };

    // Обробник оновлення елемента (наприклад, зміна статусу або оцінки)
    const handleUpdateItem = async (itemId, updateData) => {
        if (!itemId || typeof itemId !== 'string' || itemId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
            toast.error('Невірний ID елемента.');
            console.error('Attempted to update with invalid itemId:', itemId);
            return;
        }
        console.log(`MyLibraryPage: Оновлення елемента ${itemId} з даними:`, updateData);
        try {
            const updatedItem = await updateWatchlistItem(itemId, updateData);
            toast.success('Елемент оновлено.');
            // Оновлюємо елемент у локальному стані
            setWatchlistItems(prevItems =>
                prevItems.map(item => (item._id === itemId ? updatedItem : item))
            );
            // Якщо оновлення включає оцінку або коментар, можливо, потрібно оновити список відгуків
            if (updateData.userRating !== undefined || updateData.userNotes !== undefined) {
                loadUserReviews(); // Найпростіший спосіб - перезавантажити відгуки
            }
        } catch (err) {
            console.error('Помилка оновлення елемента:', err);
            const msg = err.response?.data?.message || 'Не вдалося оновити елемент.';
            toast.error(msg);
            setErrorWatchlist(msg); // Встановлюємо помилку для списку перегляду
        }
    };

    // Показуємо спінер, якщо автентифікація ще не завершена
    if (authLoading) {
        return <Spinner />;
    }

    // Якщо користувач не автентифікований після завантаження
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                <p>Будь ласка, увійдіть, щоб переглянути вашу бібліотеку.</p>
            </div>
        );
    }

    // Відображення, якщо є помилка завантаження списку перегляду
    if (errorWatchlist && watchlistItems.length === 0 && activeTab === 'watchlist') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500 pt-24">
                Помилка завантаження списку перегляду: {errorWatchlist}
            </div>
        );
    }

    // Відображення, якщо є помилка завантаження відгуків
    if (errorReviews && userReviews.length === 0 && activeTab === 'reviews') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500 pt-24">
                Помилка завантаження відгуків: {errorReviews.message || 'Невідома помилка'}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-white">Моя Бібліотека</h1>

                {/* НОВА СТРУКТУРА: Flex контейнер для розташування поруч */}
                <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-8">
                    {/* ВИДАЛЕНО: Компонент статистики */}
                    {/*
                    <div className="lg:w-1/3 w-full">
                        <UserStatistics />
                    </div>
                    */}

                    {/* Основний контент (вкладки) */}
                    {/* Оновлено: Тепер займає повну ширину на великих екранах */}
                    <div className="lg:w-full w-full"> 
                        {/* Вкладки */}
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => setActiveTab('watchlist')}
                                className={`py-2 px-6 text-lg font-semibold rounded-l-lg transition-colors ${activeTab === 'watchlist' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Список Перегляду ({watchlistItems.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`py-2 px-6 text-lg font-semibold rounded-r-lg transition-colors ${activeTab === 'reviews' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                Мої Відгуки ({userReviews.length})
                            </button>
                        </div>

                        {/* Вміст вкладок */}
                        {activeTab === 'watchlist' && (
                            <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-bold mb-4 text-center text-white">Список Перегляду</h2>

                                <div className="mb-6">
                                    <SearchBar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                    />
                                </div>

                                {/* Відображення завантаження або помилки для списку перегляду */}
                                {loadingWatchlist ? (
                                    <div className="flex justify-center"><Spinner /></div>
                                ) : (
                                    <> {/* Використовуємо фрагмент для групування */}
                                        {/* Секція Фільми */}
                                        <div className="mb-8">
                                            {/* Заголовок "Фільми" без загальної статистики */}
                                            <h3 className="text-xl font-semibold text-white mb-4">Фільми</h3>
                                            
                                            {/* Розділи фільмів за статусом */}
                                            {Object.keys(STATUS_MAP).map(statusKey => (
                                                <div key={`movies-${statusKey}`} className="mb-6">
                                                    <h4 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
                                                        {STATUS_MAP[statusKey]} ({moviesByStatus[statusKey].length})
                                                    </h4>
                                                    {moviesByStatus[statusKey].length === 0 ? (
                                                        <p className="text-center text-gray-500 text-sm">
                                                            Немає фільмів у статусі "{STATUS_MAP[statusKey]}" {searchTerm && `за запитом "${searchTerm}"`}.
                                                        </p>
                                                    ) : (
                                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                                                            {moviesByStatus[statusKey].map(item => (
                                                                <MovieCard
                                                                    key={item._id}
                                                                    item={item}
                                                                    onRemove={handleDeleteItem}
                                                                    onUpdate={handleUpdateItem}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {watchlistItems.filter(item => item.mediaType === 'movie').length === 0 && !searchTerm && (
                                                <p className="text-center text-gray-400">
                                                    У вашому списку перегляду немає фільмів.
                                                </p>
                                            )}
                                        </div>

                                        {/* Секція Серіали */}
                                        <div>
                                            {/* Заголовок "Серіали" без загальної статистики */}
                                            <h3 className="text-xl font-semibold text-white mb-4">Серіали</h3>
                                            
                                            {/* Розділи серіалів за статусом */}
                                            {Object.keys(STATUS_MAP).map(statusKey => (
                                                <div key={`tvshows-${statusKey}`} className="mb-6">
                                                    <h4 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
                                                        {STATUS_MAP[statusKey]} ({tvShowsByStatus[statusKey].length})
                                                    </h4>
                                                    {tvShowsByStatus[statusKey].length === 0 ? (
                                                        <p className="text-center text-gray-500 text-sm">
                                                            Немає серіалів у статусі "{STATUS_MAP[statusKey]}" {searchTerm && `за запитом "${searchTerm}"`}.
                                                        </p>
                                                    ) : (
                                                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                                                            {tvShowsByStatus[statusKey].map(item => (
                                                                <SeriesCard
                                                                    key={item._id}
                                                                    item={item}
                                                                    onRemove={handleDeleteItem}
                                                                    onUpdate={handleUpdateItem}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {watchlistItems.filter(item => item.mediaType === 'tv').length === 0 && !searchTerm && (
                                                <p className="text-center text-gray-400">
                                                    У вашому списку перегляду немає серіалів.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-bold mb-4 text-center text-white">Ваші оцінки</h2>
                                {loadingReviews ? (
                                    <div className="flex justify-center"><Spinner /></div>
                                ) : userReviews.length === 0 ? (
                                    <p className="text-center text-gray-400">У вас ще немає відгуків.</p>
                                ) : (
                                    <ReviewGroup reviews={userReviews} />
                                )}
                            </div>
                        )}
                    </div>
                </div> {/* Кінець flex контейнера */}

            </div>
        </div>
    );
};

export default MyLibraryPage;