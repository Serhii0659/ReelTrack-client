import React, { useState, useEffect } from 'react';
import { getTrendingContent } from '../api/content';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const NowWatching = () => {
    const [trendingContent, setTrendingContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrendingData = async () => {
            try {
                setLoading(true);
                setError(null);
                const results = await getTrendingContent('all', 'day', 1);
                const filteredResults = results.filter(
                    item => item.media_type === 'movie' || item.media_type === 'tv'
                );
                setTrendingContent(filteredResults);
            } catch {
                setError('Не вдалося завантажити популярний контент. Спробуйте пізніше.');
                setTrendingContent([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingData();
    }, []);

    if (loading) {
        return (
            <div className="bg-[#171717] rounded-[8px] p-4 shadow-md w-full max-w-[600px] flex justify-center items-center h-[240px]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#171717] rounded-[8px] p-4 shadow-md w-full max-w-[600px] flex justify-center items-center h-[240px] text-red-500">
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] rounded-[8px] p-4 shadow-md w-full max-w-[600px]">
            <h2 className="text-white font-bold text-[20px] mb-4">Зараз дивляться</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {trendingContent.length > 0 ? (
                    trendingContent.map((content) => (
                        <Link
                            to={`/content/${content.media_type}/${content.id}`}
                            key={content.id}
                            className="relative w-[150px] h-[200px] bg-[#272727] rounded-[10px] flex-shrink-0 overflow-hidden shadow-lg hover:scale-105 transition-transform duration-200 ease-in-out flex flex-col"
                        >
                            <div className="w-full h-[200px] bg-gray-700 flex items-center justify-center overflow-hidden">
                                {content.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w300${content.poster_path}`}
                                        alt={content.title || content.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                        Без постера
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-400">Наразі немає трендового контенту для відображення.</p>
                )}
            </div>
        </div>
    );
};

export default NowWatching;