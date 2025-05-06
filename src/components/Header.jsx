import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AddDropdown from './AddDropdown';

function Header() {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => logout();
  const handleAccountClick = () => {
    setMenuOpen(false);
    navigate('/profile');
  };
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Навігація
  const goToHome = () => navigate('/');
  const goToFriends = () => navigate('/friends');
  const goToAbout = () => navigate('/about');

  return (
    <header className="fixed top-0 left-0 w-full bg-[#171717] h-[64px] z-[1000] px-6 shadow-md">
      <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between">
        {/* Логотип */}
        <h1 className="text-2xl font-bold text-white">ReelTrack</h1>

        {/* Навігація */}
        <nav className="flex items-center gap-8">
          <div
            className="cursor-pointer font-['IBM Plex Mono'] font-bold text-white hover:text-gray-300"
            onClick={goToHome}
          >
            Головна
          </div>
          <div
            className="cursor-pointer font-['IBM Plex Mono'] font-bold text-white hover:text-gray-300"
            onClick={goToFriends}
          >
            Друзі
          </div>
          <div
            className="cursor-pointer font-['IBM Plex Mono'] font-bold text-white hover:text-gray-300"
            onClick={goToAbout}
          >
            Про нас
          </div>
        </nav>

        {/* Додати контент + Меню користувача */}
        <div className="relative flex items-center gap-4" ref={menuRef}>
          <AddDropdown />

          <button
            onClick={toggleMenu}
            className="text-white text-3xl focus:outline-none"
            title="Меню"
          >
            <FaUserCircle />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[64px] w-40 bg-[#333] rounded shadow-lg z-50 flex flex-col">
              <button
                className="w-full text-left px-4 py-2 text-white hover:bg-[#444]"
                onClick={handleAccountClick}
              >
                Мій акаунт
              </button>
              <button
                className="w-full text-left px-4 py-2 text-white hover:bg-[#444]"
                onClick={handleLogout}
              >
                Вийти
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
