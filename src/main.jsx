// C:\Users\kreps\Documents\Projects\ReelTrack\client\src\main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Ваш файл стилів Tailwind CSS
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; // Імпортуємо AuthProvider
import { ToastContainer } from 'react-toastify'; // Імпортуємо ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Імпортуємо CSS для react-toastify

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* Обертаємо застосунок у AuthProvider */}
        <App />
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" /> {/* Додаємо ToastContainer */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);