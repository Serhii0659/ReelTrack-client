// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\ReviewCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // Можна використовувати 'date-fns' для форматування дати
import { uk } from 'date-fns/locale'; // Локаль для української мови
import { Link } from 'react-router-dom'; // Для навігації до деталей контенту
import { FaStar } from 'react-icons/fa'; // Припускаємо, що ви використовуєте іконки зірок


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
        <div className="star-rating flex items-center"> {/* Додано flex для вирівнювання */}
             {/* Наразі просто відображаємо числову оцінку */}
             <FaStar className="text-yellow-500 mr-1 text-sm" /> {/* Приклад іконки зірки */}
             <span className="text-white font-medium text-sm">{displayRating}</span>
             {validRating > 0 && <span className="text-gray-400 text-xs">/10</span>} {/* Додаємо '/10' якщо є дійсна оцінка */}

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
    // posterPath може бути повним URL з бекенду (poster_full_url) або суфіксом posterPath

    const { _id, tmdbId, title, posterPath, mediaType, userRating, userNotes, updatedAt, contentTitle, contentPosterPath } = review;

    // Використовуємо contentTitle та contentPosterPath з Review моделі, якщо доступні,
    // інакше повертаємося до title та posterPath з WatchlistItem
    const displayTitle = contentTitle || title;
    const displayPosterPath = contentPosterPath || posterPath;
    const displayRating = userRating; // Використовуємо userRating з WatchlistItem/Review
    const displayComment = userNotes; // Використовуємо userNotes з WatchlistItem/Review


    // Визначаємо колір оцінки (якщо рейтинг є)
    const ratingColor = typeof displayRating === 'number' && displayRating > 0
        ? displayRating <= 4
            ? 'bg-red-600'  // Низька оцінка (до 4)
            : displayRating <= 7
                ? 'bg-yellow-600' // Середня оцінка (до 7)
                : 'bg-green-600'  // Висока оцінка (вище 7)
        : 'bg-gray-600';  // Без оцінки

    // Базовий URL для постерів TMDB, якщо posterPath є лише суфіксом
    const imageUrl = displayPosterPath
        ? displayPosterPath.startsWith('http') // Перевіряємо, чи це вже повний URL
            ? displayPosterPath
            : `https://image.tmdb.org/t/p/w300${displayPosterPath}` // Додаємо базовий URL, якщо це суфікс (w300)
        : 'https://via.placeholder.com/200x300?text=Без+постера'; // Заглушка, якщо немає постера

    // Визначаємо шлях для Link. Використовуємо tmdbId та mediaType
    // Припускаємо маршрут /content/:mediaType/:tmdbId
    const contentDetailsPath = `/content/${mediaType}/${tmdbId}`;


    return (
        // Використовуємо Link для переходу на сторінку деталей контенту
        // Додано flex-shrink-0 для каруселі та фіксовану ширину
        <Link to={contentDetailsPath} className="relative w-[150px] h-[280px] bg-[#272727] rounded-[10px] flex-shrink-0 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col"> {/* Додано flex-col */}
            {/* Блок постера */}
            <div className="w-full h-[200px] bg-gray-700 flex items-center justify-center overflow-hidden"> {/* Збільшено висоту постера */}
                 <img
                     src={imageUrl}
                     alt={displayTitle}
                     className="w-full h-full object-cover"
                 />
            </div>

            {/* Блок з назвою та оцінкою/інформацією */}
            <div className="flex-grow p-2 flex flex-col justify-between"> {/* flex-grow для заповнення простору */}
                 {/* Назва */}
                 <p className="text-white text-sm text-center line-clamp-2 font-medium">{displayTitle}</p> {/* Збільшено розмір тексту */}

                 {/* Оцінка або інша інформація */}
                 {typeof displayRating === 'number' && displayRating > 0 ? (
                      // Оцінка (кружок)
                      <div className={`mt-auto mx-auto w-[35px] h-[35px] rounded-full flex items-center justify-center text-white font-bold text-sm ${ratingColor}`}> {/* Збільшено розмір кружка */}
                          {displayRating.toFixed(1)}
                      </div>
                 ) : (
                     // Можна додати іншу інформацію, якщо оцінки немає, наприклад, тип контенту
                     <p className="text-gray-400 text-xs text-center mt-auto">{mediaType === 'movie' ? 'Фільм' : 'Серіал'}</p>
                 )}

                 {/* Можна додати відображення коментаря або дати, якщо потрібно на картці */}
                 {/*
                 {displayComment && (
                      <p className="text-gray-400 text-xs mt-1 truncate">{displayComment}</p>
                 )}
                 {updatedAt && (
                      <span className="text-gray-500 text-xs mt-1">{formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: uk })}</span>
                 )}
                 */}
            </div>
        </Link>
    );
};

// Компонент для групування та відображення списку відгуків (наприклад, у каруселі або списку)
export function ReviewGroup({ reviews }) { // Приймаємо масив відгуків
    const currentGroup = reviews || []; // Переконаємось, що це масив

    return (
        // Приклад використання: горизонтальна карусель для відгуків
        // Змінено на flex-wrap для відображення у кілька рядків, якщо не в каруселі
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"> {/* Змінено gap та прибрано flex-wrap для каруселі */}
            {currentGroup.length > 0 ? (
                currentGroup.map((review) => (
                    <ReviewCard
                        key={review._id} // Використовуємо _id відгуку як ключ
                        review={review} // Передаємо весь об'єкт відгуку
                    />
                ))
            ) : (
                <p className="text-center text-gray-400 text-lg w-full">Немає відгуків для відображення.</p> // Додано w-full для центрування
            )}
        </div>
    );
}

// Експортуємо ReviewCard як default
export default ReviewCard;

