import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './routes/ProtectedRoute';
import RegisterPage from './pages/RegisterPage'; // Додано імпорт сторінки реєстрації
import Footer from './components/Footer'; 
import { useAuth } from './context/AuthContext'; // Використовуємо useAuth

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Тут може бути Header */}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            {/* Інші захищені маршрути */}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;