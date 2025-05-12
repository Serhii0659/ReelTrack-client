import React, { useState, useEffect, useRef } from 'react';
import { searchContent } from '../api/content'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ placeholder = "Пошук фільмів або серіалів..." }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await searchContent(query);
                setResults(data);
            } catch {
                setError('Не вдалося виконати пошук контенту.');
                toast.error('Не вдалося виконати пошук контенту.');
            } finally {
                setLoading(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleResultClick = (mediaType, tmdbId) => {
        setQuery('');
        setResults([]);
        navigate(`/content/${mediaType}/${tmdbId}`);
    };

    return (
        <div className="relative w-full md:max-w-md mx-auto" ref={searchRef}>
            <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#222222] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            {loading && query.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg p-2 text-center text-gray-400 z-20">
                    Пошук...
                </div>
            )}
            {error && query.length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-red-900 border border-red-700 rounded-lg shadow-lg p-2 text-center text-red-300 z-20">
                    {error}
                </div>
            )}
            {results.length > 0 && (
                <ul className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto z-20">
                    {results.map((item) => (
                        <li 
                            key={item.id}
                            className="flex items-center p-3 hover:bg-[#2a2a2a] cursor-pointer border-b border-gray-800 last:border-b-0"
                            onClick={() => handleResultClick(item.media_type, item.id)}
                        >
                            {item.poster_path ? (
                                <img 
                                    src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                    alt={item.title || item.name}
                                    className="w-12 h-16 object-cover rounded-sm mr-3"
                                />
                            ) : (
                                <div className="w-12 h-16 bg-gray-700 flex items-center justify-center text-gray-400 text-xl rounded-sm mr-3">
                                    🎬
                                </div>
                            )}
                            <div>
                                <span className="text-white font-medium">
                                    {item.title || item.name}
                                </span>
                                <p className="text-gray-400 text-sm capitalize">
                                    {item.media_type === 'movie' ? 'Фільм' : 'Серіал'}
                                    {(item.release_date || item.first_air_date) && (
                                        ` (${(item.release_date || item.first_air_date).substring(0, 4)})`
                                    )}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {query.length >= 2 && !loading && !error && results.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg p-2 text-center text-gray-400 z-20">
                    Контенту не знайдено.
                </div>
            )}
        </div>
    );
};

export default SearchBar;