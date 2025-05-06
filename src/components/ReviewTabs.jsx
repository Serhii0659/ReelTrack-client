import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewGroup } from './ReviewCard.jsx';

const ReviewTabs = () => {
    const [activeTab, setActiveTab] = useState('Серіали');
    const navigate = useNavigate();

    const reviews = {
        Серіали: [
            { title: 'Пуститися берега', rating: 5 },
            { title: 'Дивні дива', rating: 4 },
            { title: 'Темні справи', rating: 3 }
        ],
        Мультфільми: [
            { title: 'Шрек', rating: 5 },
            { title: 'Кунг-фу Панда', rating: 4 },
            { title: 'Льодовиковий період', rating: 3 }
        ],
        Фільми: [
            { title: 'Початок', rating: 5 },
            { title: 'Інтерстеллар', rating: 5 },
            { title: 'Джокер', rating: 4 }
        ]
    };

    const handleSeeMoreClick = () => {
        navigate('/profile');
    };

    return (
        <div className="bg-[#272727] rounded-[20px] p-6 shadow-md w-full max-w-[600px] ml-10">
            <h2 className="text-white font-bold text-4xl text-center mb-6">
                Ваші відгуки
            </h2>

            <div className="flex gap-10 mb-4 justify-center">
                {Object.keys(reviews).map((tab) => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="relative px-4 py-2 rounded cursor-pointer text-white font-bold"
                    >
                        <span className="font-[IBM Plex Mono] text-xl">{tab}</span>
                        {activeTab === tab && (
                            <div className="absolute bottom-[-5px] left-0 w-full h-[2.5px] bg-white rounded-full" />
                        )}
                    </div>
                ))}
            </div>

            <ReviewGroup reviewGroups={[reviews[activeTab]]} />

            <div className="flex justify-center mt-5">
                <button
                    onClick={handleSeeMoreClick}
                    className="bg-[#626366] text-[#979797] font-bold px-10 py-2 rounded-full hover:bg-gray-500 transition"
                >
                    Переглянути ще
                </button>
            </div>
        </div>
    );
};

export default ReviewTabs;
