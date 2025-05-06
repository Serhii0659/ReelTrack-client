import React, { useState } from 'react';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import ReviewItem from '../components/ReviewItem';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';

const MyLibraryPage = ({
  movies = [],
  series = [],
  reviews = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSeries = series.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#171717] min-h-screen text-white">
      <Header />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-6">Моя бібліотека</h1>

        {/* Пошук */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Фільми */}
        {filteredMovies.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">📁 Бібліотека фільмів</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* Серіали */}
        {filteredSeries.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">📺 Бібліотека серіалів</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSeries.map((item) => (
                <SeriesCard key={item.id} series={item} />
              ))}
            </div>
          </section>
        )}

        {/* Відгуки */}
        {reviews.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">📝 Список відгуків</h2>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))}
            </div>
          </section>
        )}

        {/* Порожня бібліотека */}
        {filteredMovies.length === 0 &&
          filteredSeries.length === 0 &&
          reviews.length === 0 && (
            <p className="text-gray-400">
              Нічого не знайдено за запитом. Спробуйте інший пошук або додайте
              контент до бібліотеки.
            </p>
        )}
      </div>
    </div>
  );
};

export default MyLibraryPage;
