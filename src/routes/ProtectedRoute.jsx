import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Використовуємо useAuth

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth(); // Отримуємо стан з контексту

    if (loading) {
        // Можна показати індикатор завантаження, поки йде перевірка автентифікації
        return <div>Loading...</div>;
    }

    // Якщо користувач автентифікований, показуємо дочірній компонент (Outlet)
    // Якщо ні, перенаправляємо на сторінку логіну
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;