// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\MyLibraryPage.jsx
import React, { useEffect, useState, useMemo } from 'react'; // Додано useMemo
// Імпортуємо потрібні функції API
import { fetchUserWatchlist, deleteWatchlistItem, updateWatchlistItem, getUserReviews } from '../api/user';
import Header from '../components/Header';
import Spinner from '../components/Spinner'; // Припускаємо, що у вас є компонент Spinner
// --- ДОДАНО: Імпорт компонента SearchBar (припускаємо, що він керований) ---
import SearchBar from '../components/SearchBar';
// --- ---
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ReviewCard, { ReviewGroup } from '../components/ReviewCard'; // Імпортуємо ReviewCard та ReviewGroup

const MyLibraryPage = () => {
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

    // --- СТАН ДЛЯ ПОШУКУ (керований) ---
    const [searchTerm, setSearchTerm] = useState('');
    // --- ---

    // Функція для завантаження списку перегляду користувача
    const loadUserWatchlist = async () => {
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
            // ВИПРАВЛЕНО: Викликаємо fetchUserWatchlist
            // Наразі отримуємо весь список, фільтрація буде на фронтенді
            const data = await fetchUserWatchlist();
            console.log('MyLibraryPage: Отримано список перегляду:', data);
            // Припускаємо, що fetchUserWatchlist повертає об'єкт з полем 'items'
            setWatchlistItems(Array.isArray(data.items) ? data.items : []);
        } catch (err) {
            console.error('MyLibraryPage: Помилка завантаження списку перегляду:', err);
            const msg = err.response?.data?.message || 'Не вдалося завантажити список перегляду.';
            setErrorWatchlist(msg);
            toast.error(msg);
            setWatchlistItems([]); // Очищаємо список при помилці
            if (err.response?.status === 401) {
                toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                // logout(); // Викликайте logout з AuthContext, якщо він доступний
            }
        } finally {
            setLoadingWatchlist(false);
        }
    };

    // Функція для завантаження відгуків користувача
     const loadUserReviews = async () => {
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
             const reviews = await getUserReviews(); // Викликаємо функцію API для відгуків
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
                 // logout(); // Викликайте logout з AuthContext
             }
         } finally {
             setLoadingReviews(false);
         }
     };


    useEffect(() => {
        // Перенаправляємо, якщо користувач не автентифікований після завершення завантаження AuthContext
        if (!authLoading && !isAuthenticated) {
             navigate('/login');
             toast.info('Будь ласка, увійдіть, щоб переглянути вашу бібліотеку.');
             return;
        }

        // Завантажуємо дані, якщо користувач автентифікований
        if (isAuthenticated) {
            loadUserWatchlist();
            loadUserReviews(); // Завантажуємо відгуки
        }

    }, [isAuthenticated, authLoading, navigate]); // Залежності: перезавантажуємо при зміні стану автентифікації

    // --- ВИКОРИСТАННЯ useMemo ДЛЯ ФІЛЬТРАЦІЇ ---
    // Фільтруємо список перегляду на основі searchTerm
    const filteredWatchlistItems = useMemo(() => {
        if (!searchTerm) {
            return watchlistItems; // Якщо пошуковий запит порожній, повертаємо весь список
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return watchlistItems.filter(item =>
            item.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.genres?.some(genre => genre.toLowerCase().includes(lowerCaseSearchTerm)) ||
             item.userNotes?.toLowerCase().includes(lowerCaseSearchTerm) // Можливо, шукати по нотатках
            // Додайте інші поля, за якими хочете шукати
        );
    }, [watchlistItems, searchTerm]); // Перераховуємо лише при зміні списку або запиту
    // --- ---


    // Обробник видалення елемента зі списку перегляду
    const handleDeleteItem = async (itemId) => {
        // Перевіряємо, чи ID є валідним ObjectId перед відправкою на бекенд
        if (!itemId || typeof itemId !== 'string' || itemId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
             toast.error('Невірний ID елемента.');
             console.error('Attempted to delete with invalid itemId:', itemId);
             return;
        }

        try {
            // ВИПРАВЛЕНО: Викликаємо deleteWatchlistItem
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
    // Ця функція буде викликатися з компонента WatchlistItemCard або подібного
    const handleUpdateItem = async (itemId, updateData) => {
         // Перевіряємо, чи ID є валідним ObjectId перед відправкою на бекенд
        if (!itemId || typeof itemId !== 'string' || itemId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
             toast.error('Невірний ID елемента.');
             console.error('Attempted to update with invalid itemId:', itemId);
             return;
        }
        console.log(`MyLibraryPage: Оновлення елемента ${itemId} з даними:`, updateData);
        try {
            // ВИПРАВЛЕНО: Викликаємо updateWatchlistItem
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


    // Функція для примусового оновлення даних (наприклад, по кнопці)
    const handleRefreshClick = () => {
        loadUserWatchlist();
        loadUserReviews();
    };


    // Показуємо спінер, якщо автентифікація ще не завершена
    if (authLoading) {
        return <Spinner />;
    }

    // Якщо користувач не автентифікований після завантаження
    if (!isAuthenticated) {
        // navigate('/login'); // Перенаправлення вже відбувається в useEffect
        return (
             <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                 <Header />
                 <p>Будь ласка, увійдіть, щоб переглянути вашу бібліотеку.</p>
             </div>
        );
    }

    // Відображення, якщо є помилка завантаження списку перегляду
    if (errorWatchlist && watchlistItems.length === 0 && activeTab === 'watchlist') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500 pt-24">
                <Header />
                Помилка завантаження списку перегляду: {errorWatchlist}
            </div>
        );
    }

     // Відображення, якщо є помилка завантаження відгуків
    if (errorReviews && userReviews.length === 0 && activeTab === 'reviews') {
         return (
             <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500 pt-24">
                 <Header />
                 Помилка завантаження відгуків: {errorReviews.message || 'Невідома помилка'}
             </div>
         );
    }


    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-[#e50914]">Моя Бібліотека</h1>

                {/* Кнопка оновлення */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleRefreshClick}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                        Оновити
                    </button>
                </div>

                {/* Вкладки */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setActiveTab('watchlist')}
                        className={`py-2 px-6 text-lg font-semibold rounded-l-lg transition-colors ${activeTab === 'watchlist' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Список Перегляду ({watchlistItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`py-2 px-6 text-lg font-semibold rounded-r-lg transition-colors ${activeTab === 'reviews' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Мої Відгуки ({userReviews.length})
                    </button>
                </div>

                {/* Вміст вкладок */}
                {activeTab === 'watchlist' && (
                    <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Список Перегляду</h2>

                        {/* --- ВИКОРИСТОВУЄМО КОМПОНЕНТ ПОШУКУ --- */}
                        <div className="mb-6">
                            <SearchBar
                                searchTerm={searchTerm} // Передаємо стан пошукового запиту
                                onSearchChange={setSearchTerm} // Передаємо функцію для його оновлення
                                placeholder="Пошук за назвою, жанром або нотатками..."
                            />
                        </div>
                        {/* --- --- */}


                        {/* ВИПРАВЛЕНО: Корекція синтаксису умовного рендерингу */}
                        {loadingWatchlist ? (
                            <div className="flex justify-center"><Spinner /></div>
                        ) : filteredWatchlistItems.length === 0 ? (
                            <p className="text-center text-gray-400">
                                {searchTerm ? `Нічого не знайдено за запитом "${searchTerm}".` : 'Ваш список перегляду порожній.'}
                            </p>
                        ) : (
                             // ВИПРАВЛЕНО: Переконались, що div коректно закритий
                             <div className="flex gap-6 justify-center flex-wrap">
                                {/* ВИКОРИСТОВУЄМО filteredWatchlistItems ДЛЯ ВІДОБРАЖЕННЯ */}
                                {filteredWatchlistItems.map(item => (
                                     // Передаємо дані елемента списку перегляду до ReviewCard
                                     // ReviewCard очікує поля tmdbId, mediaType, title, posterPath, rating (userRating), comment (userNotes)
                                    <ReviewCard
                                        key={item._id}
                                        review={{ // Форматуємо об'єкт для ReviewCard
                                            _id: item._id, // Важливо для ключа та видалення
                                            tmdbId: item.externalId,
                                            mediaType: item.mediaType,
                                            title: item.title,
                                            posterPath: item.posterPath, // Або item.poster_full_url, якщо бекенд його додає
                                            rating: item.userRating, // Використовуємо userRating як rating
                                            comment: item.userNotes, // Використовуємо userNotes як comment
                                            updatedAt: item.updatedAt,
                                            // Додайте інші поля, які потрібні ReviewCard
                                        }}
                                        // Можливо, передайте обробники видалення/оновлення до ReviewCard, якщо вони там потрібні
                                        // onDelete={() => handleDeleteItem(item._id)}
                                        // onUpdate={(updateData) => handleUpdateItem(item._id, updateData)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Мої Відгуки та Оцінки</h2>
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
    );
};

export default MyLibraryPage;


