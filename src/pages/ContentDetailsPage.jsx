// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\ContentDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ReviewFormModal from '../components/ReviewFormModal';
import ReviewItem from '../components/ReviewItem';
import { FaStar, FaBookmark, FaRegBookmark } from 'react-icons/fa';

// Переконайтеся, що імпорти з api/user.js правильні
import {
    fetchContentDetails,
    fetchContentReviews,
    submitContentReview,
    toggleContentInUserLibrary,
    fetchUserWatchlist // Переконайтеся, що використовується fetchUserWatchlist
} from '../api/user';

const ContentDetailsPage = () => {
    const { mediaType, tmdbId } = useParams();
    const { isAuthenticated, user } = useAuth();

    const [contentDetails, setContentDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userReview, setUserReview] = useState(null);

    const [isAddedToLibrary, setIsAddedToLibrary] = useState(false);
    const [isTogglingLibrary, setIsTogglingLibrary] = useState(false);

    useEffect(() => {
        const loadContentDetailsAndReviews = async () => {
            setLoading(true);
            setError(null);
            try {
                // Отримуємо деталі контенту з бекенду (або TMDB через бекенд)
                const details = await fetchContentDetails(mediaType, tmdbId);
                setContentDetails(details);

                // Отримуємо відгуки для цього контенту
                const fetchedReviews = await fetchContentReviews(mediaType, tmdbId);
                setReviews(fetchedReviews);

                // Якщо користувач автентифікований, перевіряємо його відгук та статус у бібліотеці
                if (isAuthenticated && user) {
                    // Знаходимо відгук поточного користувача серед отриманих відгуків
                    const currentUserReview = fetchedReviews.find(
                        // Порівнюємо ID рецензента з ID поточного користувача
                        (review) => review.reviewer && review.reviewer._id === user._id // ВИПРАВЛЕНО: використовуємо user._id
                    );
                    setUserReview(currentUserReview || null);

                    // Отримуємо список перегляду користувача
                    const userLibrary = await fetchUserWatchlist();

                    // ВИПРАВЛЕНО: Звертаємося до userLibrary.items та перевіряємо його
                    if (userLibrary && Array.isArray(userLibrary.items)) {
                        const currentTmdbId = String(tmdbId);
                        // Перевіряємо, чи є контент у списку перегляду користувача
                        const isInLibrary = userLibrary.items.some(
                            // Порівнюємо externalId (який є tmdbId) та mediaType
                            (item) => String(item.externalId) === currentTmdbId && item.mediaType === mediaType // ВИПРАВЛЕНО: порівнюємо externalId
                        );
                        setIsAddedToLibrary(isInLibrary);
                    } else {
                        // Логуємо попередження, якщо відповідь не є масивом елементів
                        console.warn("Отримано непередбачувану відповідь для бібліотеки користувача:", userLibrary);
                        setIsAddedToLibrary(false); // Вважаємо, що контенту немає в бібліотеці, якщо відповідь не є масивом
                    }
                }

            } catch (err) {
                console.error('Помилка завантаження деталей контенту або відгуків:', err);
                setError(err.message || 'Не вдалося завантажити деталі контенту.');
                toast.error('Не вдалося завантажити деталі контенту або відгуки.');
            } finally {
                setLoading(false);
            }
        };

        // Викликаємо функцію при зміні mediaType, tmdbId, стану автентифікації або користувача
        loadContentDetailsAndReviews();
    }, [mediaType, tmdbId, isAuthenticated, user]); // Додано user до залежностей

    // Обробник кліку на кнопку "Оцінити"
    const handleRateClick = () => {
        if (!isAuthenticated) {
            toast.info('Будь ласка, увійдіть, щоб залишити відгук.');
            return;
        }
        setShowReviewModal(true); // Відкриваємо модальне вікно відгуку
    };

    // Обробник надсилання відгуку з модального вікна
    const handleReviewSubmit = async (reviewData) => {
        // --- ДОДАНО: Лог для перевірки даних, отриманих з модального вікна ---
        console.log('ContentDetailsPage (handleReviewSubmit): Дані отримані з модального вікна:', reviewData);
        // --- ---
        try {
            // --- ВИПРАВЛЕНО: Додаємо contentTitle та contentPosterPath ---
            const reviewPayload = {
                ...reviewData, // Включає rating та comment з модального вікна
                mediaType,
                tmdbId: String(tmdbId), // Переконайтеся, що tmdbId є рядком, якщо так очікує бекенд
                reviewId: userReview ? userReview._id : null, // ID існуючого відгуку для оновлення
                contentTitle: contentDetails.title || contentDetails.name, // Додаємо назву контенту
                contentPosterPath: contentDetails.poster_path // Додаємо шлях до постера
            };
            // --- ---

            // --- ДОДАНО: Лог для перевірки об'єкта, що надсилається ---
            console.log('ContentDetailsPage (handleReviewSubmit): Об\'єкт для submitContentReview:', reviewPayload);
            // --- ---

            // Викликаємо функцію API для надсилання/оновлення відгуку
            const result = await submitContentReview(reviewPayload);

            toast.success(result.message || 'Відгук успішно збережено!');
            setShowReviewModal(false); // Закриваємо модальне вікно

            // Оновлюємо стан відгуку користувача та загальний список відгуків
            // Припускаємо, що бекенд повертає оновлений відгук у result.review
            setUserReview(result.review);

            // Оновлюємо весь список відгуків, щоб побачити зміни
            const updatedReviews = await fetchContentReviews(mediaType, tmdbId);
            setReviews(updatedReviews);

        } catch (err) {
            console.error('Помилка при збереженні відгуку:', err);
            // Відображаємо повідомлення про помилку з бекенду, якщо доступно
            toast.error(err.response?.data?.message || 'Не вдалося зберегти відгук.');
        }
    };

     // Обробник перемикання статусу в бібліотеці
    const handleToggleLibrary = async () => {
        if (!isAuthenticated) {
            toast.info('Будь ласка, увійдіть, щоб додати контент до бібліотеки.');
            return;
        }
        setIsTogglingLibrary(true); // Встановлюємо стан завантаження для кнопки
        try {
            // Формуємо об'єкт даних контенту для надсилання на бекенд
            const contentData = {
                mediaType,
                tmdbId: String(tmdbId), // Переконайтеся, що tmdbId є рядком
                title: contentDetails.title || contentDetails.name, // Назва
                poster_path: contentDetails.poster_path, // Шлях до постера
                release_date: contentDetails.release_date || contentDetails.first_air_date, // Дата релізу
                overview: contentDetails.overview, // Опис
                genres: contentDetails.genres, // Жанри
                backdrop_path: contentDetails.backdrop_path, // Шлях до фонового зображення
                // Можливо, додайте інші поля, які ваш бекенд очікує для WatchlistItem
            };

            console.log("ContentDetailsPage: Відправляємо до бекенду для toggle:", contentData);

            // Викликаємо функцію API для перемикання статусу в бібліотеці
            const response = await toggleContentInUserLibrary(contentData);

            // Оновлюємо стан isAddedToLibrary на основі відповіді бекенду
            setIsAddedToLibrary(response.added);
            // Відображаємо повідомлення про успіх
            toast.success(response.message);

        } catch (err) {
            console.error('Помилка при оновленні бібліотеки:', err);
            // Обробка помилок, включаючи помилку авторизації
            if (err.message === 'Користувач не авторизований. Будь ласка, увійдіть.') {
                 toast.error(err.message);
            } else {
                 toast.error(err.response?.data?.message || 'Не вдалося оновити бібліотеку.');
            }
        } finally {
            setIsTogglingLibrary(false); // Завершуємо стан завантаження
        }
    };


    // Допоміжна функція для формування URL постера
    const getPosterUrl = (path, size = 'w500') => {
        return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    };

    // Визначаємо назву та рік релізу для відображення
    const displayTitle = contentDetails?.title || contentDetails?.name;
    const displayReleaseDate = contentDetails?.release_date || contentDetails?.first_air_date;
    const releaseYear = displayReleaseDate ? new Date(displayReleaseDate).getFullYear() : 'Невідомий';

    // Умовне відображення: завантаження, помилка, контент не знайдено
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">
                Завантаження деталей контенту...
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

    if (!contentDetails) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">
                Контент не знайдено.
            </div>
        );
    }

    // Основний рендер компонента
    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                {/* Секція деталей контенту */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 bg-[#1e1e1e] rounded-lg shadow-lg p-6">
                    <img
                        src={getPosterUrl(contentDetails.poster_path || contentDetails.backdrop_path)}
                        alt={displayTitle}
                        className="w-64 h-auto rounded-lg shadow-md md:w-80"
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold text-[#e50914] mb-4">{displayTitle}</h1>
                        <p className="text-gray-300 text-lg mb-2">{contentDetails.tagline}</p>
                        <p className="text-gray-400 mb-4">
                            {mediaType === 'movie' ? 'Фільм' : 'Серіал'} ({releaseYear})
                        </p>
                        <p className="text-gray-200 text-base leading-relaxed mb-6">
                            {contentDetails.overview}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {contentDetails.genres && contentDetails.genres.map(genre => (
                                <span key={genre.id} className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full">
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        {/* Кнопки дії (Оцінити, Додати до бібліотеки) */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4">
                            {isAuthenticated && (
                                <button
                                    onClick={handleRateClick}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <FaStar />
                                    <span>{userReview ? 'Редагувати відгук' : 'Оцінити'}</span>
                                </button>
                            )}
                            {isAuthenticated && (
                                <button
                                    onClick={handleToggleLibrary}
                                    className={`font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2
                                                ${isAddedToLibrary ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                                                ${isTogglingLibrary ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={isTogglingLibrary}
                                >
                                    {isTogglingLibrary ? (
                                        <span>Завантаження...</span>
                                    ) : (
                                        <>
                                            {isAddedToLibrary ? <FaBookmark /> : <FaRegBookmark />}
                                            <span>{isAddedToLibrary ? 'Видалити з бібліотеки' : 'Додати до бібліотеки'}</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {!isAuthenticated && (
                                <p className="text-gray-400 text-sm text-center sm:text-left">
                                    Увійдіть, щоб оцінити або додати цей {mediaType === 'movie' ? 'фільм' : 'серіал'} до бібліотеки.
                                </p>
                            )}
                        </div>

                    </div>
                </div>

                {/* Секція відгуків */}
                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-[#e50914] mb-6 text-center">Відгуки користувачів</h2>
                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map(review => (
                                // Передаємо review._id як key
                                <ReviewItem key={review._id} review={review} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 text-lg">
                            Поки що немає відгуків. Будь першим!
                        </p>
                    )}
                </div>
            </div>

            {/* Модальне вікно для форми відгуку */}
            {showReviewModal && contentDetails && (
                <ReviewFormModal
                    // Передаємо необхідні дані контенту в модальне вікно
                    item={{
                        ...contentDetails,
                        media_type: mediaType, // Додаємо media_type
                        id: tmdbId // Додаємо tmdbId як id
                    }}
                    onClose={() => setShowReviewModal(false)}
                    onReviewSubmit={handleReviewSubmit}
                    existingReview={userReview}
                />
            )}
        </div>
    );
};

export default ContentDetailsPage;