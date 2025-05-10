// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\SeriesCard.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SeriesCard = ({ item, onRemove }) => {
    const getPosterUrl = (posterPath) => {
        // Змінено розмір постера з w200 на w300 для кращої якості
        return posterPath ? `https://image.tmdb.org/t/p/w300${posterPath}` : 'https://via.placeholder.com/200x300?text=No+Poster';
    };

    const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Невідомий';

    return (
        <div className="bg-[#1E1E1E] rounded-lg shadow-lg overflow-hidden flex flex-col items-center text-center p-4 relative">
            {/* Обгортаємо основний вміст картки у Link для переходу на сторінку деталей */}
            <Link 
                to={`/content/${item.mediaType}/${item.externalId}`} 
                className="flex flex-col items-center text-center w-full"
            >
                <img
                    src={getPosterUrl(item.posterPath)}
                    alt={item.name || item.title || 'Назва серіалу'}
                    // Змінено: видалено фіксовану висоту h-64.
                    // Додано h-auto, щоб висота автоматично підлаштовувалася під пропорції зображення.
                    className="w-full h-auto object-cover rounded-md mb-4" // <--- ЗМІНЕНО ТУТ
                />
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">{item.name || item.title}</h3>
                <p className="text-gray-400 text-sm mb-2">Серіал ({releaseYear})</p>
            </Link>

            <button
                onClick={() => onRemove(item._id, item.name || item.title)}
                className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
                <FaTrash />
                <span>Видалити</span>
            </button>
        </div>
    );
};

export default SeriesCard;