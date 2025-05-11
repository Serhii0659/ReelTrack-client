// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\ReviewCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Для навігації до деталей контенту

// Ви повинні передавати сюди повний об'єкт відгуку (review)
function ReviewCard({ review }) {
    if (!review) return null;

    const { title, rating, posterPath, mediaType, tmdbId } = review; // Деструктуризуємо review об'єкт

    const ratingColor =
        rating <= 1
            ? 'bg-[#8A2B2B]' // Червоний
            : rating <= 3
            ? 'bg-[#ff8c00]' // Помаранчевий (змінено для більшої контрастності)
            : rating <= 6
            ? 'bg-[#A4B630]' // Жовто-зелений
            : 'bg-[#489D35]'; // Зелений

    return (
        <Link to={`/${mediaType}/${tmdbId}`} className="relative w-[114px] h-[240px] bg-[#272727] rounded-[10px] flex-shrink-0 overflow-hidden shadow-lg">
            <div className="w-full h-[148px] bg-gray-700 flex items-center justify-center overflow-hidden">
                {posterPath ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w200${posterPath}`} // posterPath вже повний URL з бекенду
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                        Без постера
                    </div>
                )}
            </div>
            <div className="absolute top-[160px] w-full text-center text-sm text-white font-medium p-1">
                {title}
            </div>
            <div className={`absolute left-[42px] top-[200px] w-[30px] h-[30px] rounded-full flex items-center justify-center text-white font-bold text-xs ${ratingColor}`}>
                {rating || '-'}
            </div>
        </Link>
    );
}

// ReviewGroup, ймовірно, також буде використовувати ReviewCard
export function ReviewGroup({ reviews }) { // Приймаємо масив відгуків
    // const [activeGroupIndex] = useState(0); // Більше не потрібен, якщо reviews - це просто масив
    const currentGroup = reviews || []; // Переконаємось, що це масив

    return (
        <div className="flex gap-6 justify-center flex-wrap"> {/* Додано flex-wrap для кращого відображення */}
            {currentGroup.map((review) => (
                <ReviewCard
                    key={review._id} // Використовуємо _id відгуку як ключ
                    review={review} // Передаємо весь об'єкт відгуку
                />
            ))}
        </div>
    );
}

export default ReviewCard;