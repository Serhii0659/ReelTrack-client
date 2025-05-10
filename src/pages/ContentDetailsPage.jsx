// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\ContentDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ReviewFormModal from '../components/ReviewFormModal';
import ReviewItem from '../components/ReviewItem';
import { FaStar, FaBookmark, FaRegBookmark } from 'react-icons/fa';

import { fetchContentDetails, fetchContentReviews, submitContentReview, toggleContentInUserLibrary, fetchUserLibrary } from '../api/user'; 

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
                const details = await fetchContentDetails(mediaType, tmdbId);
                setContentDetails(details);

                const fetchedReviews = await fetchContentReviews(mediaType, tmdbId);
                setReviews(fetchedReviews);

                if (isAuthenticated && user) {
                    const currentUserReview = fetchedReviews.find(
                        (review) => review.reviewer && review.reviewer._id === user.id
                    );
                    setUserReview(currentUserReview || null);

                    const userLibrary = await fetchUserLibrary(); 
                    
                    // ВИПРАВЛЕНО: Звертаємося до userLibrary.items
                    if (userLibrary && Array.isArray(userLibrary.items)) { // Перевіряємо, чи userLibrary існує і userLibrary.items є масивом
                        const currentTmdbId = String(tmdbId); 
                        const isInLibrary = userLibrary.items.some( // <--- ЗМІНЕНО ТУТ: userLibrary.items.some
                            (item) => String(item.tmdbId) === currentTmdbId && item.mediaType === mediaType
                        );
                        setIsAddedToLibrary(isInLibrary);
                    } else {
                        // Оновив повідомлення для більшої ясності
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

        loadContentDetailsAndReviews();
    }, [mediaType, tmdbId, isAuthenticated, user]); 

    const handleRateClick = () => {
        if (!isAuthenticated) {
            toast.info('Будь ласка, увійдіть, щоб залишити відгук.');
            return;
        }
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (reviewData) => {
        try {
            const result = await submitContentReview({
                ...reviewData,
                mediaType,
                tmdbId,
                reviewId: userReview ? userReview._id : null,
            });
            toast.success(result.message || 'Відгук успішно збережено!');
            setShowReviewModal(false);
            
            setUserReview(result.review); 
            
            const updatedReviews = await fetchContentReviews(mediaType, tmdbId);
            setReviews(updatedReviews);

        } catch (err) {
            console.error('Помилка при збереженні відгуку:', err);
            toast.error(err.response?.data?.message || 'Не вдалося зберегти відгук.');
        }
    };

    const handleToggleLibrary = async () => {
        if (!isAuthenticated) {
            toast.info('Будь ласка, увійдіть, щоб додати контент до бібліотеки.');
            return;
        }
        setIsTogglingLibrary(true);
        try {
            const contentData = {
                mediaType,
                tmdbId: String(tmdbId),
                title: contentDetails.title || contentDetails.name,
                poster_path: contentDetails.poster_path,
                release_date: contentDetails.release_date || contentDetails.first_air_date,
                overview: contentDetails.overview,
                genres: contentDetails.genres,
                backdrop_path: contentDetails.backdrop_path
            };
            
            console.log("Відправляємо до бекенду для toggle:", { mediaType, tmdbId, contentData });
            const response = await toggleContentInUserLibrary(contentData);

            setIsAddedToLibrary(response.added); 
            toast.success(response.message);
        } catch (err) {
            console.error('Помилка при оновленні бібліотеки:', err);
            if (err.message === 'Користувач не авторизований. Будь ласка, увійдіть.') {
                toast.error(err.message);
            } else {
                toast.error(err.response?.data?.message || 'Не вдалося оновити бібліотеку.');
            }
        } finally {
            setIsTogglingLibrary(false);
        }
    };

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

    const getPosterUrl = (path, size = 'w500') => { 
        return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    };

    const displayTitle = contentDetails.title || contentDetails.name;
    const displayReleaseDate = contentDetails.release_date || contentDetails.first_air_date;
    const releaseYear = displayReleaseDate ? new Date(displayReleaseDate).getFullYear() : 'Невідомий';

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
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

                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-[#e50914] mb-6 text-center">Відгуки користувачів</h2>
                    {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map(review => (
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

            {showReviewModal && contentDetails && (
                <ReviewFormModal
                    item={contentDetails}
                    onClose={() => setShowReviewModal(false)}
                    onReviewSubmit={handleReviewSubmit}
                    existingReview={userReview}
                />
            )}
        </div>
    );
};

export default ContentDetailsPage;