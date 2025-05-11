import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // Можна використовувати 'date-fns' для форматування дати
import { uk } from 'date-fns/locale'; // Локаль для української мови
import { Link } from 'react-router-dom'; // Для навігації до деталей контенту


// Приклад компонента для відображення зірок (можна замінити на іконки)
const StarRating = ({ rating }) => {
    // Перевіряємо, чи рейтинг є числом і знаходиться в межах 0-10
    const validRating = typeof rating === 'number' && rating >= 0 && rating <= 10 ? rating : 0;
    const displayRating = validRating > 0 ? validRating.toFixed(1) : '-'; // Показуємо '-' якщо рейтинг 0 або недійсний

    // Якщо ви хочете відображати зірки, а не число:
    // const fullStars = Math.floor(validRating / 2); // Якщо рейтинг з 10, ділимо на 2 для 5 зірок
    // const hasHalfStar = validRating % 2 !== 0 && validRating % 1 !== 0; // Перевірка на половину зірки
    // const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="star-rating">
             {/* Наразі просто відображаємо числову оцінку */}
            {displayRating}
             {validRating > 0 && '/10'} {/* Додаємо '/10' якщо є дійсна оцінка */}

            {/* Якщо ви хочете відображати зірки, розкоментуйте цей блок і закоментуйте верхній: */}
            {/*
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} style={{ color: 'gold' }}>★</span>
            ))}
            {hasHalfStar && <span style={{ color: 'gold' }}>½</span>}
            {[...Array(emptyStars)].map((_, i) => (
                <span key={`empty-${i}`} style={{ color: 'lightgray' }}>★</span>
            ))}
            */}
        </div>
    );
};


// Компонент ReviewCard для відображення одного відгуку/елемента бібліотеки
const ReviewCard = ({ review }) => {
    if (!review) return null;

    // Припускаємо, що review об'єкт містить:
    // _id, tmdbId, title, posterPath, mediaType, rating (це userRating з WatchlistItem), comment (це userNotes з WatchlistItem), createdAt, updatedAt
    // posterPath вже має бути повним URL з бекенду (або суфіксом, який ми доповнюємо)

    const { title, rating, posterPath, mediaType, tmdbId, comment, updatedAt } = review;

    // Визначаємо колір оцінки (якщо рейтинг є)
    const ratingColor = typeof rating === 'number' && rating > 0
        ? rating <= 4
            ? 'bg-red-600'  // Низька оцінка (до 4)
            : rating <= 7
            ? 'bg-yellow-600' // Середня оцінка (до 7)
            : 'bg-green-600'  // Висока оцінка (вище 7)
        : 'bg-gray-600';  // Без оцінки

    // Форматуємо дату останнього оновлення
    const formattedDate = updatedAt
        ? formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: uk })
        : ''; // Або інший текст, якщо дати немає

    // Базовий URL для постерів TMDB, якщо posterPath є лише суфіксом
    const imageUrl = posterPath
        ? posterPath.startsWith('http') // Перевіряємо, чи це вже повний URL
            ? posterPath
            : `https://image.tmdb.org/t/p/w200${posterPath}` // Додаємо базовий URL, якщо це суфікс
        : 'https://via.placeholder.com/114x175?text=Без+постера'; // Заглушка, якщо немає постера

    return (
        // Використовуємо Link для переходу на сторінку деталей контенту
        <Link to={`/${mediaType}/${tmdbId}`} className="relative w-[114px] h-[240px] bg-[#272727] rounded-[10px] flex-shrink-0 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out">
            {/* Блок постера */}
            <div className="w-full h-[175px] bg-gray-700 flex items-center justify-center overflow-hidden">
                 <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Блок з назвою та оцінкою */}
            <div className="absolute bottom-0 left-0 right-0 h-[65px] p-1 flex flex-col justify-between">
                 {/* Назва */}
                <p className="text-white text-xs mt-1 text-center truncate font-medium px-1">{title}</p>

                {/* Оцінка (кружок) */}
                {typeof rating === 'number' && rating > 0 && (
                     <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[30px] h-[30px] rounded-full flex items-center justify-center text-white font-bold text-xs ${ratingColor}`}>
                        {rating.toFixed(1)}
                    </div>
                )}
            </div>

            {/* Можна додати відображення коментаря або дати, якщо потрібно на картці */}
            {/*
            {comment && (
                 <p className="text-gray-400 text-xs mt-1 truncate">{comment}</p>
            )}
            {updatedAt && (
                 <span className="text-gray-500 text-xs">{formattedDate}</span>
            )}
            */}
        </Link>
    );
};

// --- ВИПРАВЛЕНО: ЕКСПОРТУЄМО ReviewGroup ---
// Цей компонент відповідає за відображення списку ReviewCard
export function ReviewGroup({ reviews }) { // Приймаємо масив відгуків
    const currentGroup = reviews || []; // Переконаємось, що це масив

    return (
        <div className="flex gap-6 justify-center flex-wrap"> {/* Додано flex-wrap для кращого відображення */}
            {currentGroup.length > 0 ? (
                currentGroup.map((review) => (
                    <ReviewCard
                        key={review._id} // Використовуємо _id відгуку як ключ
                        review={review} // Передаємо весь об'єкт відгуку
                    />
                ))
            ) : (
                <p className="text-center text-gray-400 text-lg">Немає відгуків для відображення.</p>
            )}
        </div>
    );
}

// Експортуємо ReviewCard як default
export default ReviewCard;
