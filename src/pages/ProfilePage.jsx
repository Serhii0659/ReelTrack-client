// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { fetchUserProfile, updateUserProfile } from '../api/user';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom'; // Додано Link для помилки

const ProfilePage = () => {
    const { user: authUser, logout } = useAuth(); // Отримуємо поточного авторизованого користувача
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '', // Для підтвердження
        newPassword: '',
        confirmNewPassword: '',
        // avatarUrl: '' // ВИДАЛЕНО: більше не використовується
    });

    useEffect(() => {
        const getProfile = async () => {
            if (!authUser) {
                setLoading(false);
                setError('Користувач не авторизований.');
                navigate('/login');
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const data = await fetchUserProfile(); // Отримуємо профіль поточного користувача
                setProfile(data);
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                    // avatarUrl: data.avatarUrl || '' // ВИДАЛЕНО: більше не використовується
                });
            } catch (err) {
                console.error('Помилка отримання профілю:', err);
                setError(err.message || 'Не вдалося завантажити профіль.');
                if (err.response?.status === 401) {
                    toast.error("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [authUser, navigate, logout]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            setError('Новий пароль та підтвердження не збігаються.');
            toast.error('Новий пароль та підтвердження не збігаються.');
            return;
        }

        const dataToUpdate = {};
        if (formData.username !== profile.username) dataToUpdate.username = formData.username;
        if (formData.email !== profile.email) dataToUpdate.email = formData.email;
        // if (formData.avatarUrl !== profile.avatarUrl) dataToUpdate.avatarUrl = formData.avatarUrl; // ВИДАЛЕНО: більше не використовується
        if (formData.newPassword) {
            dataToUpdate.currentPassword = formData.currentPassword;
            dataToUpdate.newPassword = formData.newPassword;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            toast.info('Немає змін для збереження.');
            setIsEditing(false);
            return;
        }

        try {
            const updatedProfile = await updateUserProfile(dataToUpdate);
            setProfile(updatedProfile);
            toast.success('Профіль успішно оновлено!');
            setIsEditing(false);
            // Очистити поля паролів
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
            // Оновити стан користувача в AuthContext, якщо дані користувача змінились
            // Припускаємо, що AuthContext має функцію setUser або refreshUser
            // if (updatedProfile) {
            //     // authUser.setUser(updatedProfile); // Якщо є така функція в контексті
            // }
        } catch (err) {
            console.error('Помилка оновлення профілю:', err);
            const msg = err.response?.data?.message || 'Не вдалося оновити профіль.';
            setError(msg);
            toast.error(msg);
            if (err.response?.status === 401) {
                toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                logout();
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">
                Завантаження профілю...
            </div>
        );
    }

    if (error && !authUser) { // Якщо помилка і користувач не авторизований, показуємо помилку
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500">
                <p>Помилка: {error}. <Link to="/login" className="text-blue-500 hover:underline">Увійти</Link></p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400">
                Профіль не знайдено або стався збій.
            </div>
        );
    }

    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-[#e50914]">Ваш Профіль</h1>

                <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                    {error && (
                        <div className="bg-red-900 text-red-300 p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-gray-300 text-sm font-bold mb-2">Ім'я користувача:</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-3 px-4 text-white bg-[#2a2a2a] leading-tight focus:outline-none focus:shadow-outline border-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-3 px-4 text-white bg-[#2a2a2a] leading-tight focus:outline-none focus:shadow-outline border-gray-700"
                                    required
                                />
                            </div>
                            {/* ВИДАЛЕНО: Блок для URL аватара */}
                            {/* <div>
                                <label htmlFor="avatarUrl" className="block text-gray-300 text-sm font-bold mb-2">URL аватару:</label>
                                <input
                                    type="text"
                                    id="avatarUrl"
                                    name="avatarUrl"
                                    value={formData.avatarUrl}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-3 px-4 text-white bg-[#2a2a2a] leading-tight focus:outline-none focus:shadow-outline border-gray-700"
                                    placeholder="http://example.com/your-avatar.jpg"
                                />
                            </div> */}
                            <div className="pt-4 border-t border-gray-700">
                                <h3 className="text-xl font-semibold mb-4">Змінити пароль (необов'язково)</h3>
                                <div>
                                    <label htmlFor="currentPassword" className="block text-gray-300 text-sm font-bold mb-2">Поточний пароль:</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-3 px-4 text-white bg-[#2a2a2a] leading-tight focus:outline-none focus:shadow-outline border-gray-700"
                                        placeholder="Введіть поточний пароль"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newPassword" className="block text-gray-300 text-sm font-bold mb-2">Новий пароль:</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-3 px-4 text-white bg-[#2a2a2a] leading-tight focus:outline-none focus:shadow-outline border-gray-700"
                                        placeholder="Введіть новий пароль"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmNewPassword" className="block text-gray-300 text-sm font-bold mb-2">Підтвердіть новий пароль:</label>
                                    <input
                                        type="password"
                                        id="confirmNewPassword"
                                        name="confirmNewPassword"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-3 px-4 text-white bg-[#2a2a2a] leading-tight focus:outline-none focus:shadow-outline border-gray-700"
                                        placeholder="Підтвердіть новий пароль"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Скасувати
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Зберегти Зміни
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                            {/* ВИДАЛЕНО: Блок для відображення аватара */}
                            {/* <div className="flex-shrink-0">
                                <img
                                    src={profile.avatarUrl || 'https://via.placeholder.com/150?text=No+Avatar'}
                                    alt="Аватар користувача"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-600"
                                />
                            </div> */}
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-2xl font-semibold mb-2">Ім'я користувача: <span className="text-red-500">{profile.username}</span></p>
                                <p className="text-gray-300 mb-4">Email: <span className="text-gray-400">{profile.email}</span></p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Редагувати Профіль
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;