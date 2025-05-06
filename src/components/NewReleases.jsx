import React from 'react';

function NewReleases() {
  return (
    <div className="bg-[#171717] rounded-[8px] p-4 shadow-md w-full max-w-[600px] ml-8">
      <h2 className="text-white font-bold text-[20px] mb-4">Новинки</h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="w-[100px] h-[175px] bg-[#EFEFF0] rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0"
          >
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewReleases;
