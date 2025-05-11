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
                setTrendingContent(results);
            } catch (err) {
                console.error("Помилка при отриманні трендового контенту:", err);
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
            <div className="bg-[#171717] rounded-lg p-4 shadow-md w-full max-w-[600px] mr-8 flex justify-center items-center h-[240px]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#171717] rounded-lg p-4 shadow-md w-full max-w-[600px] mr-8 flex justify-center items-center h-[240px] text-red-500">
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] rounded-lg p-4 shadow-md w-full max-w-[600px] mr-8">
            <h2 className="text-white font-bold text-[20px] mb-4">Зараз дивляться (Трендове)</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {trendingContent.length > 0 ? (
                    trendingContent.map((content) => (
                        <Link 
                            to={`/${content.media_type}/${content.id}`} 
                            key={content.id} 
                            className="flex-shrink-0"
                        >
                            <div className="w-24 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                {content.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${content.poster_path}`}
                                        alt={content.title || content.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                        Без постера
                                    </div>
                                )}
                            </div>
                            <p className="text-white text-xs mt-1 text-center truncate w-24">
                                {content.title || content.name}
                            </p>
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
