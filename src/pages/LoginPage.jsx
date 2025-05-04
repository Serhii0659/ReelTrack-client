import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function LoginPage() {
    // State для збереження введеного email
    const [email, setEmail] = useState('');
    // State для збереження введеного пароля
    const [password, setPassword] = useState('');
    // State для переключення видимості пароля
    const [showPassword, setShowPassword] = useState(false);
    // Дістаємо функцію login та стан loading з контексту автентифікації
    const { login, loading } = useAuth();

    // Обробник події на сабміт форми
    const handleSubmit = (e) => {
        e.preventDefault(); // Запобігає перезавантаженню сторінки
        if (!email || !password) {
            alert('Будь ласка, введіть логін та пароль'); // Виводимо повідомлення, якщо поля порожні
            return;
        }
        login(email, password); // Викликаємо функцію логіну
    };

    return (
<div className="relative w-screen h-screen bg-neutral-900 text-white overflow-hidden" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
    {/* Фонова картинка */}
    <div
        className="absolute bg-cover bg-no-repeat"
        style={{
            width: '615px',
            height: '820px',
            left: 'calc(100% - 620px)',
            top: '-50px',
            backgroundImage: 'url(/src/image/imageLogin.jpg)'
        }}
    />
    {/* Заголовок */}
    <h1
        className="absolute font-bold text-[60px] leading-[50px] text-left text-[#FDF8F8] drop-shadow"
        style={{
            width: '700px',
            left: '60px',
            top: '100px'
        }}
    >
        ReelTrack:<br />Персональний Трекер Переглядів
    </h1>

    {/* Опис */}
    <p
        className="absolute font-bold text-[24px] leading-[30px] text-left text-white"
        style={{
            width: '500px',
            left: '60px',
            top: '280px'
        }}
    >
        Відстежуйте свої улюблені фільми та серіали, отримуйте персоналізовані рекомендації та<br />
        діліться враженнями з друзями.<br />
        Приєднуйтесь вже сьогодні!
    </p>

    {/* Форма логіну */}
    <div
        className="absolute"
        style={{
            width: '300px',
            height: '305px',
            left: 'calc(100% - 450px)',
            top: '240px'
        }}
    >
        <h2 className="text-white text-[36px] font-bold mb-4 text-center">ВХІД</h2>
        <form onSubmit={handleSubmit} className="relative">
            {/* Поле email */}
            <div className="absolute w-full" style={{ top: '60px' }}>
                <input
                    type="email"
                    name="fake-email"
                    placeholder="Введіть email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="new-email"
                    className="w-full bg-transparent border-none outline-none text-white text-[14px] leading-8 z-2"
                    style={{ paddingBottom: '4px' }}
                    required
                />
                <div className="absolute border border-white w-full z-1" style={{ height: '0px', bottom: '0' }} />
            </div>

            {/* Поле пароль */}
            <div className="absolute w-full" style={{ top: '120px' }}>
                <input
                    type={showPassword ? "text" : "password"}
                    name="fake-password"
                    placeholder="Введіть пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full bg-transparent border-none outline-none text-white text-[14px] leading-8 z-2"
                    style={{ paddingBottom: '4px' }}
                    required
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="absolute cursor-pointer z-3"
                    style={{ right: '10px', top: '10px', width: '16px', height: '16px' }}
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5C7.305 4.5 3.14 7.415 1 12c2.14 4.585 6.305 7.5 11 7.5 4.695 0 8.86-2.915 11-7.5-2.14-4.585-6.305-7.5-11-7.5zm0 1.5c3.866 0 7 2.91 8.76 6-1.76 3.09-4.894 6-8.76 6-3.866 0-7-2.91-8.76-6 1.76-3.09 4.894-6 8.76-6zm-2 3.5a2 2 0 1 1 2 2m0-2v1.5"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5C7.305 4.5 3.14 7.415 1 12c2.14 4.585 6.305 7.5 11 7.5 4.695 0 8.86-2.915 11-7.5-2.14-4.585-6.305-7.5-11-7.5zm0 13c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z"
                        />
                    )}
                </svg>
                <div className="absolute border border-white w-full z-1" style={{ height: '0px', bottom: '0' }} />
            </div>

            {/* Кнопка входу */}
            <button
                type="submit"
                disabled={loading}
                className={`absolute bg-[#2C2C2C] border border-[#2C2C2C] rounded-lg text-white text-[14px] flex justify-center items-center ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                    width: '260px',
                    height: '36px',
                    left: '20px',
                    top: '200px',
                }}
            >
                {loading ? 'Вхід...' : 'УВІЙТИ'}
            </button>

            {/* АБО */}
            <p
                className="absolute text-center C-[14px] leading-6"
                style={{ 
                    top: '245px', 
                    left: '140px' , 
                    fontWeight: 'bold', 
                    textDecoration: 'none,'
                }}
            >
                АБО
            </p>

            {/* Кнопка реєстрації */}
            <Link
                to="/register"
                className="absolute bg-[#2C2C2C] border border-[#2C2C2C] rounded-lg text-white text-[14px] flex justify-center items-center"
                style={{
                    width: '260px',
                    height: '40px',
                    left: '20px',
                    top: '280px',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                }}
            >
                РЕЄСТРАЦІЯ
            </Link>
        </form>
    </div>
</div>
    );
}

export default LoginPage;