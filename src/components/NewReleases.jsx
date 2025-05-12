import { useState, useEffect } from 'react';
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
            } catch {
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
            <h2 className="text-white font-bold text-[20px] mb-4">Новинки</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {newReleases.length > 0 ? (
                    newReleases.map((content) => (
                        <Link
                            to={`/content/${content.media_type || 'movie'}/${content.id}`}
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
                    <p className="text-gray-400">Наразі немає нових релізів для відображення.</p>
                )}
            </div>
        </div>
    );
};

export default NewReleases;
