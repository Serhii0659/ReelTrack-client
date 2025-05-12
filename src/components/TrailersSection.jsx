import React from 'react';

const TrailersSection = ({ trailers }) => {
    if (!trailers || trailers.length === 0) {
        return null; // Не рендеримо компонент, якщо немає трейлерів
    }

    // Обмежуємо кількість відображуваних трейлерів, наприклад, до 2
    const displayedTrailers = trailers.slice(0, 2);

    return (
        <div>
            <h3 className="text-2xl font-bold text-white mb-4">Трейлери</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedTrailers.map(trailer => (
                    <div key={trailer.key} className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-md">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${trailer.key}`}
                            title={trailer.name}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrailersSection;