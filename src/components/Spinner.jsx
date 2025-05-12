import React from 'react';

const Spinner = () => (
    <div className="flex justify-center items-center min-h-[100px] w-full">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
);

export default Spinner;