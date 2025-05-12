// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\FriendsPage.jsx
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import {
    fetchFriends,
    fetchFriendRequests,
    acceptFriendRequest,
    rejectOrRemoveFriend, // Використовуємо оновлену функцію
    sendFriendRequest,
    searchUsers // Припускаємо, що ця функція API існує і може шукати за ID
} from '../api/user';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

const FriendsPage = () => {
    const { isAuthenticated, logout, user } = useAuth(); // Додано 'user' для доступу до ID поточного користувача
    const navigate = useNavigate();

    const [friends, setFriends] = useState([]);
    // ВИПРАВЛЕНО: friendRequests тепер містить об'єкти користувачів, які надіслали запит
    const [friendRequests, setFriendRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('friends'); // 'friends' або 'requests'

    // Нові стани для модального вікна "Додати Друга"
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [friendIdInput, setFriendIdInput] = useState('');
    const [searchResult, setSearchResult] = useState(null); // Стан для результату пошуку користувача
    const [searching, setSearching] = useState(false); // Стан для індикації пошуку

    // Функція для завантаження друзів та запитів
    const loadFriendsAndRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            // ВИПРАВЛЕНО: Очікуємо, що fetchFriendRequests повертає масив об'єктів користувачів
            const [friendsData, requestsData] = await Promise.all([
                fetchFriends(), // Отримуємо список друзів (масив об'єктів користувачів)
                fetchFriendRequests() // Отримуємо список вхідних запитів (масив об'єктів користувачів)
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


    // ВИПРАВЛЕНО: handleAcceptRequest тепер приймає userId
    const handleAcceptRequest = async (userId, e) => {
        e.stopPropagation(); // Зупиняємо спливання події, щоб не спрацьовувала навігація
        try {
            // Передаємо userId до API функції
            await acceptFriendRequest(userId);
            toast.success('Запит на дружбу прийнято!');
            // Оновлюємо списки: видаляємо запит та додаємо до друзів
            setFriendRequests(prev => prev.filter(req => req._id !== userId));
            // Оскільки бекенд не повертає об'єкт нового друга при прийнятті,
            // найпростіший спосіб оновити список друзів - це перезавантажити його.
            loadFriendsAndRequests(); // Перезавантажуємо обидва списки
        } catch (err) {
            console.error('Помилка прийняття запиту:', err);
            const msg = err.response?.data?.message || 'Не вдалося прийняти запит.';
            toast.error(msg);
            setError(msg);
        }
    };

    // ВИПРАВЛЕНО: handleRejectOrRemove тепер приймає userId
    const handleRejectOrRemove = async (userId, isRequest, e) => {
        e.stopPropagation(); // Зупиняємо спливання події, щоб не спрацьовувала навігація
        // ВИПРАВЛЕНО: Перевіряємо, чи ID є валідним ObjectId перед відправкою на бекенд
        if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
            toast.error('Невірний ID користувача.');
            console.error('Attempted to reject/remove with invalid userId:', userId);
            return;
        }

        try {
            // ВИПРАВЛЕНО: Викликаємо rejectOrRemoveFriend тільки з userId
            await rejectOrRemoveFriend(userId);
            if (isRequest) {
                toast.info('Запит на дружбу відхилено.');
                // Видаляємо запит зі списку вхідних запитів
                setFriendRequests(prev => prev.filter(req => req._id !== userId));
            } else {
                toast.info('Друга видалено.');
                // Видаляємо друга зі списку друзів
                setFriends(prev => prev.filter(friend => friend._id !== userId));
            }
        } catch (err) {
            console.error(`Помилка при ${isRequest ? 'відхиленні запиту' : 'видаленні друга'} користувача ${userId}:`, err);
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
        // ВИПРАВЛЕНО: Перевіряємо, чи ID є валідним ObjectId перед відправкою на бекенд
        if (friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput)) {
            toast.error('Невірний формат ID користувача.');
            return;
        }
        
        // Перевірка, чи користувач не намагається додати себе
        if (user && friendIdInput === user._id) {
            toast.error('Ви не можете надіслати запит на дружбу самому собі.');
            return;
        }

        // Перевірка, чи користувач вже є другом
        if (friends.some(f => f._id === friendIdInput)) {
            toast.info('Цей користувач вже у вас в друзях.');
            setShowAddFriendModal(false);
            setFriendIdInput('');
            setSearchResult(null);
            return;
        }

        // Перевірка, чи запит вже був надісланий
        if (friendRequests.some(req => req._id === friendIdInput)) {
            toast.info('Запит на дружбу цьому користувачу вже надіслано.');
            setShowAddFriendModal(false);
            setFriendIdInput('');
            setSearchResult(null);
            return;
        }


        console.log('Attempting to send friend request to ID:', friendIdInput);
        try {
            // ВИПРАВЛЕНО: Викликаємо sendFriendRequest з friendIdInput
            await sendFriendRequest(friendIdInput);
            toast.success('Запит на дружбу надіслано!');
            setShowAddFriendModal(false);
            setFriendIdInput('');
            setSearchResult(null); // Очищаємо результат пошуку
            // Можливо, оновити список надісланих запитів, якщо ви його відображаєте
            // loadFriendsAndRequests(); // Можна перезавантажити все, якщо потрібно
        } catch (err) {
            console.error('Помилка надсилання запиту на дружбу:', err);
            const msg = err.response?.data?.message || 'Не вдалося надіслати запит на дружбу.';
            toast.error(msg);
        }
    };

    // Функція для пошуку користувача за ID (для модального вікна)
    const handleSearchUser = async () => {
        if (!friendIdInput) {
            setSearchResult(null);
            return;
        }
        // ВИПРАВЛЕНО: Перевіряємо, чи ID є валідним ObjectId перед відправкою на бекенд
        if (friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput)) {
            setSearchResult({ error: 'Невірний формат ID користувача.' });
            return;
        }
        
        // Перевірка, чи ID, який шукають, не є ID поточного користувача
        if (user && friendIdInput === user._id) {
            setSearchResult({ error: 'Це ваш власний ID.' });
            return;
        }
        // Перевірка, чи користувач вже є другом
        if (friends.some(f => f._id === friendIdInput)) {
            setSearchResult({ error: 'Цей користувач вже у вас в друзях.' });
            return;
        }
        // Перевірка, чи запит вже був надісланий
        if (friendRequests.some(req => req._id === friendIdInput)) {
            setSearchResult({ error: 'Запит на дружбу цьому користувачу вже надіслано.' });
            return;
        }


        setSearching(true);
        setSearchResult(null);
        try {
            // ВИПРАВЛЕНО: Викликаємо searchUsers або іншу функцію для пошуку користувача за ID
            // Припускаємо, що searchUsers може шукати за ID, або вам потрібна нова функція API
            // Якщо searchUsers шукає лише за іменем, вам потрібен новий API ендпоінт та функція
            // Припускаємо, що `searchUsers` тепер може приймати ID і повертати масив з 0 або 1 користувачем
            const users = await searchUsers(friendIdInput); // Припускаємо, що searchUsers працює з ID
            if (users && users.length > 0) {
                setSearchResult(users[0]); // Припускаємо, що повертається масив, беремо першого
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

    // Функція для переходу на сторінку профілю
    const handleViewProfile = (userId) => {
        if (user && userId === user._id) {
            // Якщо ID друга збігається з ID поточного користувача, можна перейти на власну сторінку MyLibrary
            // або просто нічого не робити, оскільки користувач вже на своїй сторінці друзів.
            // Але для уніфікації можна перенаправити на /mylibrary або /profile/:userId (свій власний)
            toast.info("Це ваш профіль!");
            // navigate('/mylibrary'); // Або navigate(`/profile/${userId}`);
            return;
        }
        navigate(`/profile/${userId}`);
    };


    if (!isAuthenticated) {
        // Відображаємо повідомлення, якщо користувач не автентифікований
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
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500 pt-24">
                <Header />
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-[#e50914]">Друзі</h1>

                {/* Кнопка для відкриття модального вікна "Додати Друга" */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={() => {
                            setShowAddFriendModal(true);
                            setFriendIdInput(''); // Очищаємо поле вводу при відкритті
                            setSearchResult(null); // Очищаємо результат пошуку
                        }}
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
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Список Друзів</h2> {/* Колір заголовка */}
                        {friends.length === 0 ? (
                            <p className="text-center text-gray-400">У вас поки немає друзів.</p>
                        ) : (
                            <ul className="space-y-4">
                                {friends.map(friend => (
                                    <li key={friend._id} className="flex items-center justify-between bg-[#2a2a2a] p-4 rounded-md shadow">
                                        {/* Зроблено клікабельним блок з інформацією про друга */}
                                        <div
                                            className="flex items-center space-x-4 cursor-pointer flex-grow" // flex-grow, щоб зайняти більше місця
                                            onClick={() => handleViewProfile(friend._id)}
                                        >
                                            <img
                                                src={friend.avatarUrl || 'https://via.placeholder.com/50?text=👤'}
                                                alt={friend.name || 'Без імені'}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                            />
                                            <span className="text-lg font-medium text-white">{friend.name || 'Невідомий'}</span>
                                        </div>
                                        <button
                                            // ВИПРАВЛЕНО: Передаємо friend._id та об'єкт події
                                            onClick={(e) => handleRejectOrRemove(friend._id, false, e)}
                                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1 ml-4" // Додано ml-4 для відступу
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
                        <h2 className="text-2xl font-bold mb-4 text-center text-white">Вхідні Запити на Дружбу</h2> {/* Колір заголовка */}
                        {friendRequests.length === 0 ? (
                            <p className="text-center text-gray-400">Немає вхідних запитів на дружбу.</p>
                        ) : (
                            <ul className="space-y-4">
                                {friendRequests.map(request => (
                                    <li key={request._id} className="flex items-center justify-between bg-[#2a2a2a] p-4 rounded-md shadow">
                                        {/* Зроблено клікабельним блок з інформацією про користувача, який надіслав запит */}
                                        <div
                                            className="flex items-center space-x-4 cursor-pointer flex-grow" // flex-grow, щоб зайняти більше місця
                                            onClick={() => handleViewProfile(request._id)}
                                        >
                                            <img
                                                src={request.avatarUrl || 'https://via.placeholder.com/50?text=👤'}
                                                alt={request.name || 'Без імені'}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                            />
                                            <span className="text-lg font-medium text-white">{request.name || 'Невідомий'}</span>
                                        </div>
                                        <div className="flex space-x-2 ml-4"> {/* Додано ml-4 для відступу */}
                                            <button
                                                // ВИПРАВЛЕНО: Передаємо request._id (це ID користувача) та об'єкт події
                                                onClick={(e) => handleAcceptRequest(request._id, e)}
                                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors flex items-center space-x-1"
                                            >
                                                <FaCheck /> <span className="hidden sm:inline">Прийняти</span>
                                            </button>
                                            <button
                                                // ВИПРАВЛЕНО: Передаємо request._id (це ID користувача) та об'єкт події
                                                onClick={(e) => handleRejectOrRemove(request._id, true, e)}
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
                            <div className="mb-4"> {/* Зменшено нижній відступ */}
                                <label htmlFor="friendId" className="block text-gray-300 text-sm font-bold mb-2">
                                    Введіть ID користувача:
                                </label>
                                <input
                                    type="text"
                                    id="friendId"
                                    value={friendIdInput}
                                    onChange={(e) => {
                                        setFriendIdInput(e.target.value);
                                        setSearchResult(null); // Очищаємо результат при зміні вводу
                                    }}
                                    className="shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2a2a2a]"
                                    placeholder="Наприклад, 60c72b2f9f1b2c3d4e5f6a7b"
                                />
                            </div>

                            {/* Кнопка пошуку користувача */}
                            <div className="mb-4 flex justify-end"> {/* Зменшено нижній відступ */}
                                <button
                                    onClick={handleSearchUser}
                                    disabled={searching || !friendIdInput || friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput)}
                                    className={`bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors ${searching || !friendIdInput || friendIdInput.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(friendIdInput) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {searching ? 'Пошук...' : 'Знайти Користувача'}
                                </button>
                            </div>

                            {/* Результат пошуку */}
                            {searchResult && (
                                <div className="mb-6 p-4 bg-[#2a2a2a] rounded-md">
                                    {searchResult.error ? (
                                        <p className="text-red-500 text-center">{searchResult.error}</p>
                                    ) : (
                                        <div className="flex items-center space-x-4">
                                            <img
                                                src={searchResult.avatarUrl || 'https://via.placeholder.com/50?text=👤'}
                                                alt={searchResult.name || 'Без імені'}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                                            />
                                            <span className="text-lg font-medium text-white">{searchResult.name || 'Невідомий'}</span>
                                            {/* Можна додати кнопку "Надіслати запит" тут, якщо користувач знайдений */}
                                        </div>
                                    )}
                                </div>
                            )}


                            <div className="flex justify-end">
                                {/* Кнопка "Надіслати Запит" - активна лише якщо користувач знайдений і немає помилки */}
                                <button
                                    onClick={handleSendFriendRequest}
                                    disabled={!searchResult || searchResult.error || searching} // Вимикаємо, якщо немає результату, є помилка, або йде пошук
                                    className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors ${!searchResult || searchResult.error || searching ? 'opacity-50 cursor-not-allowed' : ''}`}
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
