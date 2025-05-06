import React from 'react';
import { FaUserFriends, FaThumbsUp, FaCheckCircle } from 'react-icons/fa';

function SocialFeed() {
    return (
        <div className="w-full max-w-[600px] h-[480px] bg-[#272727] p-6 rounded-[20px] text-white shadow-md mr-8 mt-[0.5px]">
            <h3 className="text-white font-bold text-4xl text-center mb-6">
                Соціальна стрічка
            </h3>

            <div className="mb-6">
                <div className="flex items-center gap-3 font-semibold text-2xl mb-2">
                    <div className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                        <FaUserFriends className="text-black" />
                    </div>
                    <span className="text-white font-bold text-[20px]">
                        Що дивляться Ваші друзі:
                    </span>
                </div>
                <ul className="list-disc list-inside ml-8 text-lg">
                    <li>Гра престолів (6 сезон, 5 серія)</li>
                    <li>Чорний список (1 сезон, 12 серія)</li>
                </ul>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-3 font-semibold text-2xl mb-2">
                    <div className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                        <FaThumbsUp className="text-black" />
                    </div>
                    <span className="text-white font-bold text-[20px]">
                        Рекомендують друзі:
                    </span>
                </div>
                <ul className="list-disc list-inside ml-8 text-lg">
                    <li>Останній танок</li>
                    <li>Мандалорець</li>
                </ul>
            </div>

            <div>
                <div className="flex items-center gap-3 font-semibold text-2xl mb-2">
                    <div className="w-9 h-9 bg-[#D9D9D9] rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-black" />
                    </div>
                    <span className="text-white font-bold text-[20px]">
                        Завершення дій:
                    </span>
                </div>
                <p className="text-lg ml-6">Дивись, що нещодавно закінчили твої друзі:</p>
                <ul className="list-disc list-inside ml-8 text-lg">
                    <li>Відьмак (2 сезон, 8 серій)</li>
                    <li>Шерлок (4 сезон, 3 серії)</li>
                </ul>
            </div>
        </div>
    );
}

export default SocialFeed;
