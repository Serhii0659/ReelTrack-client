// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\pages\ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { fetchUserProfile, updateUserProfile } from '../api/user';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage = () => {
    // Отримуємо поточного авторизованого користувача та функцію logout з AuthContext
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();

    // Стан для зберігання даних профілю, отриманих з бекенду
    const [profile, setProfile] = useState(null);
    // Стан для індикації завантаження даних
    const [loading, setLoading] = useState(true);
    // Стан для зберігання помилок
    const [error, setError] = useState(null);
    // Стан для перемикання між режимами перегляду та редагування
    const [isEditing, setIsEditing] = useState(false);
    // Стан для даних форми редагування
    const [formData, setFormData] = useState({
        // ВИПРАВЛЕНО: Використовуємо 'name' замість 'username' відповідно до бекенду
        name: '',
        email: '',
        currentPassword: '', // Поточний пароль для зміни пароля
        newPassword: '', // Новий пароль
        confirmNewPassword: '', // Підтвердження нового пароля
        // ВИДАЛЕНО: Поле avatarUrl
    });

    // Ефект для завантаження профілю користувача при завантаженні сторінки
    useEffect(() => {
        const getProfile = async () => {
            // Якщо користувач не авторизований, встановлюємо стан та перенаправляємо
            if (!authUser) {
                setLoading(false);
                setError('Користувач не авторизований.');
                // navigate('/login'); // Можливо, краще перенаправляти у батьківському компоненті або роуті
                return;
            }
            try {
                setLoading(true);
                setError(null);
                // Викликаємо API для отримання профілю поточного користувача
                const data = await fetchUserProfile();
                // Встановлюємо отримані дані профілю
                setProfile(data);
                // Заповнюємо форму редагування даними з профілю
                setFormData({
                    // ВИПРАВЛЕНО: Використовуємо data.name
                    name: data.name || '',
                    email: data.email || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                    // ВИДАЛЕНО: Ініціалізація avatarUrl
                });
            } catch (err) {
                console.error('Помилка отримання профілю:', err);
                const msg = err.response?.data?.message || 'Не вдалося завантажити профіль.';
                setError(msg);
                toast.error(msg);
                // Якщо помилка 401 (Не авторизовано), виконуємо вихід
                if (err.response?.status === 401) {
                    toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                    logout();
                }
            } finally {
                setLoading(false); // Завершуємо завантаження
            }
        };

        // Викликаємо функцію завантаження профілю
        getProfile();
        // Залежності ефекту: перезавантажуємо при зміні authUser, navigate або logout
    }, [authUser, navigate, logout]);

    // Обробник зміни значень полів форми
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Оновлюємо відповідне поле в стані formData
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Обробник надсилання форми редагування
    const handleSubmit = async (e) => {
        e.preventDefault(); // Запобігаємо стандартній відправці форми
        setError(null); // Очищаємо попередні помилки

        // Перевірка на збіг нового пароля та підтвердження
        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            setError('Новий пароль та підтвердження не збігаються.');
            toast.error('Новий пароль та підтвердження не збігаються.');
            return;
        }

        // Формуємо об'єкт з даними, які потрібно оновити
        const dataToUpdate = {};
        // ВИПРАВЛЕНО: Порівнюємо та додаємо 'name'
        if (formData.name !== profile.name) dataToUpdate.name = formData.name;
        if (formData.email !== profile.email) dataToUpdate.email = formData.email;
        // ВИДАЛЕНО: Перевірка та додавання avatarUrl
        // if (formData.avatarUrl !== profile.avatarUrl) dataToUpdate.avatarUrl = formData.avatarUrl;

        // Якщо є новий пароль, додаємо поля для зміни пароля
        if (formData.newPassword) {
             // Перевіряємо, чи введено поточний пароль при зміні нового
            if (!formData.currentPassword) {
                 setError('Будь ласка, введіть поточний пароль для зміни пароля.');
                 toast.error('Будь ласка, введіть поточний пароль для зміни пароля.');
                 return;
            }
            dataToUpdate.currentPassword = formData.currentPassword;
            dataToUpdate.password = formData.newPassword; // ВИПРАВЛЕНО: Поле на бекенді називається 'password'
        }

        // Якщо немає жодних змін, виводимо повідомлення та виходимо з режиму редагування
        if (Object.keys(dataToUpdate).length === 0) {
            toast.info('Немає змін для збереження.');
            setIsEditing(false);
            return;
        }

        try {
            // Викликаємо API для оновлення профілю
            // ВИПРАВЛЕНО: updateUserProfile тепер приймає тільки dataToUpdate та опціонально файл аватара (який ми не передаємо тут)
            const updatedProfile = await updateUserProfile(dataToUpdate);
            // Оновлюємо стан профілю отриманими даними
            setProfile(updatedProfile);
            toast.success('Профіль успішно оновлено!');
            setIsEditing(false); // Виходимо з режиму редагування
            // Очищаємо поля паролів у формі після успішного оновлення
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
            // Оновити стан користувача в AuthContext, якщо дані користувача змінились
            // Припускаємо, що AuthContext має функцію setUser або refreshUser
            // if (updatedProfile) {
            //     // authUser.setUser(updatedProfile); // Якщо є така функція в контексті
            //     // Або просто оновити локальний стан користувача в контексті, якщо він там зберігається
            // }
        } catch (err) {
            console.error('Помилка оновлення профілю:', err);
            const msg = err.response?.data?.message || 'Не вдалося оновити профіль.';
            setError(msg); // Встановлюємо помилку
            toast.error(msg); // Показуємо повідомлення про помилку
            // Якщо помилка 401, виконуємо вихід
            if (err.response?.status === 401) {
                toast.info("Ваша сесія закінчилася. Будь ласка, увійдіть знову.");
                logout();
            }
        }
    };

    // Відображення стану завантаження
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                 <Header /> {/* Додано Header */}
                Завантаження профілю...
            </div>
        );
    }

    // Відображення помилки, якщо користувач не авторизований
    if (error && !authUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-red-500 pt-24">
                 <Header /> {/* Додано Header */}
                <p>Помилка: {error}. <Link to="/login" className="text-blue-500 hover:underline">Увійти</Link></p>
            </div>
        );
    }

    // Відображення повідомлення, якщо профіль не завантажився (наприклад, помилка 404 або інша)
    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#171717] text-gray-400 pt-24">
                 <Header /> {/* Додано Header */}
                Профіль не знайдено або стався збій.
            </div>
        );
    }

    // Основне відображення сторінки профілю
    return (
        <div className="bg-[#171717] min-h-screen text-white pt-24">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-4xl font-bold mb-8 text-center text-white">Ваш Профіль</h1>

                <div className="bg-[#1e1e1e] p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                    {/* Відображення помилок в межах форми */}
                    {error && (
                        <div className="bg-red-900 text-red-300 p-3 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {/* Умовне відображення форми редагування або даних профілю */}
                    {isEditing ? (
                        // Форма редагування
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                {/* ВИПРАВЛЕНО: Лейбл та поле для 'name' */}
                                <label htmlFor="name" className="block text-gray-300 text-sm font-bold mb-2">Ім'я користувача:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
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
                            {/* ВИДАЛЕНО: Блок для завантаження файлу аватара (якщо був) */}

                            <div className="pt-4 border-t border-gray-700">
                                <h3 className="text-xl font-semibold mb-4 text-white">Змінити пароль (необов'язково)</h3>
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
                                        // Поле обов'язкове, тільки якщо введено новий пароль
                                        required={!!formData.newPassword}
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
                        // Відображення даних профілю
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                            {/* ВИДАЛЕНО: Блок для відображення аватара */}
                            <div className="flex-1 text-center md:text-left">
                                {/* ВИПРАВЛЕНО: Відображаємо profile.name */}
                                <p className="text-2xl font-semibold mb-2 text-white">Ім'я користувача: <span className="text-[#e50914]">{profile.name}</span></p> {/* Змінено колір на червоний */}
                                <p className="text-gray-300 mb-4">Email: <span className="text-gray-400">{profile.email}</span></p>
                                {/* Можна додати відображення інших публічних полів, якщо вони є в об'єкті profile */}
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
