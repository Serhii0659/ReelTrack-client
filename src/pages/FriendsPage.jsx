import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import {
    fetchFriends,
    fetchFriendRequests,
    acceptFriendRequest,
    rejectOrRemoveFriend,
    sendFriendRequest,
    searchUsers
} from '../api/user';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const FriendsPage = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate(); // navigate still needed for logout/login redirects

    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('friends'); // 'friends' або 'requests'

    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [friendIdInput, setFriendIdInput] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);

    // Допоміжна функція для рендерингу аватара (зображення або ініціалу)
    // Тепер НЕ приймає userId та onClickHandler, оскільки посилання видалені
    const renderAvatar = (userObj, sizeClass, borderColorClass, textSizeClass) => {
        const name = userObj?.name;
        const avatarUrl = userObj?.avatarUrl;
        const initial = name ? name.charAt(0).toUpperCase() : '👤';

        const baseClasses = `${sizeClass} rounded-full object-cover border-2 ${borderColorClass} shadow-md flex-shrink-0`;
        const initialDivClasses = `${sizeClass} rounded-full bg-gray-600 flex items-center justify-center text-white ${textSizeClass} font-semibold border-2 ${borderColorClass} shadow-md flex-shrink-0`;

        if (avatarUrl) {
            return (
                <img
                    src={avatarUrl}
                    alt={name || 'Без імені'}
                    className={`${baseClasses}`}
                />
            );
        } else {
            return (
                <div
                    className={`${initialDivClasses}`}
                >
                    {initial}
                </div>
            );
        }
    };

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

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            toast.info('Будь ласка, увійдіть, щоб переглянути друзів.');
            return;
        }

        loadFriendsAndRequests();
    }, [isAuthenticated, navigate, logout]);

    const handleAcceptRequest = async (userId, e) => {
        e.stopPropagation();
        try {
            await acceptFriendRequest(userId);
            toast.success('Запит на дружбу прийнято!');
            setFriendRequests(prev => prev.filter(req => req._id !== userId));
            loadFriendsAndRequests(); // Оновити список друзів після прийняття
        } catch (err) {
            console.error('Помилка прийняття запиту:', err);
            const msg = err.response?.data?.message || 'Не вдалося прийняти запит.';
            toast.error(msg);
            setError(msg);
        }
    };

    const handleRejectOrRemove = async (userId, isRequest, e) => {
        e.stopPropagation();
        if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            toast.error('Невірний ID користувача.');
            console.error('Attempted to reject/remove with invalid userId:', userId);
            return;
        }

        try {
            await rejectOrRemoveFriend(userId);
            if (isRequest) {
                toast.info('Запит на дружбу відхилено.');
                setFriendRequests(prev => prev.filter(req => req._id !== userId));
            } else {
                toast.info('Друга видалено.');
                setFriends(prev => prev.filter(friend => friend._id !== userId));
            }
        } catch (err) {
            console.error(`Помилка при ${isRequest ? 'відхиленні запиту' : 'видаленні друга'} користувача ${userId}:`, err);
            const msg = err.response?.data?.message || `Не вдалося ${isRequest ? 'відхилити запит' : 'видалити друга'}.`;
            toast.error(msg);
            setError(msg);
        }
    };

    const handleSendFriendRequest = async () => {
        if (!friendIdInput) {
            toast.error('Будь ласка, введіть ID користувача.');
            return;
        }
        if (friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput)) {
            toast.error('Невірний формат ID користувача.');
            return;
        }

        if (user && friendIdInput === user._id) {
            toast.error('Ви не можете надіслати запит на дружбу самому собі.');
            return;
        }

        if (friends.some(f => f._id === friendIdInput)) {
            toast.info('Цей користувач вже у вас в друзях.');
            setShowAddFriendModal(false);
            setFriendIdInput('');
            setSearchResult(null);
            return;
        }

        if (friendRequests.some(req => req._id === friendIdInput)) {
            toast.info('Запит на дружбу цьому користувачу вже надіслано.');
            setShowAddFriendModal(false);
            setFriendIdInput('');
            setSearchResult(null);
            return;
        }

        console.log('Attempting to send friend request to ID:', friendIdInput);
        try {
            await sendFriendRequest(friendIdInput);
            toast.success('Запит на дружбу надіслано!');
            setShowAddFriendModal(false);
            setFriendIdInput('');
            setSearchResult(null);
        } catch (err) {
            console.error('Помилка надсилання запиту на дружбу:', err);
            const msg = err.response?.data?.message || 'Не вдалося надіслати запит на дружбу.';
            toast.error(msg);
        }
    };

    const handleSearchUser = async () => {
        if (!friendIdInput) {
            setSearchResult(null);
            return;
        }
        if (friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput)) {
            setSearchResult({ error: 'Невірний формат ID користувача.' });
            return;
        }

        if (user && friendIdInput === user._id) {
            setSearchResult({ error: 'Це ваш власний ID.' });
            return;
        }
        if (friends.some(f => f._id === friendIdInput)) {
            setSearchResult({ error: 'Цей користувач вже у вас в друзях.' });
            return;
        }
        if (friendRequests.some(req => req._id === friendIdInput)) {
            setSearchResult({ error: 'Запит на дружбу цьому користувачу вже надіслано.' });
            return;
        }

        setSearching(true);
        setSearchResult(null);
        try {
            const users = await searchUsers(friendIdInput);
            if (users && users.length > 0) {
                setSearchResult(users[0]);
            } else {
                setSearchResult({ error: 'Користувача з таким ID не знайдено.' });
            }
        } catch (err) {
            console.error('Помилка пошуку користувача:', err);
            setSearchResult({ error: err.response?.data?.message || 'Не вдалося знайти користувача.' });
        } finally {
            setSearching(false);
        }
    };

    // Функція handleViewProfile видалена, оскільки посилання на профіль більше немає


    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                <Header />
                <p>Будь ласка, увійдіть, щоб переглянути друзів.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                <Header />
                Завантаження друзів та запитів...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                <Header />
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-white">Друзі</h1>

                {/* Кнопка для відкриття модального вікна "Додати Друга" */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => {
                            setShowAddFriendModal(true);
                            setFriendIdInput('');
                            setSearchResult(null);
                        }}
                        className="bg-gray-600 hover:bg-gray-600 text-white py-3 px-6 rounded-lg text-lg font-semibold flex items-center space-x-2 transition-colors"
                    >
                        <FaUserPlus />
                        <span>Додати Друга за ID</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => setTab('friends')}
                        className={`py-2 px-6 text-lg font-semibold rounded-l-lg transition-colors ${tab === 'friends' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Мої Друзі 
                    </button>
                    <button
                        onClick={() => setTab('requests')}
                        className={`py-2 px-6 text-lg font-semibold rounded-r-lg transition-colors ${tab === 'requests' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Запити 
                    </button>
                </div>

                {/* Вміст в залежності від обраної вкладки */}
                {tab === 'friends' && (
                    <div className="bg-[#1e1e1e] p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Список Друзів</h2>
                        {friends.length === 0 ? (
                            <p className="text-center text-gray-400">У вас поки немає друзів.</p>
                        ) : (
                            <ul className="space-y-4">
                                {friends.map(friend => (
                                    <li key={friend._id} className="flex items-center justify-between bg-[#2a2a2a] p-4 rounded-md shadow">
                                        <div
                                            className="flex items-center space-x-4 flex-grow" // Курсор pointer та onClick видалені
                                        >
                                            {renderAvatar(friend, 'w-12 h-12', 'border-gray-400', 'text-lg')} {/* Передаються лише дані для рендерингу аватара */}
                                            <span
                                                className="text-lg font-medium text-white" // Курсор pointer та onClick видалені
                                            >
                                                {friend.name || 'Невідомий'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => handleRejectOrRemove(friend._id, false, e)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1 ml-4"
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
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Вхідні Запити на Дружбу</h2>
                        {friendRequests.length === 0 ? (
                            <p className="text-center text-gray-400">Немає вхідних запитів на дружбу.</p>
                        ) : (
                            <ul className="space-y-4">
                                {friendRequests.map(request => (
                                    <li key={request._id} className="flex items-center justify-between bg-[#2a2a2a] p-4 rounded-md shadow">
                                        <div
                                            className="flex items-center space-x-4 flex-grow" // Курсор pointer та onClick видалені
                                        >
                                            {renderAvatar(request, 'w-12 h-12', 'border-gray-400', 'text-lg')} {/* Передаються лише дані для рендерингу аватара */}
                                            <span
                                                className="text-lg font-medium text-white" // Курсор pointer та onClick видалені
                                            >
                                                {request.name || 'Невідомий'}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={(e) => handleAcceptRequest(request._id, e)}
                                                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1"
                                            >
                                                <FaCheck /> <span className="hidden sm:inline">Прийняти</span>
                                            </button>
                                            <button
                                                onClick={(e) => handleRejectOrRemove(request._id, true, e)}
                                                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1"
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
                        <div className="bg-[#1e1e1e] p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-700 relative">
                            <button
                                onClick={() => setShowAddFriendModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                                aria-label="Закрити"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-bold mb-6 text-center text-white">Додати Друга</h2>
                            <div className="mb-4">
                                <label htmlFor="friendId" className="block text-gray-300 text-sm font-bold mb-2">
                                    Введіть ID користувача:
                                </label>
                                <input
                                    type="text"
                                    id="friendId"
                                    value={friendIdInput}
                                    onChange={(e) => {
                                        setFriendIdInput(e.target.value);
                                        setSearchResult(null);
                                    }}
                                    className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-gray-500 bg-[#2a2a2a]"
                                />
                            </div>

                            {/* Результат пошуку */}
                            {searchResult && (
                                <div className="mb-6 p-4 bg-[#2a2a2a] rounded-md">
                                    {searchResult.error ? (
                                        <p className="text-gray-500 text-center">{searchResult.error}</p>
                                    ) : (
                                        <div className="flex items-center space-x-4">
                                            {renderAvatar(searchResult, 'w-14 h-14', 'border-gray-500', 'text-xl')}
                                            <span
                                                className="text font-medium text-white"
                                            >
                                                {searchResult.name || 'Невідомий'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Кнопки "Знайти Користувача" та "Надіслати Запит" */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleSearchUser}
                                    disabled={searching || !friendIdInput || friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput)}
                                    className={`bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors ${searching || !friendIdInput || friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {searching ? 'Пошук...' : 'Знайти Користувача'}
                                </button>
                                {/* Кнопка "Надіслати Запит" - активна лише якщо користувач знайдений і немає помилки */}
                                <button
                                    onClick={handleSendFriendRequest}
                                    disabled={!searchResult || searchResult.error || searching}
                                    className={`bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors ${!searchResult || searchResult.error || searching ? 'opacity-50 cursor-not-allowed' : ''}`}
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
