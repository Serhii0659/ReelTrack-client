import React, { useState } from 'react';

function ReviewCard({ title, rating }) {
    const ratingColor =
        rating <= 1
            ? 'bg-[#8A2B2B]'
            : rating <= 3
            ? 'bg-[#489D35]'
            : 'bg-[#A4B630]';

    return (
        <div className="relative w-[114px] h-[240px] bg-[#D9D9D9] rounded-[10px] flex-shrink-0">
            <div className="absolute bg-[#EFEFF0] border-[#AFB1B6] border rounded-[8px] w-[105px] h-[148px] left-[4px] top-[6px]" />
            <div className="absolute top-[160px] w-full text-center text-sm text-gray-700 font-medium">
                {title}
            </div>
            <div className={`absolute left-[42px] top-[200px] w-[30px] h-[30px] rounded-full flex items-center justify-center text-white font-bold text-xs ${ratingColor}`}>
                {rating}
            </div>
        </div>
    );
}

export function ReviewGroup({ reviewGroups }) {
    const [activeGroupIndex] = useState(0);
    const currentGroup = reviewGroups[activeGroupIndex] || [];

    return (
        <div className="flex gap-6 justify-center">
            {currentGroup.map((review, index) => (
                <ReviewCard
                    key={index}
                    title={review.title}
                    rating={review.rating}
                />
            ))}
        </div>
    );
}

export default ReviewCard;
