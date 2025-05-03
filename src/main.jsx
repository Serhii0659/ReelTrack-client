import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Імпортуємо BrowserRouter тут
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext'; // Імпортуємо AuthProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* Обертаємо все в BrowserRouter */}
      <AuthProvider> {/* Обертаємо App в AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);