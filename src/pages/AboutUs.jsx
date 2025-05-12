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
      className="bg-gradient-to-b from-neutral-950 to-neutral-900 text-white min-h-screen p-8 md:p-16 lg:p-20 antialiased"
      style={{ fontFamily: "'Inter', sans-serif" }} /* Using Inter for a modern sans-serif look, assuming it's loaded globally or fallback */
    >
      <div className="max-w-7xl mx-auto">
        {/* ReelTrack Title with Gradient */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-16 md:mb-20 text-center tracking-tighter leading-none">
          <span className="bg-gradient-to-r from-blue-50 text bg-clip-text">
            ReelTrack
          </span>
        </h1>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 mb-16">
          {/* Feature 1: Innovations */}
          <div className="relative p-6 from-neutral-950 to-neutral-900 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
            <div className="absolute top-0 left-0 w-1 h-full bg-white rounded-l-lg"></div> {/* Left border */}
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              ІННОВАЦІЇ У ВІДСТЕЖЕННІ
            </h2>
            <p className="text-white leading-relaxed text-lg">
              ReelTrack – це інноваційна платформа для обліку переглянутих фільмів
              та серіалів. Ми надаємо зручний інструмент для організації вашого
              кіно- та телевізійного досвіду з інтеграцією з 20+ стрімінговими
              платформами.
            </p>
          </div>

          {/* Feature 2: Personalized Recommendations */}
          <div className="relative p-6 bg-neutral-950 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
            <div className="absolute top-0 left-0 w-1 h-full bg-white rounded-l-lg"></div> {/* Left border with different color */}
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text--400">
               ВАШ ІДЕАЛЬНИЙ КІНО-ВЕЧІР ЧЕКАЄ 
            </h2>
            <p className="text-white leading-relaxed text-lg">
              Забудьте про випадковий вибір і невдалі фільми! 
              Наша система ретельно аналізує ваші перегляди та вподобання, щоб щоразу допомагати вам знаходити саме те, 
              що подарує справжнє задоволення та зробить ваш кіно-вечір ідеальним. 
            </p>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="text-center mt-16 md:mt-20 lg:mt-24">
          <button
            onClick={handleNavigation}
            className="bg-gradient-to-r from-gray-500 to-gray-500 hover:from-gray-600 hover:to-gray-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Долучайтесь до нас!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;