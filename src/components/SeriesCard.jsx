import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const SeriesCard = ({ item, onRemove, onUpdate }) => {
    const getPosterUrl = (posterPath) =>
        posterPath
            ? `https://image.tmdb.org/t/p/w300${posterPath}`
            : 'https://via.placeholder.com/200x300?text=Без+постера';

    const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'Невідомий';

    const displayRating =
        item.userRating !== undefined && item.userRating !== null && item.userRating > 0
            ? item.userRating
            : item.mediaRating !== undefined && item.mediaRating !== null && item.mediaRating > 0
            ? item.mediaRating
            : null;

    const handleChangeStatus = (newStatus) => {
        if (item.status !== newStatus) {
            onUpdate(item._id, { status: newStatus });
        }
    };

    const statusButtons = [
        { key: 'watching', text: 'Переглядаю', color: 'bg-blue-600' },
        { key: 'completed', text: 'Завершено', color: 'bg-green-600' },
        { key: 'plan_to_watch', text: 'Запланую', color: 'bg-purple-600' },
        { key: 'on_hold', text: 'На паузі', color: 'bg-yellow-600' },
        { key: 'dropped', text: 'Закинуто', color: 'bg-red-600' },
    ];

    return (
        <div className="w-64 bg-[#171717] rounded-lg shadow-lg overflow-hidden flex flex-col items-center text-center p-4 relative">
            <Link
                to={`/content/${item.mediaType}/${item.externalId}`}
                className="flex flex-col items-center text-center w-full"
            >
                <img
                    src={getPosterUrl(item.posterPath)}
                    alt={item.title || 'Назва серіалу'}
                    className="w-full h-auto object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-2">Серіал ({releaseYear})</p>
            </Link>

            {displayRating !== null && (
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
                    <RatingPieChart rating={displayRating} size={50} showTooltip={false} />
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-4 mb-4">
                {statusButtons.map((btn) => (
                    <button
                        key={btn.key}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleChangeStatus(btn.key);
                        }}
                        className={`${btn.color} text-white text-xs py-1 px-2 rounded-md transition-colors 
                                    ${item.status === btn.key ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                        disabled={item.status === btn.key}
                    >
                        {btn.text}
                    </button>
                ))}
            </div>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(item._id, item.title);
                }}
                className="mt-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
                <FaTrash />
                <span>Видалити</span>
            </button>
        </div>
    );
};

export default SeriesCard;


