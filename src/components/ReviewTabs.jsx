import React, { useState, useEffect } from 'react';
import { ReviewGroup } from './ReviewCard.jsx';
import { getUserReviews } from '../api/user.js';
import Spinner from './Spinner';
import { useAuth } from '../context/AuthContext';

const ReviewTabs = () => {
    const [userReviews, setUserReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [errorReviews, setErrorReviews] = useState(null);

    const { isAuthenticated, loading: authLoading } = useAuth();

    useEffect(() => {
        const fetchReviews = async () => {
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
                setUserReviews(reviews);
            } catch (error) {
                setErrorReviews(error);
                setUserReviews([]);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, [isAuthenticated, authLoading]);

    const tvReviews = userReviews.filter(review => review.mediaType === 'tv');
    const movieReviews = userReviews.filter(review => review.mediaType === 'movie');

    if (authLoading || loadingReviews) {
        return <Spinner />;
    }

    if (!isAuthenticated) {
        return <div className="text-center text-gray-400 text-lg mt-4">Будь ласка, увійдіть, щоб переглянути ваші відгуки.</div>;
    }

    if (errorReviews) {
        return (
            <div className="text-center text-red-500 text-lg mt-4">
                Помилка завантаження відгуків: {errorReviews.message || 'Невідома помилка'}
            </div>
        );
    }

    if (userReviews.length === 0) {
        return <div className="text-center text-gray-400 text-lg mt-4">У вас ще немає відгуків.</div>;
    }

    return (
        <div className="review-tabs-container mt-4">
            <h3 className="text-white font-bold text-[20px] mb-4">Оцінені Вами серіали</h3>
            {tvReviews.length > 0 ? (
                <ReviewGroup reviews={tvReviews} />
            ) : (
                <p className="text-center text-gray-400 text-lg mt-4 mb-8">У вас немає відгуків про серіали.</p>
            )}

            <div className="my-8 border-t border-gray-700"></div>

            <h3 className="text-white font-bold text-[20px] mb-4">Оцінені Вами фільми</h3>
            {movieReviews.length > 0 ? (
                <ReviewGroup reviews={movieReviews} />
            ) : (
                <p className="text-center text-gray-400 text-lg mt-4">У вас немає відгуків про фільми.</p>
            )}
        </div>
    );
};

export default ReviewTabs;
