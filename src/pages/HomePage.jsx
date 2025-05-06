import React from 'react';
import Header from '../components/Header';
import NowWatching from '../components/NowWatching';
import NewReleases from '../components/NewReleases';
import ReviewTabs from '../components/ReviewTabs';
import SocialFeed from '../components/SocialFeed';
import RatingPieChart from '../components/RatingPieChart';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  const contentStats = [
    { name: 'Фільми', value: 12 },
    { name: 'Серіали', value: 8 },
    { name: 'Мультфільми', value: 5 },
  ];

  return (
    <div className="bg-[#171717] min-h-screen flex flex-col">
      <Header />

      {/* Основний контент */}
      <main className="flex-grow p-4 pt-[72px]">
        <div className="max-w-screen-xl mx-auto">
          {/* Заголовок сторінки */}
          <h1 className="text-white font-bold text-[48px] text-center mb-8">
            Твій особистий світ кіно
          </h1>

          {/* Контейнер для сітки 2x1 з компонентами */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid-item">
              <NewReleases />
            </div>
            <div className="grid-item">
              <NowWatching />
            </div>
          </div>

          {/* Відгуки та Соціальна стрічка з горизонтальним відступом */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-60 gap-y-4 mt-6">
            <div className="grid-item">
              <ReviewTabs />
            </div>
            <div className="grid-item">  
              <SocialFeed />
            </div>
          </div>

          {/* Пай-чарт по центру */}
          <div className="flex justify-center mt-8">
            <RatingPieChart data={contentStats} />
          </div>
        </div> {/* ← Цей div був незакритий */}
      </main>
    </div>
  );
};

export default HomePage;
