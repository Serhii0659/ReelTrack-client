import React from 'react';
import { FaStar } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ReviewItem = ({ review }) => {
    // Перевірка на наявність об'єкта review
    if (!review) {
        return null;
    }

    // Деструктуризація об'єкта review
    const { reviewer, rating, comment, createdAt } = review;

    // Форматування дати створення відгуку
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('uk-UA', options);
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-4 border border-gray-700">
            {/* Заголовок з ім'ям користувача та датою */}
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white">
                    {reviewer?.username || 'Анонімний користувач'}
                </h3>
                {createdAt && (
                    <span className="text-gray-400 text-sm">
                        {formatDate(createdAt)}
                    </span>
                )}
            </div>

            {/* Відображення рейтингу */}
            <div className="flex items-center mb-2">
                <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                        <FaStar 
                            key={i}
                            className={i < Math.floor(rating / 2) ? 'text-yellow-400' : 'text-gray-500'}
                        />
                    ))}
                </div>
                <span className="text-gray-300 font-semibold">
                    {rating}/10
                </span>
            </div>

            {/* Відображення коментаря */}
            {comment && (
                <p className="text-gray-300 mt-2 pt-2 border-t border-gray-700">
                    {comment}
                </p>
            )}
        </div>
    );
};

// Валідація пропсів
ReviewItem.propTypes = {
    review: PropTypes.shape({
        reviewer: PropTypes.shape({
            username: PropTypes.string,
        }),
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string,
        createdAt: PropTypes.string,
    }),
};

export default ReviewItem;