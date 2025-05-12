// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\MovieCard.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import RatingPieChart from './RatingPieChart'; // <--- ДОДАЙТЕ ЦЕЙ ІМПОРТ

const MovieCard = ({ item, onRemove }) => {
    const getPosterUrl = (posterPath) => {
        return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : 'https://via.placeholder.com/200x300?text=No+Poster';
    };

    const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Невідомий';

    // <--- ДОДАЙТЕ ЦЮ ЛОГІКУ ДЛЯ РЕЙТИНГУ
    // Використовуємо userRating, якщо він є, інакше mediaRating
    // Перевіряємо на undefined та null, щоб уникнути відображення 0, якщо рейтинг ще не встановлено
    const displayRating = (item.userRating !== undefined && item.userRating !== null && item.userRating > 0)
                          ? item.userRating
                          : (item.mediaRating !== undefined && item.mediaRating !== null && item.mediaRating > 0)
                            ? item.mediaRating
                            : null; // Якщо немає жодного дійсного рейтингу, встановлюємо в null

    // <--- ДОДАЙТЕ ЦІ КОНСОЛЬНІ ЛОГИ ДЛЯ ДЕБАГУ
    console.log('--- MovieCard Debug ---');
    console.log('Item ID:', item._id);
    console.log('Item Title:', item.title);
    console.log('item.userRating:', item.userRating, typeof item.userRating);
    console.log('item.mediaRating:', item.mediaRating, typeof item.mediaRating);
    console.log('displayRating (sent to chart):', displayRating, typeof displayRating);
    console.log('--- End MovieCard Debug ---');

    return (
        <div className="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden flex flex-col items-center text-center p-4 relative">
            {/* Обгортаємо основний вміст картки у Link для переходу на сторінку деталей */}
            <Link
                to={`/content/${item.mediaType}/${item.externalId}`}
                className="flex flex-col items-center text-center w-full"
            >
                <img
                    src={getPosterUrl(item.posterPath)}
                    alt={item.title || 'Назва фільму'}
                    className="w-full h-auto object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-2">Фільм ({releaseYear})</p>
            </Link>

            {/* <--- ДОДАЙТЕ ЦЕЙ БЛОК З РЕНДЕРИНГОМ ДІАГРАМИ РЕЙТИНГУ */}
            {displayRating !== null && ( // Рендеримо тільки якщо є дійсний рейтинг
                <div
                    className="rating-display"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 10, // Переконаємося, що діаграма знаходиться поверх інших елементів
                        backgroundColor: 'rgba(0,0,0,0.7)', // Додамо фон для кращої видимості
                        borderRadius: '50%', // Зробимо фон круглим
                        padding: '5px' // Додамо трохи відступу
                    }}
                >
                    <RatingPieChart rating={displayRating} size={50} showTooltip={false} /> {/* Зменшив size для MovieCard */}
                </div>
            )}

            <button
                onClick={() => onRemove(item._id, item.title)}
                className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
                <FaTrash />
                <span>Видалити</span>
            </button>
        </div>
    );
};

export default MovieCard;

