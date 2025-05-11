// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\SeriesCard.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Компонент для відображення картки серіалу в бібліотеці користувача
const SeriesCard = ({ item, onRemove }) => {
    // item - об'єкт серіалу з бібліотеки користувача
    // onRemove - функція, яка викликається при видаленні серіалу

    // Допоміжна функція для формування URL постера TMDB
    const getPosterUrl = (posterPath) => {
        // Використовуємо розмір постера w300
        return posterPath ? `https://image.tmdb.org/t/p/w300${posterPath}` : 'https://via.placeholder.com/200x300?text=No+Poster';
    };

    // Отримуємо рік першого показу серіалу
    const firstAirYear = item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'Невідомий';

    return (
        // Картка серіалу з фоном, тінями та округлими кутами
        <div className="bg-[#1e1e1e] rounded-lg shadow-lg overflow-hidden flex flex-col items-center text-center p-4 relative">
            {/* Обгортаємо основний вміст картки у Link для переходу на сторінку деталей контенту */}
            {/* Маршрут до деталей контенту: /mediaType/tmdbId */}
            <Link
                to={`/${item.mediaType}/${item.externalId}`} // Використовуємо externalId як tmdbId
                className="flex flex-col items-center text-center w-full"
            >
                {/* Зображення постера */}
                <img
                    src={getPosterUrl(item.poster_path)} // Використовуємо poster_path з об'єкта item
                    alt={item.title || item.name || 'Назва серіалу'} // Використовуємо name для серіалів, якщо title відсутній
                    // Змінено: h-auto для збереження пропорцій, object-cover для обрізки
                    className="w-full h-auto object-cover rounded-md mb-4"
                />
                {/* Назва серіалу */}
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-white">{item.title || item.name}</h3> {/* Використовуємо name для серіалів */}
                {/* Тип контенту та рік */}
                <p className="text-gray-400 text-sm mb-2">Серіал ({firstAirYear})</p>
            </Link>

            {/* Кнопка видалення */}
            {/* При кліку викликаємо onRemove, передаючи ID елемента бібліотеки та його назву */}
            <button
                onClick={() => onRemove(item._id, item.title || item.name)} // Передаємо _id елемента бібліотеки та назву
                className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
                <FaTrash /> {/* Іконка кошика */}
                <span>Видалити</span>
            </button>
        </div>
    );
};

export default SeriesCard;
