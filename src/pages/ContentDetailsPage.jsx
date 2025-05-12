import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchContentDetails } from '../api/content';
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
import CastSection from '../components/CastSection';
import TrailersSection from '../components/TrailersSection';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { Star, List, Trash, Edit, CalendarDays, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const ContentDetailsPage = () => {
    const { mediaType, tmdbId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);

    const [contentDetails, setContentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userReview, setUserReview] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [userWatchlistStatus, setUserWatchlistStatus] = useState(null);
    const [cast, setCast] = useState([]);
    const [trailers, setTrailers] = useState([]);

    useEffect(() => {
        const loadContentDetails = async () => {
            if (!mediaType || !tmdbId) {
                setError('Неповна інформація про контент. Будь ласка, переконайтеся, що URL коректний.');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const details = await fetchContentDetails(mediaType, tmdbId);
                setContentDetails(details);
                setCast(details.credits?.cast || []);
                const youtubeTrailers = details.videos?.results.filter(
                    video => video.type === 'Trailer' && video.site === 'YouTube'
                ) || [];
                setTrailers(youtubeTrailers);
            } catch {
                setError('Не вдалося завантажити деталі контенту. Спробуйте пізніше.');
            } finally {
                setLoading(false);
            }
        };
        loadContentDetails();
    }, [mediaType, tmdbId]);

    useEffect(() => {
        const loadUserReview = async () => {
            if (isAuthenticated && user && contentDetails && mediaType && tmdbId) {
                try {
                    const review = await getUserReviewForContent(mediaType, tmdbId);
                    setUserReview(review);
                } catch {
                    // ignore
                }
            }
        };
        loadUserReview();
    }, [isAuthenticated, user, contentDetails, mediaType, tmdbId]);

    useEffect(() => {
        const loadUserWatchlistStatus = async () => {
            if (isAuthenticated && user && contentDetails && mediaType && tmdbId) {
                try {
                    const itemInLibrary = await getUserWatchlistStatus(mediaType, tmdbId);
                    setUserWatchlistStatus(itemInLibrary ? itemInLibrary.status : null);
                } catch {
                    // ignore
                }
            }
        };
        loadUserWatchlistStatus();
    }, [isAuthenticated, user, contentDetails, mediaType, tmdbId]);

    const handleReviewSubmit = async (reviewData) => {
        if (!user || !isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            const response = await submitContentReview({
                ...reviewData,
                mediaType,
                tmdbId,
                contentTitle: contentDetails?.title || contentDetails?.name,
                contentPosterPath: contentDetails?.poster_path
            });
            setUserReview(response.review);
            toast.success('Відгук успішно додано!');
            setIsReviewModalOpen(false);
        } catch (err) {
            if (err?.response?.data?.message?.toLowerCase().includes('already exists')) {
                toast.error('Ви вже маєте відгук для цього контенту. Оновіть сторінку.');
            } else {
                toast.error('Не вдалося надіслати відгук');
            }
        }
    };

    const handleReviewDelete = async (reviewId) => {
        if (!user || !isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            await deleteUserReview(reviewId);
            setUserReview(null);
            toast.info('Відгук успішно видалено!');
        } catch {
            toast.error('Не вдалося видалити відгук');
            setError('Не вдалося видалити відгук. Спробуйте пізніше.');
        }
    };

    const handleToggleWatchlist = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            const contentData = {
                externalId: contentDetails.id,
                mediaType,
            };
            const response = await toggleContentInUserLibrary(contentData);

            if (response.added) {
                setUserWatchlistStatus('plan_to_watch');
                toast.success('Контент додано до бібліотеки!');
            } else {
                setUserWatchlistStatus(null);
                toast.info('Контент видалено з бібліотеки');
            }
        } catch {
            toast.error('Не вдалося оновити бібліотеку');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4 text-red-500">
                Помилка: {error}
            </div>
        );
    }

    if (!contentDetails) {
        return (
            <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4 text-gray-400">
                Контент не знайдено.
            </div>
        );
    }

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
                                    <button
                                        onClick={handleToggleWatchlist}
                                        className={`flex items-center ${userWatchlistStatus ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out`}
                                    >
                                        <List className="w-5 h-5 mr-2" />
                                        {userWatchlistStatus ? 'Видалити з бібліотеки' : 'Додати до бібліотеки'}
                                    </button>
                                    {!userReview && (
                                        <button
                                            onClick={() => setIsReviewModalOpen(true)}
                                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                                        >
                                            <Edit className="w-5 h-5 mr-2" />
                                            Написати відгук
                                        </button>
                                    )}
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

                <div className="p-8 border-t border-gray-900 mt-8">
                    <CastSection cast={cast} />
                </div>

                <div className="p-8 border-t border-gray-900 mt-8">
                    <TrailersSection trailers={trailers} />
                </div>

                {isReviewModalOpen && contentDetails && (
                    <ReviewFormModal
                        isOpen={isReviewModalOpen}
                        onClose={() => setIsReviewModalOpen(false)}
                        onSubmit={handleReviewSubmit}
                        initialReview={null}
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