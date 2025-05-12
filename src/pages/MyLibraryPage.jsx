import { useEffect, useState, useMemo, useCallback } from 'react';
import {
    getWatchlist,
    getUserReviews,
    updateWatchlistItem,
    deleteWatchlistItem,
} from '../api/user';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import { ReviewGroup } from '../components/ReviewCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const STATUS_MAP = {
    watching: 'Переглядаються',
    completed: 'Завершено',
    on_hold: 'На паузі',
    dropped: 'Видалено/Закинуто',
    plan_to_watch: 'Заплановано',
};

const MyLibraryPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [watchlistItems, setWatchlistItems] = useState([]);
    const [loadingWatchlist, setLoadingWatchlist] = useState(true);
    const [errorWatchlist, setErrorWatchlist] = useState(null);

    const [userReviews, setUserReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [errorReviews, setErrorReviews] = useState(null);

    const [activeTab, setActiveTab] = useState('watchlist');
    const [searchTerm, setSearchTerm] = useState('');

    const loadUserWatchlist = useCallback(async () => {
        if (!isAuthenticated || authLoading) {
            setLoadingWatchlist(false);
            setErrorWatchlist(null);
            setWatchlistItems([]);
            return;
        }
        setLoadingWatchlist(true);
        setErrorWatchlist(null);
        try {
            const data = await getWatchlist();
            setWatchlistItems(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
            const msg = err.response?.data?.message || 'Не вдалося завантажити список перегляду.';
            setErrorWatchlist(msg);
            toast.error(msg);
            setWatchlistItems([]);
            if (err.response?.status === 401) {
                toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
            }
        } finally {
            setLoadingWatchlist(false);
        }
    }, [isAuthenticated, authLoading]);

    const loadUserReviews = useCallback(async () => {
        if (!isAuthenticated || authLoading) {
            setLoadingReviews(false);
            setErrorReviews(null);
            setUserReviews([]);
            return;
        }
        setLoadingReviews(true);
        setErrorReviews(null);
        try {
            const reviews = await getUserReviews();
            setUserReviews(Array.isArray(reviews) ? reviews : []);
        } catch (error) {
            const msg = error.response?.data?.message || 'Не вдалося завантажити відгуки.';
            setErrorReviews(msg);
            toast.error(msg);
            setUserReviews([]);
            if (error.response?.status === 401) {
                toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
            }
        } finally {
            setLoadingReviews(false);
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            toast.info('Будь ласка, увійдіть, щоб переглянути вашу бібліотеку.');
            return;
        }
        if (isAuthenticated) {
            loadUserWatchlist();
            loadUserReviews();
        }
    }, [isAuthenticated, authLoading, navigate, loadUserWatchlist, loadUserReviews]);

    const {
        moviesByStatus,
        tvShowsByStatus,
    } = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredItems = watchlistItems.filter(item =>
            item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.genres?.some(genre => genre.toLowerCase().includes(lowerCaseSearchTerm)) ||
            item.userNotes?.toLowerCase().includes(lowerCaseSearchTerm)
        );
        const movies = filteredItems.filter(item => item.mediaType === 'movie');
        const tvShows = filteredItems.filter(item => item.mediaType === 'tv');
        const groupItemsByStatus = (items) => {
            const grouped = {};
            for (const statusKey in STATUS_MAP) {
                grouped[statusKey] = items.filter(item => item.status === statusKey);
            }
            return grouped;
        };
        return {
            moviesByStatus: groupItemsByStatus(movies),
            tvShowsByStatus: groupItemsByStatus(tvShows),
        };
    }, [watchlistItems, searchTerm]);

    const handleDeleteItem = async (itemId) => {
        if (!itemId || typeof itemId !== 'string' || itemId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
            toast.error('Невірний ID елемента.');
            return;
        }
        try {
            await deleteWatchlistItem(itemId);
            toast.success('Елемент видалено зі списку перегляду.');
            setWatchlistItems(prevItems => prevItems.filter(item => item._id !== itemId));
        } catch (err) {
            const msg = err.response?.data?.message || 'Не вдалося видалити елемент.';
            toast.error(msg);
            setErrorWatchlist(msg);
        }
    };

    const handleUpdateItem = async (itemId, updateData) => {
        if (!itemId || typeof itemId !== 'string' || itemId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
            toast.error('Невірний ID елемента.');
            return;
        }
        try {
            const updatedItem = await updateWatchlistItem(itemId, updateData);
            toast.success('Елемент оновлено.');
            setWatchlistItems(prevItems =>
                prevItems.map(item => (item._id === itemId ? updatedItem : item))
            );
            if (updateData.userRating !== undefined || updateData.userNotes !== undefined) {
                loadUserReviews();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Не вдалося оновити елемент.';
            toast.error(msg);
            setErrorWatchlist(msg);
        }
    };

    if (authLoading) {
        return <Spinner />;
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                <p>Будь ласка, увійдіть, щоб переглянути вашу бібліотеку.</p>
            </div>
        );
    }

    if (errorWatchlist && watchlistItems.length === 0 && activeTab === 'watchlist') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500 pt-24">
                Помилка завантаження списку перегляду: {errorWatchlist}
            </div>
        );
    }

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
                <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-8">
                    <div className="lg:w-full w-full">
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
                        {activeTab === 'watchlist' && (
                            <div className="bg-[#171717] p-6 rounded-lg shadow-lg">
                                <h2 className="text-2xl font-bold mb-4 text-center text-white">Список Перегляду</h2>
                                <div className="mb-6">
                                    <SearchBar
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                    />
                                </div>
                                {loadingWatchlist ? (
                                    <div className="flex justify-center"><Spinner /></div>
                                ) : (
                                    <>
                                        <div className="mb-8">
                                            <h3 className="text-xl font-semibold text-white mb-4">Фільми</h3>
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
                                        <div>
                                            <h3 className="text-xl font-semibold text-white mb-4">Серіали</h3>
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
                </div>
            </div>
        </div>
    );
};

export default MyLibraryPage;