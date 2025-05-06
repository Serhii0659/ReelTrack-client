import React from "react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    // Перенаправляє на сторінку логіна
    navigate("/login");
  };

  return (
    <div 
      className="bg-neutral-900 text-white min-h-screen p-10"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-16 text-center tracking-tighter">
          ReelTrack
        </h1>

        <div className="grid md:grid-cols-2 gap-16 mb-12">
          <div className="border-l-4 border-blue-600 pl-4">
            <h2 className="text-2xl font-bold mb-4">ІННОВАЦІЇ У ВІДСТЕЖЕННІ</h2>
            <p className="text-gray-300 leading-relaxed">
              ReelTrack – це інноваційна платформа для обліку переглянутих фільмів 
              та серіалів. Ми надаємо зручний інструмент для організації вашого 
              кіно- та телевізійного досвіду з інтеграцією з 20+ стрімінговими 
              платформами.
            </p>
          </div>

          <div className="border-l-4 border-blue-600 pl-4">
            <h2 className="text-2xl font-bold mb-4">ПЕРСОНАЛІЗОВАНІ РЕКОМЕНДАЦІЇ</h2>
            <p className="text-gray-300 leading-relaxed">
              Наш алгоритм на основі ШІ аналізує ваші вподобання та пропонує 
              персоналізовані підбірки. Понад 50,000 користувачів вже довірили 
              нам свій кіно-досвід.
            </p>
          </div>
        </div>

        <div className="text-center mt-20">
          <button
            onClick={handleNavigation}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
          >
            ПОЧАТИ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;