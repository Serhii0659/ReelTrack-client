// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\FriendsPage.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import {
    fetchFriends,
    fetchFriendRequests,
    acceptFriendRequest,
    rejectOrRemoveFriend,
    sendFriendRequest // Додано імпорт функції для надсилання запиту на дружбу
} from '../api/user';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const FriendsPage = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('friends'); // 'friends' або 'requests'

    // Нові стани для модального вікна "Додати Друга"
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [friendIdInput, setFriendIdInput] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            toast.info('Будь ласка, увійдіть, щоб переглянути друзів.');
            return;
        }

        const loadFriendsAndRequests = async () => {
            setLoading(true);
            setError(null);
            try {
                const [friendsData, requestsData] = await Promise.all([
                    fetchFriends(),
                    fetchFriendRequests()
                ]);
                setFriends(Array.isArray(friendsData) ? friendsData : []);
                setFriendRequests(Array.isArray(requestsData) ? requestsData : []);
            } catch (err) {
                console.error('Помилка завантаження друзів/запитів:', err);
                setError(err.message || 'Не вдалося завантажити дані про друзів.');
                toast.error('Не вдалося завантажити дані про друзів.');
                if (err.response?.status === 401) {
                    toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        loadFriendsAndRequests();
    }, [isAuthenticated, navigate, logout]);

    const handleAcceptRequest = async (requestId) => {
        try {
            await acceptFriendRequest(requestId);
            toast.success('Запит на дружбу прийнято!');
            setFriendRequests(prev => prev.filter(req => req._id !== requestId));
            // Після прийняття запиту, перезавантажуємо список друзів, щоб оновити UI
            const friendsData = await fetchFriends();
            setFriends(Array.isArray(friendsData) ? friendsData : []);

        } catch (err) {
            console.error('Помилка прийняття запиту:', err);
            const msg = err.response?.data?.message || 'Не вдалося прийняти запит.';
            toast.error(msg);
            setError(msg);
        }
    };

    const handleRejectOrRemove = async (id, isRequest) => {
        try {
            await rejectOrRemoveFriend(id, isRequest);
            if (isRequest) {
                toast.info('Запит на дружбу відхилено.');
                setFriendRequests(prev => prev.filter(req => req._id !== id));
            } else {
                toast.info('Друга видалено.');
                setFriends(prev => prev.filter(friend => friend._id !== id));
            }
        } catch (err) {
            console.error(`Помилка при ${isRequest ? 'відхиленні запиту' : 'видаленні друга'}:`, err);
            const msg = err.response?.data?.message || `Не вдалося ${isRequest ? 'відхилити запит' : 'видалити друга'}.`;
            toast.error(msg);
            setError(msg);
        }
    };

    // Нова функція для надсилання запиту на дружбу за ID
    const handleSendFriendRequest = async () => {
    if (!friendIdInput) {
        toast.error('Будь ласка, введіть ID користувача.');
        return;
    }
    console.log('Attempting to send friend request with ID:', friendIdInput); // Додай цей рядок
    try {
        await sendFriendRequest(friendIdInput);
        toast.success('Запит на дружбу надіслано!');
        setShowAddFriendModal(false);
        setFriendIdInput('');
    } catch (err) {
        console.error('Помилка надсилання запиту на дружбу:', err);
        const msg = err.response?.data?.message || 'Не вдалося надіслати запит на дружбу.';
        toast.error(msg);
    }
};
    if (!isAuthenticated) {
        return null; 
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">
                Завантаження друзів та запитів...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500">
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-[#e50914]">Друзі</h1>

                {/* Кнопка для відкриття модального вікна "Додати друга" */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setShowAddFriendModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg text-lg font-semibold flex items-center space-x-2 transition-colors"
                    >
                        <FaUserPlus />
                        <span>Додати Друга за ID</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setTab('friends')}
                        className={`py-2 px-6 text-lg font-semibold rounded-l-lg transition-colors ${tab === 'friends' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Мої Друзі ({friends.length})
                    </button>
                    <button
                        onClick={() => setTab('requests')}
                        className={`py-2 px-6 text-lg font-semibold rounded-r-lg transition-colors ${tab === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Запити ({friendRequests.length})
                    </button>
                </div>

                {/* Вміст в залежності від обраної вкладки */}
                {tab === 'friends' && (
                    <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center">Список Друзів</h2>
                        {friends.length === 0 ? (
                            <p className="text-center text-gray-400">У вас поки немає друзів.</p>
                        ) : (
                            <ul className="space-y-4">
                                {friends.map(friend => (
                                    <li key={friend._id} className="flex items-center justify-between bg-[#2a2a2a] p-4 rounded-md shadow">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={friend.avatarUrl || 'https://via.placeholder.com/50?text=👤'}
                                                alt={friend.username}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                            />
                                            <span className="text-lg font-medium">{friend.username}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRejectOrRemove(friend._id, false)}
                                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1"
                                        >
                                            <FaTrash /> <span className="hidden sm:inline">Видалити</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {tab === 'requests' && (
                    <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center">Вхідні Запити на Дружбу</h2>
                        {friendRequests.length === 0 ? (
                            <p className="text-center text-gray-400">Немає вхідних запитів на дружбу.</p>
                        ) : (
                            <ul className="space-y-4">
                                {friendRequests.map(request => (
                                    <li key={request._id} className="flex items-center justify-between bg-[#2a2a2a] p-4 rounded-md shadow">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={request.fromUser?.avatarUrl || 'https://via.placeholder.com/50?text=👤'}
                                                alt={request.fromUser?.username}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                            />
                                            <span className="text-lg font-medium">{request.fromUser?.username || 'Невідомий'}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAcceptRequest(request._id)}
                                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1"
                                            >
                                                <FaCheck /> <span className="hidden sm:inline">Прийняти</span>
                                            </button>
                                            <button
                                                onClick={() => handleRejectOrRemove(request._id, true)}
                                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1"
                                            >
                                                <FaTimes /> <span className="hidden sm:inline">Відхилити</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Модальне вікно "Додати Друга" */}
                {showAddFriendModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700 relative">
                            <button
                                onClick={() => setShowAddFriendModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                                aria-label="Закрити"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-center text-[#e50914]">Додати Друга</h2>
                            <div className="mb-6">
                                <label htmlFor="friendId" className="block text-gray-300 text-sm font-bold mb-2">
                                    Введіть ID користувача:
                                </label>
                                <input
                                    type="text"
                                    id="friendId"
                                    value={friendIdInput}
                                    onChange={(e) => setFriendIdInput(e.target.value)}
                                    className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2a2a2a]"
                                    placeholder="Наприклад, 60c72b2f9f1b2c3d4e5f6a7b"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSendFriendRequest}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
                                >
                                    Надіслати Запит
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FriendsPage;