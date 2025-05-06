import React from 'react';

function NowWatching() {
    return (
        <div className="bg-[#171717] rounded-lg p-4 shadow-md w-full max-w-[600px] mr-8">
            <h2 className="text-white font-bold text-[20px] mb-4">Зараз дивляться</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {[...Array(5)].map((_, idx) => (
                    <div
                        key={idx}
                        className="w-24 h-40 bg-[#EFEFF0] rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0"
                    >
                    </div>
                ))}
            </div>
        </div>
    );
}

export default NowWatching;
