import React, { useState, useEffect } from 'react';
import { getNewReleases } from '../api/content';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const NewReleases = () => {
    const [newReleases, setNewReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewReleasesData = async () => {
            try {
                setLoading(true);
                setError(null);
                const results = await getNewReleases(1);
                setNewReleases(results);
            } catch (err) {
                console.error("Помилка при отриманні нових релізів:", err);
                setError('Не вдалося завантажити нові релізи. Спробуйте пізніше.');
                setNewReleases([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNewReleasesData();
    }, []);

    if (loading) {
        return (
            <div className="bg-[#171717] rounded-[8px] p-4 shadow-md w-full max-w-[600px] ml-8 flex justify-center items-center h-[240px]">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#171717] rounded-[8px] p-4 shadow-md w-full max-w-[600px] ml-8 flex justify-center items-center h-[240px] text-red-500">
                Помилка: {error}
            </div>
        );
    }

    return (
        <div className="bg-[#171717] rounded-[8px] p-4 shadow-md w-full max-w-[600px] ml-8">
            <h2 className="text-white font-bold text-[20px] mb-4">Новинки</h2>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {newReleases.length > 0 ? (
                    newReleases.map((content) => (
                        <Link
                            // ОНОВЛЕНО ТУТ: використовуємо content.media_type і додаємо запасне значення 'movie'
                            to={`/content/${content.media_type || 'movie'}/${content.id}`}
                            key={content.id}
                            className="flex-shrink-0"
                        >
                            <div className="w-[100px] h-[175px] bg-gray-800 rounded-lg overflow-hidden shadow-lg">
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
                            <p className="text-white text-xs mt-1 text-center truncate w-[100px]">
                                {content.title || content.name}
                            </p>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-400">Наразі немає нових релізів для відображення.</p>
                )}
            </div>
        </div>
    );
};

export default NewReleases;
