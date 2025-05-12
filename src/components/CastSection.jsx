const CastSection = ({ cast }) => {
    if (!cast || cast.length === 0) return null;

    const displayedCast = cast.slice(0, 10);

    return (
        <div>
            <h3 className="text-2xl font-bold text-white mb-4">Акторський склад</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayedCast.map(actor => (
                    <div key={actor.id} className="flex flex-col items-center text-center bg-[#171717] rounded-lg p-3 shadow-md">
                        <img
                            src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/100x150?text=No+Image'}
                            alt={actor.name}
                            className="w-24 h-24 object-cover rounded-full mb-2 border border-gray-700"
                        />
                        <p className="text-sm font-semibold text-white truncate w-full">{actor.name}</p>
                        <p className="text-xs text-gray-400 truncate w-full">{actor.character}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CastSection;