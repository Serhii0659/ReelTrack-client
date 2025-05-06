import React from 'react'; 
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { useAuth } from './context/AuthContext'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';  
import ProfilePage from './pages/ProfilePage'; 
import FriendsPage from './pages/FriendsPage'; // Імпортуємо сторінку "Друзі"
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
            <Route
                path="/"
                element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />}
            />
            <Route
                path="/login"
                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
            />
            <Route
                path="/register"
                element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />}
            />
            <Route
                path="/profile"
                element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />}
            />
            <Route
                path="/friends" // Додаємо маршрут для сторінки "Друзі"
                element={isAuthenticated ? <FriendsPage /> : <Navigate to="/login" replace />}
            />
        </Routes>
    );
};

export default App;