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
                    width: '934px',
                    height: '1201px',
                    left: '1050px',
                    top: '-208px',
                    backgroundImage: 'url(/src/image/imageLogin.jpg)' // Шлях до зображення
                }}
            />
            {/* Заголовок сторінки */}
            <h1
                className="absolute font-bold text-[64px] leading-[64px] text-left text-[#FDF8F8] drop-shadow"
                style={{
                    width: '924px',
                    left: '100px',
                    top: '145px'
                }}
            >
                ReelTrack:<br />Персональний Трекер Переглядів
            </h1>
            {/* Опис сторінки */}
            <p
                className="absolute font-bold text-[24px] leading-[36px] text-left text-white"
                style={{
                    width: '924px',
                    left: '100px',
                    top: '408px'
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
                    width: '343px',
                    height: '305px',
                    left: '1280px',
                    top: '310px'
                }}
            >
                <h2 className="text-white text-[24px] font-bold mb-6 text-center">ВХІД</h2>
                <form onSubmit={handleSubmit} className="relative">
                    {/* Поле вводу для логіну */}
                    <div className="absolute w-[343px]" style={{ top: '80px', left: '0' }}>
                        <input
                            type="email"
                            name="fake-email" 
                            placeholder="Введіть email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            autoComplete="new-email" 
                            className="w-full bg-transparent border-none outline-none text-white text-[16px] leading-8 z-2"
                            style={{ paddingBottom: '5px' }}
                            required
                        />
                        {/* Лінія під полем вводу */}
                        <div className="absolute border border-white w-[343px] z-1" style={{ height: '0px', bottom: '0', left: '0' }} />
                    </div>

                    {/* Поле вводу для пароля */}
                    <div className="absolute w-[343px]" style={{ top: '150px', left: '0' }}>
                         <input
                            type={showPassword ? "text" : "password"} // Залежно від стану відображаємо пароль або приховуємо
                            name="fake-password" // Нестандартне ім'я для уникнення автозаповнення
                            placeholder="Введіть пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} // Оновлення state password
                            autoComplete="new-password" // Вимкнення автозаповнення
                            className="w-full bg-transparent border-none outline-none text-white text-[16px] leading-8 z-2"
                            style={{ paddingBottom: '5px' }}
                            required
                        />
                        {/* Іконка для показу/приховування пароля */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none" // Видаляємо білий фон
                            stroke="white" // Робимо штрих білим
                            strokeWidth="2" // Задаємо товщину ліній
                            viewBox="0 0 24 24" // Розмір контейнера SVG
                            className="absolute cursor-pointer z-3"
                            style={{ right: '10px', top: '10px', width: '16px', height: '16px' }} // Змінено розмір на 16px
                            onClick={() => setShowPassword(!showPassword)} // Перемикаємо стан відображення пароля
                        >
                            {showPassword ? (
                                // Іконка для прихованого пароля (закреслене око)
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5C7.305 4.5 3.14 7.415 1 12c2.14 4.585 6.305 7.5 11 7.5 4.695 0 8.86-2.915 11-7.5-2.14-4.585-6.305-7.5-11-7.5zm0 1.5c3.866 0 7 2.91 8.76 6-1.76 3.09-4.894 6-8.76 6-3.866 0-7-2.91-8.76-6 1.76-3.09 4.894-6 8.76-6zm-2 3.5a2 2 0 1 1 2 2m0-2v1.5"
                                />
                            ) : (
                                // Іконка для відображення пароля (відкрите око)
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5C7.305 4.5 3.14 7.415 1 12c2.14 4.585 6.305 7.5 11 7.5 4.695 0 8.86-2.915 11-7.5-2.14-4.585-6.305-7.5-11-7.5zm0 13c-3.866 0-7-3.134-7-7s3.134-7 7-7 7 3.134 7 7-3.134 7-7 7z"
                                />
                            )}
                        </svg>
                        {/* Лінія під полем вводу */}
                        <div className="absolute border border-white w-[343px] z-1" style={{ height: '0px', bottom: '0', left: '0' }} />
                    </div>

{/* Кнопка для входу */}
<button
    type="submit"
    disabled={loading} // Блокуємо кнопку під час запиту
    className={`absolute bg-[#2C2C2C] border border-[#2C2C2C] rounded-lg text-white text-[16px] flex justify-center items-center ${
        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`}
    style={{
        width: '300px',
        height: '39px',
        left: '10px',
        top: '296px',
        textDecoration: 'none',
    }}
>
    {loading ? 'Вхід...' : 'УВІЙТИ'}
</button>

{/* Текст "АБО" між кнопками */}
<p
    className="absolute text-center font-bold text-[16px] leading-8"
    style={{ top: '346px', left: '150px' }}
>
    АБО
</p>

{/* Кнопка для переходу на сторінку реєстрації */}
<div
    className="absolute bg-[#1A1A1A] border-none rounded-lg text-white text-[16px] flex justify-center items-center shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer"
    style={{
        width: '300px',
        height: '49px',
        left: '10px',
        top: '396px',
    }}
>
    <Link
        to="/register"
        style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
        }}
    >
        РЕЄСТРАЦІЯ
    </Link>
</div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;