// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\ContentDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchContentDetails } from '../api/content';
import { addContentToUserLibrary } from '../api/user';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify'; // Додано імпорт для сповіщень toast

const ContentDetailsPage = () => {
    const { mediaType, tmdbId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [contentDetails, setContentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToLibrary, setAddingToLibrary] = useState(false);
    const [libraryMessage, setLibraryMessage] = useState('');

    useEffect(() => {
        const getDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchContentDetails(mediaType, tmdbId);
                setContentDetails(data);
            } catch (err) {
                console.error(`Помилка отримання деталей для ${mediaType}/${tmdbId}:`, err);
                setError(err.message || 'Не вдалося завантажити деталі контенту.'); // Оновлено обробку помилки
            } finally {
                setLoading(false);
            }
        };

        getDetails();

    }, [mediaType, tmdbId]);

    const handleAddToLibrary = async () => {
        if (!isAuthenticated) {
            setLibraryMessage('Увійдіть, щоб додати контент до бібліотеки.');
            toast.info('Будь ласка, увійдіть, щоб додати контент до бібліотеки.');
            return;
        }

        if (!contentDetails) {
            setLibraryMessage('Деталі контенту не завантажено. Спробуйте ще раз.');
            toast.error('Деталі контенту не завантажено.');
            return;
        }

        setAddingToLibrary(true);
        setLibraryMessage('');

        const payloadToSend = {
            externalId: String(tmdbId),
            mediaType: mediaType,
            status: 'plan_to_watch',
            title: contentDetails.title || contentDetails.name,
            posterPath: contentDetails.poster_path,
            releaseDate: contentDetails.release_date || contentDetails.first_air_date,
            genres: contentDetails.genres?.map(g => g.name) || [],
            overview: contentDetails.overview,
            originalTitle: contentDetails.original_title || contentDetails.original_name,
            language: contentDetails.original_language,
            runtime: contentDetails.runtime || (contentDetails.episode_run_time ? contentDetails.episode_run_time[0] : null),
            totalEpisodes: contentDetails.number_of_episodes,
            totalSeasons: contentDetails.number_of_seasons,
        };

        console.log('Спроба додати контент до бібліотеки з даними:', payloadToSend);

        try {
            const response = await addContentToUserLibrary(payloadToSend);
            setLibraryMessage(response.message || 'Контент успішно додано до бібліотеки!');
            toast.success(response.message || 'Контент успішно додано до бібліотеки!');
        } catch (err) {
            console.error('Помилка у handleAddToLibrary:', err);
            const errorMessage = err.response?.data?.message || 'Не вдалося додати контент до бібліотеки.';
            setLibraryMessage(errorMessage);
            toast.error(errorMessage);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setAddingToLibrary(false);
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
                Контент не знайдено або він недійсний.
            </div>
        );
    }

    const posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const backdropBaseUrl = 'https://image.tmdb.org/t/p/w1280';

    return (
        <div className="bg-[#171717] min-h-screen text-white relative pb-16">
            <Header />

            {/* Backdrop Image */}
            {contentDetails.backdrop_path && (
                <div
                    className="absolute inset-0 top-0 left-0 w-full h-full bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${backdropBaseUrl}${contentDetails.backdrop_path})` }}
                ></div>
            )}

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 pt-24 md:pt-32">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Poster Image */}
                    {contentDetails.poster_path ? (
                        <img
                            src={`${posterBaseUrl}${contentDetails.poster_path}`}
                            alt={contentDetails.title || contentDetails.name}
                            className="w-full max-w-xs md:w-64 rounded-lg shadow-lg object-cover"
                        />
                    ) : (
                        <div className="w-full max-w-xs md:w-64 h-96 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 text-xl">
                            Постер недоступний
                        </div>
                    )}

                    {/* Content Details */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-2">{contentDetails.title || contentDetails.name}</h1>
                        <p className="text-gray-400 text-xl mb-4 capitalize">{mediaType === 'movie' ? 'Фільм' : 'Серіал'}</p>
                        
                        {/* Release Date / First Air Date */}
                        {(contentDetails.release_date || contentDetails.first_air_date) && (
                            <p className="text-gray-400 mb-2">
                                Дата виходу: {contentDetails.release_date || contentDetails.first_air_date}
                            </p>
                        )}

                        {/* Genres */}
                        {contentDetails.genres && contentDetails.genres.length > 0 && (
                            <p className="text-gray-400 mb-2">
                                Жанри: {contentDetails.genres.map(genre => genre.name).join(', ')}
                            </p>
                        )}

                        {/* Overview */}
                        <p className="text-gray-300 mb-8">{contentDetails.overview || 'Опис відсутній.'}</p>

                        {/* Action Buttons */}
                        <div className="mt-4 space-x-4 flex flex-wrap gap-2">
                            {/* Кнопка "Додати до бібліотеки" з логікою */}
                            {isAuthenticated && (
                                <>
                                    <button
                                        onClick={handleAddToLibrary}
                                        disabled={addingToLibrary}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addingToLibrary ? 'Додається...' : 'Додати до Бібліотеки'}
                                    </button>
                                    {libraryMessage && (
                                        <p className={`mt-2 text-sm ${error ? 'text-red-400' : 'text-green-400'}`}>
                                            {libraryMessage}
                                        </p>
                                    )}
                                </>
                            )}
                            {!isAuthenticated && (
                                <p className="mt-2 text-sm text-gray-400">Увійдіть, щоб додати контент до бібліотеки.</p>
                            )}
                            
                            <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
                                Оцінити
                            </button>
                            {/* TODO: Інші кнопки, наприклад "Дивитися трейлер" */}
                        </div>
                    </div>
                </div>

                {/* Cast Section */}
                {contentDetails.credits?.cast && contentDetails.credits.cast.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">Акторський Склад</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {contentDetails.credits.cast.slice(0, 10).map(person => (
                                <div key={person.id} className="text-center">
                                    {person.profile_path ? (
                                        <img 
                                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                                            alt={person.name} 
                                            className="w-24 h-24 object-cover rounded-full mx-auto mb-2 border-2 border-gray-700"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-gray-700 flex items-center justify-center text-gray-400 text-4xl">
                                            👤
                                        </div>
                                    )}
                                    <p className="text-sm font-medium">{person.name}</p>
                                    <p className="text-xs text-gray-400">{person.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Videos Section (Trailers, etc.) */}
                {contentDetails.videos?.results && contentDetails.videos.results.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">Відео (Трейлери)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contentDetails.videos.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube').slice(0, 2).map(video => (
                                <div key={video.id} className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${video.key}`} // Виправлений URL для YouTube embed
                                        title={video.name}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations Section */}
                {contentDetails.recommendations?.results && contentDetails.recommendations.results.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">Рекомендовано</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {contentDetails.recommendations.results.slice(0, 5).map(item => (
                                <Link 
                                    key={item.id} 
                                    to={`/content/${item.media_type || mediaType}/${item.id}`}
                                    className="block bg-[#1e1e1e] rounded-lg shadow-md overflow-hidden hover:opacity-85 transition-opacity"
                                >
                                    {item.poster_path ? (
                                        <img 
                                            src={`${posterBaseUrl}${item.poster_path}`} 
                                            alt={item.title || item.name} 
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-800 flex items-center justify-center text-gray-400 text-4xl">
                                            🎬
                                        </div>
                                    )}
                                    <div className="p-3">
                                        <h3 className="text-base font-semibold truncate">{item.title || item.name}</h3>
                                        <p className="text-xs text-gray-400 capitalize">{item.media_type === 'movie' ? 'Фільм' : 'Серіал'}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                {contentDetails.reviews?.results && contentDetails.reviews.results.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-semibold mb-4">Відгуки Користувачів TMDB ({contentDetails.reviews.results.length})</h2>
                        <div className="space-y-6">
                            {contentDetails.reviews.results.slice(0, 3).map(review => (
                                <div key={review.id} className="bg-[#222222] p-4 rounded-lg shadow">
                                    <p className="text-sm text-gray-300 mb-2">
                                        <span className="font-semibold text-white">{review.author}</span> 
                                        {review.author_details?.rating && (
                                            <span className="ml-2 px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded-full">
                                                ⭐ {review.author_details.rating}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-gray-400 text-sm italic line-clamp-4">{review.content}</p>
                                </div>
                            ))}
                            {contentDetails.reviews.results.length > 3 && (
                                <p className="text-center text-gray-500 text-sm">
                                    Та інші {contentDetails.reviews.results.length - 3} відгуки...
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentDetailsPage;