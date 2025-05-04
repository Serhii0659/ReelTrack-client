import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, loading } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            alert('Будь ласка, заповніть усі поля');
            return;
        }
        register(name, email, password);
    };

    return (
        <div
            className="w-screen h-screen bg-cover bg-center relative flex items-center justify-center"
            style={{
                backgroundImage: "url('/src/image/imageLogin.jpg')",
                fontFamily: "'IBM Plex Mono', monospace"
            }}
        >
            {/* Півпрозорий шар + розмиття */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />

            {/* Контент */}
            <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-white px-6">
                {/* Форма */}
                <div className="w-[343px] bg-black/40 p-6 rounded-xl shadow-xl">
                    <h2 className="text-white text-[40px] font-semibold mb-6 text-center tracking-wide">РЕЄСТРАЦІЯ</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <input
                                type="text"
                                placeholder="Введіть ім'я"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                className="w-full bg-transparent border-b border-white text-white placeholder-white focus:outline-none pb-2"
                                required
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                placeholder="Введіть email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                className="w-full bg-transparent border-b border-white text-white placeholder-white focus:outline-none pb-2"
                                required
                            />
                        </div>
                        {/* Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Створіть пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                className="w-full bg-transparent border-b border-white text-white placeholder-white focus:outline-none pb-2 pr-6"
                                required
                                minLength="6"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                className="absolute top-2 right-2 w-5 h-5 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.585 10.585A3.001 3.001 0 0112 9a3 3 0 013 3c0 .445-.097.867-.27 1.245m-1.443 1.443A3 3 0 0112 15a3 3 0 01-2.415-1.255" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5c-4.695 0-8.86 2.915-11 7.5 2.14 4.585 6.305 7.5 11 7.5 4.695 0 8.86-2.915 11-7.5-2.14-4.585-6.305-7.5-11-7.5zm0 10.5a3 3 0 100-6 3 3 0 000 6z" />
                                )}
                            </svg>
                        </div>

                        {/* Зареєструватись button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute bg-[#1A1A1A] border-none rounded-lg text-white text-[16px] flex justify-center items-center shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer"
                            style={{
                                width: '300px',
                                height: '49px',
                                top: '260px',
                            }}
                        >
                            {loading ? 'Реєстрація...' : 'Зареєструватись'}
                        </button>

                    </form>
                </div>

                {/* Блок для входу */}
                <div className="mt-6 flex flex-col items-center">
                    <h3
                        className="font-bold text-[20px] leading-8 text-white mb-2"
                        style={{
                            position: 'relative',
                            top: '50px',  // Зміщено вниз
                        }}
                    >
                        Вже маєте акаунт?
                    </h3>
                    <Link
                        to="/login"
                        className="absolute bg-[#1A1A1A] border-none rounded-lg text-white text-[16px] flex justify-center items-center shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer"
                        style={{
                            width: '300px',
                            height: '49px',
                            top: '400px',  // Розташовано нижче кнопки "Зареєструватись"
                        }}
                    >
                        Увійти
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;