import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import Header from '../components/Header';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Контент сторінки (тепер зверху) */}
      <div className="flex-grow pt-24"> 
        <div className="flex justify-center items-center mb-10">
          <div className="bg-[#1e1e1e] rounded-3xl px-6 py-4 flex items-center justify-between w-[90%] max-w-4xl h-auto shadow-md relative">

            {/* Ліва частина — аватар + текст */}
            <div className="flex items-center">
              <FaUserCircle className="text-white text-6xl mr-4" />
              <div>
                <p className="text-xl font-bold">Ім’я користувача</p>
                <p className="text-sm text-gray-400">email@example.com</p>
              </div>
            </div>

            {/* Права частина — кнопка */}
            <button className="absolute top-5 right-8 bg-[#626366] text-white text-sm px-4 py-2 rounded-2xl hover:bg-gray-500 transition">
              Редагувати профіль
            </button>

          </div>
        </div>
      </div>

      {/* Header тепер внизу */}
      <Header />
    </div>
  );
};

export default ProfilePage;

