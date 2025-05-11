// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\components\ReviewTabs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Переконайтеся, що ReviewCard та ReviewGroup правильно імпортовані
import ReviewCard, { ReviewGroup } from './ReviewCard.jsx';
// Переконайтеся, що getUserReviews імпортовано з правильного файлу (api/user.js)
import { getUserReviews } from '../api/user.js';
// Переконайтеся, що Spinner імпортовано з правильного файлу
import Spinner from './Spinner';
// import ErrorMessage from './ErrorMessage'; // Розкоментуйте, якщо у вас є компонент ErrorMessage
import { useAuth } from '../context/AuthContext'; // Для перевірки автентифікації

const ReviewTabs = () => {
    // Використовуємо стан для зберігання відгуків користувача
    // Ініціалізуємо як порожній масив, щоб уникнути undefined
    const [userReviews, setUserReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true); // Стан завантаження
    const [errorReviews, setErrorReviews] = useState(null); // Стан помилки

    const { isAuthenticated, loading: authLoading } = useAuth(); // Отримуємо стан автентифікації та завантаження з контексту

    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            // Не намагаємося завантажити відгуки, якщо користувач не автентифікований
            // або якщо контекст автентифікації ще завантажується
            if (!isAuthenticated || authLoading) {
                setLoadingReviews(false); // Завершуємо завантаження, якщо не автентифіковані
                setErrorReviews(null); // Скидаємо помилку
                setUserReviews([]); // Очищаємо відгуки
                return;
            }

            setLoadingReviews(true); // Починаємо завантаження відгуків
            setErrorReviews(null); // Скидаємо попередні помилки

            try {
                console.log('ReviewTabs: Спроба отримати відгуки користувача...');
                const reviews = await getUserReviews(); // Викликаємо функцію API
                console.log('ReviewTabs: Отримано відгуки:', reviews);
                setUserReviews(reviews); // Оновлюємо стан з отриманими відгуками
            } catch (error) {
                console.error('ReviewTabs: Помилка при отриманні відгуків користувача:', error);
                setErrorReviews(error); // Зберігаємо об'єкт помилки
                setUserReviews([]); // Очищаємо відгуки при помилці
                // Можливо, перенаправити на сторінку входу, якщо помилка 401
                // if (error.response?.status === 401) {
                //     navigate('/login');
                // }
            } finally {
                setLoadingReviews(false); // Завершуємо завантаження незалежно від результату
            }
        };

        // Викликаємо функцію отримання відгуків при зміні стану автентифікації
        // або при першому завантаженні компонента (якщо isAuthenticated вже true)
        fetchReviews();

    }, [isAuthenticated, authLoading]); // Залежності ефекту

    // Показуємо спінер, якщо автентифікація або відгуки завантажуються
    if (authLoading || loadingReviews) {
        return <Spinner />; // Використовуємо ваш компонент спінера
    }

    // Якщо користувач не автентифікований після завантаження
    if (!isAuthenticated) {
         // Можливо, відобразити повідомлення або перенаправити
         return <div className="text-center text-gray-400 text-lg mt-4">Будь ласка, увійдіть, щоб переглянути ваші відгуки.</div>;
    }

    // Якщо сталася помилка при завантаженні відгуків
    if (errorReviews) {
        return (
            <div className="text-center text-red-500 text-lg mt-4">
                Помилка завантаження відгуків: {errorReviews.message || 'Невідома помилка'}
                {/* Або використовуйте ваш компонент ErrorMessage */}
                {/* <ErrorMessage message={errorReviews.message || 'Невідома помилка'} /> */}
            </div>
        );
    }

    // Якщо дані завантажено успішно, але відгуків немає
    if (userReviews.length === 0) {
        return <div className="text-center text-gray-400 text-lg mt-4">У вас ще немає відгуків.</div>;
    }

    // Якщо відгуки завантажено і вони є
    return (
        <div className="review-tabs-container mt-4">
            {/* Можливо, тут буде логіка перемикання між вкладками, якщо вони є */}
            {/* Наприклад, вкладки "Мої відгуки", "Відгуки друзів" тощо */}

            {/* Відображаємо список відгуків користувача */}
            <h3 className="text-xl font-semibold text-white mb-4">Мої відгуки</h3>
            {/* Використовуємо ReviewGroup для відображення списку карток */}
            <ReviewGroup reviews={userReviews} />

        </div>
    );
};

export default ReviewTabs;
