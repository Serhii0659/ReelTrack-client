import React from 'react';
import { useAuth } from '../context/AuthContext'; // Імпортуємо useAuth

function HomePage() {
const { logout, user } = useAuth(); // Отримуємо logout і дані користувача

const handleLogout = () => {
    logout(); // Викликаємо logout з контексту
};

return (
    <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-600">
                    ReelTrack - Home
                </h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
            {/* Вітаємо користувача */}
            {user && (
                <p className="text-lg mb-4">Welcome back, <span className="font-semibold">{user.name}</span>!</p>
            )}
            <p>You have successfully logged in.</p>
            {/* Тут буде основний контент вашого трекера */}
        </div>
    </div>
);
}

export default HomePage;