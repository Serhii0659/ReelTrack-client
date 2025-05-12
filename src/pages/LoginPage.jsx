import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Будь ласка, заповніть усі поля');
            return;
        }
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Помилка входу');
        }
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: "url('/imageLogin.png')",
                fontFamily: "'IBM Plex Mono', monospace"
            }}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />
            <div className="relative z-10 w-full flex flex-col items-center px-4">
                <div className="w-full max-w-md bg-black/40 p-8 rounded-xl shadow-xl mt-12 mb-8">
                    <h2 className="text-white text-3xl md:text-4xl font-semibold mb-8 text-center tracking-wide">ВХІД</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Введіть пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
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
                        {error && (
                            <div className="text-red-400 text-center text-sm">{error}</div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2C2C2C] border-none rounded-lg text-white text-[16px] flex justify-center items-center shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer py-3 mt-2"
                        >
                            {loading ? 'Вхід...' : 'Увійти'}
                        </button>
                    </form>
                </div>
                <div className="w-full max-w-md flex flex-col items-center">
                    <h3 className="text-[14px] leading-8 text-white mb-2 font-bold">
                        Не маєте акаунту?
                    </h3>
                    <Link
                        to="/register"
                        className="w-full bg-[#2C2C2C] border-none rounded-lg text-white text-[16px] flex justify-center items-center shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer py-3"
                    >
                        Зареєструватись
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;