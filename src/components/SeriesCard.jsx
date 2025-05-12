// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\SeriesCard.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import RatingPieChart from './RatingPieChart'; // <--- ДОДАЙТЕ ЦЕЙ ІМПОРТ

// Компонент для відображення картки серіалу в бібліотеці користувача
const SeriesCard = ({ item, onRemove }) => {
    // item - об'єкт серіалу з бібліотеки користувача (структура WatchlistItem)
    // onRemove - функція, яка викликається при видаленні серіалу

    // Допоміжна функція для формування URL постера TMDB
    const getPosterUrl = (posterPath) => {
        // Використовуємо розмір постера w500 для кращої якості
        return posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : 'https://via.placeholder.com/200x300?text=No+Poster';
    };

    // Отримуємо рік з поля releaseDate (яке використовується для обох типів контенту в WatchlistItem)
    // Для серіалів, можливо, краще використовувати item.firstAirDate, якщо воно є, але item.releaseDate теж підійде, якщо так надходять дані
    const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Невідомий';

    // <--- ДОДАЙТЕ ЦЮ ЛОГІКУ ДЛЯ РЕЙТИНГУ (аналогічно MovieCard)
    const displayRating = (item.userRating !== undefined && item.userRating !== null && item.userRating > 0)
                          ? item.userRating
                          : (item.mediaRating !== undefined && item.mediaRating !== null && item.mediaRating > 0)
                            ? item.mediaRating
                            : null; // Якщо немає жодного дійсного рейтингу, встановлюємо в null

    // <--- ДОДАЙТЕ ЦІ КОНСОЛЬНІ ЛОГИ ДЛЯ ДЕБАГУ (аналогічно MovieCard)
    console.log('--- SeriesCard Debug ---');
    console.log('Item ID:', item._id);
    console.log('Item Title:', item.title);
    console.log('item.userRating:', item.userRating, typeof item.userRating);
    console.log('item.mediaRating:', item.mediaRating, typeof item.mediaRating);
    console.log('displayRating (sent to chart):', displayRating, typeof displayRating);
    console.log('--- End SeriesCard Debug ---');

    return (
        // Картка серіалу з фоном, тінями та округлими кутами
        <div className="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden flex flex-col items-center text-center p-4 relative">
            {/* Обгортаємо основний вміст картки у Link для переходу на сторінку деталей контенту */}
            {/* Маршрут до деталей контенту: /content/mediaType/tmdbId */}
            <Link
                to={`/content/${item.mediaType}/${item.externalId}`} // ВИПРАВЛЕНО: Коректний шлях Link
                className="flex flex-col items-center text-center w-full"
            >
                {/* Зображення постера */}
                <img
                    src={getPosterUrl(item.posterPath)} // ВИПРАВЛЕНО: Використовуємо posterPath з об'єкта item
                    alt={item.title || 'Назва серіалу'} // ВИПРАВЛЕНО: Використовуємо title
                    className="w-full h-auto object-cover rounded-md mb-4"
                />
                {/* Назва серіалу */}
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-white">{item.title}</h3> {/* ВИПРАВЛЕНО: Використовуємо title */}
                {/* Тип контенту та рік */}
                <p className="text-gray-400 text-sm mb-2">Серіал ({releaseYear})</p> {/* ВИПРАВЛЕНО: Використовуємо releaseYear */}
            </Link>

            {/* <--- ДОДАЙТЕ ЦЕЙ БЛОК З РЕНДЕРИНГОМ ДІАГРАМИ РЕЙТИНГУ (аналогічно MovieCard) */}
            {displayRating !== null && ( // Рендеримо тільки якщо є дійсний рейтинг
                <div
                    className="rating-display"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 10,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        padding: '5px'
                    }}
                >
                    <RatingPieChart rating={displayRating} size={50} showTooltip={false} /> {/* Зменшив size для SeriesCard */}
                </div>
            )}

            {/* Кнопка видалення */}
            {/* При кліку викликаємо onRemove, передаючи ID елемента бібліотеки та його назву */}
            <button
                onClick={() => onRemove(item._id, item.title)} // ВИПРАВЛЕНО: Передаємо _id елемента бібліотеки та title
                className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
                <FaTrash /> {/* Іконка кошика */}
                <span>Видалити</span>
            </button>
        </div>
    );
};

export default SeriesCard;


