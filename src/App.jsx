import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import MyLibraryPage from './pages/MyLibraryPage';
import AboutUs from './pages/AboutUs';
import Footer from './components/Footer';

const App = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
                <AppRoutes />
            </div>
            <Footer />
        </div>
    );
};

const AppRoutes = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    return (
        <Routes>
            {/* Сторінка "About Us" за замовчуванням */}
            <Route
                path="/"
                element={<AboutUs />}
            />
            {/* Сторінка логіна */}
            <Route
                path="/login"
                element={<LoginPage />}
            />
            {/* Сторінка реєстрації */}
            <Route
                path="/register"
                element={<RegisterPage />}
            />
            {/* Домашня сторінка */}
            <Route
                path="/home"
                element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
            />
            {/* Профіль */}
            <Route
                path="/profile"
                element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
            />
            {/* Друзі */}
            <Route
                path="/friends"
                element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" replace />}
            />
            {/* Бібліотека */}
            <Route
                path="/library"
                element={isAuthenticated ? <MyLibraryPage /> : <Navigate to="/login" replace />}
            />
        </Routes>
    );
};

export default App;