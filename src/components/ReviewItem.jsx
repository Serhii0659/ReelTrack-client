// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\ReviewItem.jsx
import React from 'react';

// Примітка: цей компонент тепер перероблено для відображення ВАШОЇ ОСОБИСТОЇ ОЦІНКИ та НОТАТОК
// для елемента зі списку перегляду (WatchlistItem).
// Тепер він очікує об'єкт WatchlistItem як пропс "watchlistItem".
const ReviewItem = ({ watchlistItem }) => {
    // Перевірка, чи об'єкт WatchlistItem був переданий
    if (!watchlistItem) {
        // У режимі розробки можна додати попередження для налагодження
        // console.warn("ReviewItem: watchlistItem prop is undefined or null.");
        return null; // Якщо пропс не передано, нічого не відображаємо
    }

    // Перевіряємо наявність оцінки та нотаток у watchlistItem
    // watchlistItem.userRating - це число від 0 до 10
    const hasUserRating = typeof watchlistItem.userRating === 'number' && watchlistItem.userRating >= 0 && watchlistItem.userRating <= 10;
    // watchlistItem.userNotes - це рядок
    const hasUserNotes = watchlistItem.userNotes && watchlistItem.userNotes.trim().length > 0;

    // Якщо немає ні оцінки, ні нотаток для цього елемента WatchlistItem,
    // можливо, немає сенсу відображати цей компонент.
    if (!hasUserRating && !hasUserNotes) {
        return null; 
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-4 border border-gray-700">
            {/* Заголовок, що вказує, що це ваша оцінка/нотатки для конкретного контенту */}
            <h3 className="font-bold text-lg text-white">
                Ваша оцінка та нотатки для "{watchlistItem.title || watchlistItem.originalTitle || 'Контенту'}"
            </h3>

            {hasUserRating && (
                <p className="text-gray-300 mt-1">
                    Ваша оцінка: <span className="text-yellow-400 font-semibold">{watchlistItem.userRating}/10</span>
                </p>
            )}

            {hasUserNotes && (
                <p className="text-gray-400 mt-2 border-t border-gray-700 pt-2 text-sm">
                    Ваші нотатки: <span className="text-gray-400">{watchlistItem.userNotes}</span>
                </p>
            )}
        </div>
    );
};
    
export default ReviewItem;