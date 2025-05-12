import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchContentDetails } from '../api/content'; // Переконайтеся, що ця функція може отримувати credits та videos
import {
    getUserReviewForContent,
    submitContentReview,
    deleteUserReview,
    toggleContentInUserLibrary,
    getUserWatchlistStatus,
} from '../api/user';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ReviewFormModal from '../components/ReviewFormModal';
import CastSection from '../components/CastSection'; // Новий імпорт
import TrailersSection from '../components/TrailersSection'; // Новий імпорт
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Star, Eye, Heart, List, Trash, Edit, CalendarDays, Clock } from 'lucide-react';

const ContentDetailsPage = () => {
    const { mediaType, tmdbId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);

    console.log('useParams values (mediaType, tmdbId):', { mediaType, tmdbId });

    const [contentDetails, setContentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [userWatchlistStatus, setUserWatchlistStatus] = useState(null);
    const [cast, setCast] = useState([]); // Новий стан для акторського складу
    const [trailers, setTrailers] = useState([]); // Новий стан для трейлерів

    // Fetch content details based on mediaType and tmdbId from URL params
    useEffect(() => {
        const loadContentDetails = async () => {
            // Basic validation for URL parameters
            if (!mediaType || !tmdbId) {
                console.error("ContentDetailsPage: Missing mediaType or tmdbId in URL params.");
                setError('Неповна інформація про контент. Будь ласка, переконайтеся, що URL коректний.');
                setLoading(false);
                return;
            }

            console.log(`ContentDetailsPage: Завантаження деталей для ${mediaType}/${tmdbId}...`);
            try {
                setLoading(true);
                // Припускаємо, що fetchContentDetails тепер повертає credits та videos
                const details = await fetchContentDetails(mediaType, tmdbId);
                setContentDetails(details);
                setCast(details.credits?.cast || []); // Отримуємо акторський склад з details.credits
                // Фільтруємо лише офіційні трейлери з YouTube
                const youtubeTrailers = details.videos?.results.filter(video =>
                    video.type === 'Trailer' && video.site === 'YouTube'
                ) || [];
                setTrailers(youtubeTrailers);

                console.log('ContentDetailsPage: Отримано деталі:', details);
                console.log('ContentDetailsPage: Отримано акторський склад:', details.credits?.cast);
                console.log('ContentDetailsPage: Отримано трейлери:', youtubeTrailers);
            } catch (err) {
                console.error("ContentDetailsPage: Помилка завантаження деталей контенту:", err);
                setError('Не вдалося завантажити деталі контенту. Спробуйте пізніше.');
            } finally {
                setLoading(false);
            }
        };
        loadContentDetails();
    }, [mediaType, tmdbId]); // Re-run effect if mediaType or tmdbId changes

    // Fetch user's review for this specific content (if authenticated and content details are loaded)
    useEffect(() => {
        const loadUserReview = async () => {
            // Ensure all necessary data (user, contentDetails, URL params) is available before fetching
            if (isAuthenticated && user && contentDetails && mediaType && tmdbId) {
                console.log(`ContentDetailsPage: Завантаження відгуку користувача для ${mediaType}/${tmdbId}...`);
                try {
                    const review = await getUserReviewForContent(mediaType, tmdbId);
                    setUserReview(review); // Встановлюємо відгук (буде null, якщо не знайдено)
                    console.log('ContentDetailsPage: Отримано відгук користувача:', review);
                } catch (err) {
                    console.error("ContentDetailsPage: Помилка завантаження відгуку користувача:", err.response?.data || err);
                    //setError('Не вдалося завантажити ваш відгук. Спробуйте пізніше.'); // Закоментовано, щоб не перекривати інші помилки
                }
            }
        };
        loadUserReview();
    }, [isAuthenticated, user, contentDetails, mediaType, tmdbId]); // Dependencies for re-fetching user review

    // Fetch user's watchlist status for this content (if authenticated and content details are loaded)
    useEffect(() => {
        const loadUserWatchlistStatus = async () => {
            // Ensure all necessary data is available before fetching watchlist status
            if (isAuthenticated && user && contentDetails && mediaType && tmdbId) {
                try {
                    const itemInLibrary = await getUserWatchlistStatus(mediaType, tmdbId);
                    console.log('ContentDetailsPage: Отримано статус списку перегляду користувача:', itemInLibrary);

                    setUserWatchlistStatus(itemInLibrary ? itemInLibrary.status : null);
                } catch (err) {
                    console.error("ContentDetailsPage: Помилка завантаження статусу списку перегляду користувача:", err.response?.data || err);
                    // setError('Не вдалося завантажити статус списку перегляду. Спробуйте пізніше.'); // Закоментовано, щоб не перекривати інші помилки
                }
            }
        };
        loadUserWatchlistStatus();
    }, [isAuthenticated, user, contentDetails, mediaType, tmdbId]); // Dependencies for re-fetching watchlist status


    // Handler for submitting or updating a review
    const handleReviewSubmit = async (reviewData) => {
        console.log("ContentDetailsPage: Надсилання відгуку:", {
            mediaType,
            tmdbId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            reviewId: reviewData.reviewId,
            contentTitle: contentDetails?.title || contentDetails?.name,
            contentPosterPath: contentDetails?.poster_path
        });

        try {
            if (!user || !isAuthenticated) {
                navigate('/login'); // Redirect to login if not authenticated
                return;
            }

            if (!mediaType || !tmdbId) {
                setError('Неможливо надіслати відгук: відсутній тип медіа або ID контенту.');
                console.error('handleReviewSubmit: mediaType or tmdbId is undefined/null.');
                return;
            }

            const reviewPayload = {
                tmdbId: tmdbId,
                mediaType: mediaType,
                rating: reviewData.rating,
                comment: reviewData.comment,
                reviewId: reviewData.reviewId, // Буде null для нового, ID для оновлення
                contentTitle: contentDetails?.title || contentDetails?.name,
                contentPosterPath: contentDetails?.poster_path,
            };

            const response = await submitContentReview(reviewPayload);
            setUserReview(response); // Оновлюємо локальний стан
            setIsReviewModalOpen(false); // Закриваємо модальне вікно

            // Перезавантажуємо відгук користувача, щоб UI був повністю синхронізований
            const updatedUserReview = await getUserReviewForContent(mediaType, tmdbId);
            setUserReview(updatedUserReview);
            console.log("ContentDetailsPage: Відгук успішно надіслано/оновлено:", response);
        } catch (err) {
            console.error("ContentDetailsPage: Помилка при надсиланні відгуку:", err.response?.data || err);
            setError(err.response?.data?.message || 'Не вдалося надіслати відгук. Спробуйте пізніше.');
        }
    };

    // Handler for deleting a review
    const handleReviewDelete = async (reviewId) => {
        try {
            if (!user || !isAuthenticated) {
                navigate('/login');
                return;
            }
            await deleteUserReview(reviewId);
            setUserReview(null); // Clear the user's review from state
            console.log("ContentDetailsPage: Відгук успішно видалено.");
        } catch (err) {
            console.error("ContentDetailsPage: Помилка при видаленні відгуку:", err.response?.data || err);
            setError('Не вдалося видалити відгук. Спробуйте пізніше.');
        }
    };

    // Handler for toggling content status in user's library (watchlist)
    const handleToggleWatchlist = async (status) => {
        console.log("handleToggleWatchlist: Поточні значення mediaType:", mediaType, "та tmdbId:", tmdbId);
        console.log("ContentDetailsPage: Перемикання статусу списку перегляду:", {
            externalId: tmdbId,
            mediaType: mediaType,
            title: contentDetails?.title || contentDetails?.name,
            posterPath: contentDetails?.poster_path,
            releaseDate: contentDetails?.release_date || contentDetails?.first_air_date,
            genres: contentDetails?.genres ? contentDetails.genres.map(g => g.name) : [],
            overview: contentDetails?.overview,
            status: status
        });

        try {
            if (!user || !isAuthenticated) {
                navigate('/login');
                return;
            }

            if (!mediaType || !tmdbId) {
                setError('Неможливо оновити список перегляду: відсутній тип медіа або ID контенту.');
                console.error('handleToggleWatchlist: mediaType or tmdbId is undefined/null.');
                return;
            }

            const contentData = {
                externalId: tmdbId,
                mediaType: mediaType,
                title: contentDetails?.title || contentDetails?.name,
                posterPath: contentDetails?.poster_path,
                releaseDate: contentDetails?.release_date || contentDetails?.first_air_date,
                genres: contentDetails?.genres ? contentDetails.genres.map(g => g.name) : [],
                overview: contentDetails?.overview,
                status: status
            };

            console.log("handleToggleWatchlist: Дані, що відправляються до бекенду:", contentData);

            const response = await toggleContentInUserLibrary(contentData);
            console.log("ContentDetailsPage: Статус списку перегляду оновлено:", response);
            // Оновлюємо локальний стан на основі відповіді від бекенду
            setUserWatchlistStatus(response.status);
        } catch (err) {
            console.error("ContentDetailsPage: Помилка при перемиканні списку перегляду:", err.response?.data || err);
            setError(err.response?.data?.message || 'Не вдалося оновити список перегляду. Спробуйте пізніше.');
        }
    };

    // Render loading spinner while fetching details
    if (loading) {
        return (
            <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
                <Spinner />
            </div>
        );
    }

    // Render error message if an error occurred
    if (error) {
        return (
            <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4 text-red-500">
                Помилка: {error}
            </div>
        );
    }

    // Render "Content not found" if contentDetails is null after loading
    if (!contentDetails) {
        return (
            <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4 text-gray-400">
                Контент не знайдено.
            </div>
        );
    }

    // Format release date and runtime for display
    const releaseDate = contentDetails.release_date || contentDetails.first_air_date;
    const formattedReleaseDate = releaseDate ? format(new Date(releaseDate), 'dd MMMM yyyy', { locale: uk }) : 'Невідомо';
    const runtime = contentDetails.runtime || contentDetails.episode_run_time?.[0] || null;

    return (
        <div className="min-h-screen bg-[#1E1E1E] text-white p-6 lg:p-8">
            <div className="max-w-6xl mx-auto bg-[#171717] rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                    {contentDetails.backdrop_path && (
                        <img
                            src={`https://image.tmdb.org/t/p/original${contentDetails.backdrop_path}`}
                            alt={contentDetails.title || contentDetails.name}
                            className="w-full h-[300px] object-cover object-top opacity-30"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-transparent to-transparent"></div>

                    <div className="relative flex flex-col md:flex-row items-center md:items-start p-4 md:p-8 -mt-20 md:-mt-24">
                        <img
                            src={contentDetails.poster_path ? `https://image.tmdb.org/t/p/w500${contentDetails.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Poster'}
                            alt={contentDetails.title || contentDetails.name}
                            className="w-[200px] h-[300px] rounded-lg shadow-xl flex-shrink-0 object-cover border-2 border-gray-900"
                        />
                        <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{contentDetails.title || contentDetails.name}</h1>
                            <p className="text-gray-400 text-lg mb-2">{contentDetails.tagline}</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                                {contentDetails.genres && contentDetails.genres.map(genre => (
                                    <span key={genre.id} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-300 text-base leading-relaxed mb-4 max-w-2xl">
                                {contentDetails.overview}
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start text-gray-400 mb-6">
                                {releaseDate && (
                                    <div className="flex items-center">
                                        <CalendarDays className="w-5 h-5 mr-2" />
                                        <span>{formattedReleaseDate}</span>
                                    </div>
                                )}
                                {runtime && (
                                    <div className="flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        <span>{runtime} хв</span>
                                    </div>
                                )}
                                {contentDetails.vote_average > 0 && (
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" />
                                        <span>{contentDetails.vote_average.toFixed(1)} ({contentDetails.vote_count})</span>
                                    </div>
                                )}
                            </div>
                            {isAuthenticated && (
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    {/* Кнопка "Написати відгук" / "Редагувати відгук" */}
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                                    >
                                        <Edit className="w-5 h-5 mr-2" />
                                        {userReview ? 'Редагувати відгук' : 'Написати відгук'}
                                    </button>

                                    {/* Єдина кнопка "Додати до бібліотеки" / "Видалити з бібліотеки" */}
                                    <button
                                        // Якщо контент у бібліотеці (userWatchlistStatus не null), видаляємо його (status: null)
                                        // Якщо контент не в бібліотеці (userWatchlistStatus null), додаємо його зі статусом 'plan_to_watch'
                                        onClick={() => handleToggleWatchlist(userWatchlistStatus ? null : 'plan_to_watch')}
                                        className={`flex items-center ${userWatchlistStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out`}
                                    >
                                        <List className="w-5 h-5 mr-2" /> {/* Використовуємо іконку списку як загальну для бібліотеки */}
                                        {userWatchlistStatus ? 'Видалити з бібліотеки' : 'Додати до бібліотеки'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isAuthenticated && userReview && (
                    <div className="p-8 border-t border-gray-900 mt-8">
                        <h3 className="text-2xl font-bold text-white mb-4">Ваш відгук</h3>
                        <div className="bg-[#171717] rounded-lg p-6 shadow-md">
                            <div className="flex items-center mb-4">
                                <Star className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" />
                                <span className="text-xl font-semibold">{userReview.rating}</span>
                            </div>
                            <p className="text-gray-300 mb-4">{userReview.comment}</p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="flex items-center bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                                >
                                    <Edit className="w-5 h-5 mr-2" />
                                    Редагувати
                                </button>
                                <button
                                    onClick={() => handleReviewDelete(userReview._id)}
                                    className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                                >
                                    <Trash className="w-5 h-5 mr-2" />
                                    Видалити
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Нова секція "Акторський склад" */}
                <div className="p-8 border-t border-gray-900 mt-8">
                    <CastSection cast={cast} />
                </div>

                {/* Нова секція "Трейлери" */}
                <div className="p-8 border-t border-gray-900 mt-8">
                    <TrailersSection trailers={trailers} />
                </div>

                {/* УМОВНИЙ РЕНДЕРИНГ: Рендеримо модальне вікно лише, якщо воно відкрите І contentDetails вже завантажено */}
                {isReviewModalOpen && contentDetails && (
                    <ReviewFormModal
                        isOpen={isReviewModalOpen}
                        onClose={() => setIsReviewModalOpen(false)}
                        onSubmit={handleReviewSubmit}
                        initialReview={userReview}
                        item={contentDetails}
                        contentTitle={contentDetails.title || contentDetails.name}
                        contentPosterPath={contentDetails.poster_path}
                    />
                )}
            </div>
        </div>
    );
};

export default ContentDetailsPage;