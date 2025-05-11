// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\MyLibraryPage.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import SearchBar from '../components/SearchBar';
import ReviewItem from '../components/ReviewItem'; // Компонент ReviewItem імпортовано

import { fetchUserLibrary, removeContentFromUserLibrary } from '../api/user'; 

// ПРИКЛАД: Вам потрібно буде реалізувати реальну функцію fetchUserReviews у вашому API-файлі.
// Наприклад, у client/src/api/user.js або client/src/api/reviews.js
const fetchUserReviews = async () => {
    // У реальному застосунку це був би API-виклик до вашого бекенду, наприклад:
    // const response = await api.get('/api/reviews/user'); // Припустимо, у вас є такий маршрут для відгуків користувача
    // return response.data.reviews;

    // Приклад тестових даних для демонстрації (видаліть або замініть на реальні дані):
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    _id: 'rev1',
                    reviewer: { username: 'Кіноманія' }, // Припускаємо, що reviewer має поле username
                    rating: 8, // Рейтинг на 1-10
                    comment: 'Це був чудовий фільм, мені дуже сподобався сюжет та акторська гра!',
                    createdAt: '2024-01-15T10:00:00Z',
                },
                {
                    _id: 'rev2',
                    reviewer: { username: 'Серіаломан' },
                    rating: 4,
                    comment: 'На жаль, цей серіал не виправдав моїх очікувань. Досить нудно.',
                    createdAt: '2024-02-20T14:30:00Z',
                },
                {
                    _id: 'rev3',
                    reviewer: { username: 'Любитель Кіно' },
                    rating: 10,
                    comment: 'Абсолютний шедевр! Рекомендую всім.',
                    createdAt: '2024-03-05T09:00:00Z',
                },
            ]);
        }, 500); // Імітація затримки мережі
    });
};


const MyLibraryPage = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [libraryContent, setLibraryContent] = useState([]);
    const [userReviews, setUserReviews] = useState([]); // Новий стан для відгуків користувача
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(true); // Новий стан завантаження для відгуків
    const [reviewsError, setReviewsError] = useState(null);     // Новий стан помилки для відгуків

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            toast.info('Будь ласка, увійдіть, щоб переглянути свою бібліотеку.');
            return;
        }

        const loadUserLibrary = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchUserLibrary();
                setLibraryContent(Array.isArray(data.items) ? data.items : []);
            } catch (err) {
                console.error('Помилка завантаження бібліотеки:', err);
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

        const loadUserReviews = async () => { // Нова функція для завантаження відгуків
            setReviewsLoading(true);
            setReviewsError(null);
            try {
                const reviewsData = await fetchUserReviews(); // Виклик вашого API для відгуків
                setUserReviews(reviewsData);
            } catch (err) {
                console.error('Помилка завантаження відгуків:', err);
                setReviewsError(err.message || 'Не вдалося завантажити ваші відгуки.');
                toast.error('Не вдалося завантажити ваші відгуки.');
            } finally {
                setReviewsLoading(false);
            }
        };

        loadUserLibrary();
        loadUserReviews(); // Викликаємо функцію для завантаження відгуків
    }, [isAuthenticated, navigate, logout]);

    const handleRemoveContent = async (contentId, title) => {
        if (!window.confirm(`Ви впевнені, що хочете видалити "${title}" зі своєї бібліотеки?`)) {
            return;
        }

        try {
            await removeContentFromUserLibrary(contentId);
            toast.success(`"${title}" успішно видалено з бібліотеки!`);
            setLibraryContent(prev => prev.filter(item => item._id !== contentId));
        } catch (err) {
            console.error(`Помилка при видаленні контенту "${title}":`, err);
            const msg = err.response?.data?.message || 'Не вдалося видалити контент.';
            toast.error(msg);
            setError(msg);
        }
    };

    if (!isAuthenticated) {
        return null; 
    }

    if (loading || reviewsLoading) { // Перевіряємо обидва стани завантаження
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">
                Завантаження даних... {/* Змінено текст на більш загальний */}
            </div>
        );
    }

    if (error || reviewsError) { // Перевіряємо обидва стани помилок
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500">
                Помилка: {error || reviewsError} {/* Відображає першу наявну помилку */}
            </div>
        );
    }

    // Розділяємо контент на фільми та серіали
    const moviesInLibrary = libraryContent.filter(item => item.mediaType === 'movie');
    const seriesInLibrary = libraryContent.filter(item => item.mediaType === 'tv');

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-[#e50914]">Моя Бібліотека</h1>
                
                {/* Компонент SearchBar для глобального пошуку */}
                <div className="mb-8 flex justify-center">
                    <SearchBar />
                </div>

                {/* Умовний рендеринг, якщо немає ані контенту, ані відгуків */}
                {libraryContent.length === 0 && userReviews.length === 0 ? (
                    <div className="text-center text-gray-400 text-lg">
                        <p className="mb-4">У вашій бібліотеці поки що немає контенту та відгуків.</p>
                        <p>Додайте фільми або серіали та залиште відгуки!</p>
                    </div>
                ) : (
                    <>
                        {/* Секція для фільмів */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-6 text-white text-center">Фільми</h2>
                            {moviesInLibrary.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {moviesInLibrary.map(item => (
                                        <MovieCard key={item._id} item={item} onRemove={handleRemoveContent} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 text-lg">
                                    <p>У вашій бібліотеці поки що немає фільмів.</p>
                                </div>
                            )}
                        </div>

                        {/* Горизонтальний розділювач, якщо є і фільми, і серіали */}
                        {(moviesInLibrary.length > 0 && seriesInLibrary.length > 0) && (
                            <hr className="my-10 border-gray-500" />
                        )}
                        
                        {/* Секція для серіалів */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-6 text-[#e50914] text-center">Серіали</h2>
                            {seriesInLibrary.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {seriesInLibrary.map(item => (
                                        <SeriesCard key={item._id} item={item} onRemove={handleRemoveContent} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 text-lg">
                                    <p>У вашій бібліотеці поки що немає серіалів.</p>
                                </div>
                            )}
                        </div>

                        {/* Горизонтальний розділювач перед відгуками, якщо є інший контент або відгуки */}
                        {(userReviews.length > 0 || (moviesInLibrary.length > 0 || seriesInLibrary.length > 0)) && (
                            <hr className="my-10 border-gray-500" />
                        )}
                        
                        {/* Нова Секція для відгуків користувача */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold mb-6 text-white text-center">Ваші Відгуки</h2>
                            {userReviews.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {userReviews.map(review => (
                                        <ReviewItem key={review._id} review={review} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 text-lg">
                                    <p>У вас поки що немає відгуків.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyLibraryPage;