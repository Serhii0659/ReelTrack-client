import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ReviewFormModal = ({ item, onClose, onReviewSubmit, existingReview }) => {
    const [rating, setRating] = useState(existingReview ? existingReview.rating : 0);
    const [comment, setComment] = useState(existingReview ? existingReview.comment : '');
    const [hover, setHover] = useState(0);

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
        } else {
            setRating(0);
            setComment('');
        }
    }, [existingReview]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Будь ласка, поставте оцінку!');
            return;
        }
        onReviewSubmit({
            rating,
            comment,
            mediaType: item.media_type || item.mediaType,
            tmdbId: item.id || item.tmdbId,
            reviewId: existingReview ? existingReview._id : null
        });
    };

    // Функція для відображення зірочок (як в ReviewItem)
    const renderStars = (ratingValue) => {
        return (
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                    <FaStar 
                        key={i}
                        className={i < Math.floor(ratingValue / 2) ? 'text-yellow-400' : 'text-gray-500'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                        {existingReview ? 'Редагувати відгук' : 'Оцінити'} {item.title || item.name}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="rating" className="block text-gray-300 text-sm font-bold mb-2">
                            Ваша оцінка:
                        </label>
                        
                        {/* Прев'ю оцінки (як в ReviewItem) */}
                        <div className="flex items-center mb-3">
                            {renderStars(rating)}
                            <span className="text-gray-300 font-semibold ml-2">
                                {rating}/10
                            </span>
                        </div>
                        
                        <div className="flex justify-center space-x-1 text-yellow-400 text-3xl">
                            {[...Array(10)].map((star, index) => {
                                const currentRating = index + 1;
                                return (
                                    <label key={index}>
                                        <input
                                            type="radio"
                                            name="rating"
                                            value={currentRating}
                                            onClick={() => setRating(currentRating)}
                                            className="hidden"
                                        />
                                        <FaStar
                                            className="cursor-pointer transition-transform duration-200"
                                            size={30}
                                            onMouseEnter={() => setHover(currentRating)}
                                            onMouseLeave={() => setHover(0)}
                                            color={currentRating <= (hover || rating) ? "#FFD700" : "#e4e5e9"}
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-gray-300 text-sm font-bold mb-2">
                            Коментар (необов'язково):
                        </label>
                        <textarea
                            id="comment"
                            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                            rows="4"
                            placeholder="Що ви думаєте про цей контент?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            {existingReview ? 'Зберегти зміни' : 'Надіслати відгук'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        >
                            Скасувати
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ReviewFormModal.propTypes = {
    item: PropTypes.shape({
        media_type: PropTypes.string,
        mediaType: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        tmdbId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        title: PropTypes.string,
        name: PropTypes.string,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onReviewSubmit: PropTypes.func.isRequired,
    existingReview: PropTypes.shape({
        _id: PropTypes.string,
        rating: PropTypes.number,
        comment: PropTypes.string,
    }),
};

export default ReviewFormModal;