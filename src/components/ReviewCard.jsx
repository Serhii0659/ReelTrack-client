import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating }) => {
    const validRating = typeof rating === 'number' && rating >= 0 && rating <= 10 ? rating : 0;
    const displayRating = validRating > 0 ? validRating.toFixed(1) : '-';

    return (
        <div className="star-rating flex items-center mx-auto">
            <FaStar className="text-yellow-500 mr-1 text-sm" />
            <span className="text-white font-medium text-sm">{displayRating}</span>
            {validRating > 0 && <span className="text-gray-400 text-xs">/10</span>}
        </div>
    );
};

const ReviewCard = ({ review }) => {
    if (!review) return null;

    const {
        _id,
        tmdbId,
        title,
        posterPath,
        mediaType,
        rating,
        contentTitle,
        contentPosterPath,
    } = review;

    const displayTitle = contentTitle || title;
    const displayPosterPath = contentPosterPath || posterPath;
    const displayRating = typeof rating === 'string' ? parseFloat(rating) : rating;

    const imageUrl = displayPosterPath
        ? displayPosterPath.startsWith('http')
            ? displayPosterPath
            : `https://image.tmdb.org/t/p/w300${displayPosterPath}`
        : 'https://via.placeholder.com/200x300?text=Без+постера';

    const contentDetailsPath = `/content/${mediaType}/${tmdbId}`;

    return (
        <Link to={contentDetailsPath} className="relative w-[150px] h-[280px] bg-[#272727] rounded-[10px] flex-shrink-0 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col">
            <div className="w-full h-[200px] bg-gray-700 flex items-center justify-center overflow-hidden">
                <img
                    src={imageUrl}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-grow p-2 flex flex-col justify-between">
                <p className="text-white text-sm text-center line-clamp-2 font-medium">{displayTitle}</p>
                <div className="mt-auto">
                    <StarRating rating={displayRating} />
                </div>
            </div>
        </Link>
    );
};

export function ReviewGroup({ reviews }) {
    const currentGroup = reviews || [];

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {currentGroup.length > 0 ? (
                currentGroup.map((review) => (
                    <ReviewCard
                        key={review._id}
                        review={review}
                    />
                ))
            ) : (
                <p className="text-center text-gray-400 text-lg w-full">Немає відгуків для відображення.</p>
            )}
        </div>
    );
}

export default ReviewCard;