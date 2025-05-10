// client\src\App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // <<< ДОДАНО useLocation
import { useAuth } from './context/AuthContext';

// Імпорт сторінок
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import MyLibraryPage from './pages/MyLibraryPage';
import AboutUs from './pages/AboutUs';
import ContentDetailsPage from './pages/ContentDetailsPage'; // Переконайся, що цей імпорт один раз

// Імпорт компонентів макету (Header, Footer)
import Footer from './components/Footer';
import Header from './components/Header';

const App = () => {
    // Footer залишаємо тут, якщо він має бути на всіх сторінках
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header тепер буде рендеритися всередині AppRoutes умовно */}

            <div className="flex-grow"> {/* Flex-grow контейнер для контенту сторінок */}
                <AppRoutes /> {/* Тут рендеряться маршрути, включно з умовним Header */}
            </div>

            {/* Footer залишається тут і відображається на всіх сторінках */}
            <Footer />
        </div>
    );
};

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation(); // Отримуємо поточний об'єкт location

    // Визначаємо шляхи, на яких Header НЕ ПОВИНЕН відображатися
    const noHeaderPaths = ['/', '/login', '/register'];

    // Визначаємо, чи потрібно показувати Header на поточному шляху
    const shouldShowHeader = !noHeaderPaths.includes(location.pathname);

    if (loading) {
        return <div className="text-center p-4 text-white">Loading...</div>; // Додав колір тексту для видимості
    }

    return (
        <> {/* Використовуємо фрагмент, оскільки можемо рендерити Header та Routes послідовно */}
            {/* Умовно рендеримо Header */}
            {shouldShowHeader && <Header />}

            {/* Визначаємо маршрути */}
            <Routes>
                {/* Сторінки без Header */}
                <Route path="/" element={<AboutUs />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Захищені маршрути, що потребують автентифікації (також матимуть Header завдяки shouldShowHeader) */}
                <Route
                    path="/home"
                    element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/profile"
                    element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
                />
                 {/* Маршрут для публічного профілю іншого користувача (може мати Header) */}
                <Route path="/profile/:userId" element={<ProfilePage />} />

                <Route
                    path="/friends"
                    element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/library"
                    element={isAuthenticated ? <MyLibraryPage /> : <Navigate to="/login" replace />}
                />

                {/* Маршрут для сторінки деталей контенту (теж матиме Header) */}
                <Route
                    path="/content/:mediaType/:tmdbId"
                    element={<ContentDetailsPage />}
                />

                {/* TODO: Додати маршрут 404 сторінки */}
                 <Route path="*" element={<div className="text-white text-center mt-20">404 - Сторінка не знайдена</div>} /> {/* Додав базові стилі */}
            </Routes>
        </>
    );
};

export default App;