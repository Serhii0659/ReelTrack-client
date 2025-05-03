import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './routes/ProtectedRoute';
import RegisterPage from './pages/RegisterPage'; // Додано імпорт сторінки реєстрації
import { useAuth } from './context/AuthContext'; // Використовуємо useAuth

function App() {
  const { isAuthenticated } = useAuth(); // Отримуємо стан автентифікації з контексту

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register" // Додаємо маршрут для реєстрації
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Захищені маршрути */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        {/* Інші захищені маршрути */}
      </Route>

      {/* Маршрут за замовчуванням */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;