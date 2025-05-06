const MovieCard = ({ movie }) => (
    <div className="bg-white text-black rounded shadow p-4">
      <img src={movie.poster} alt={movie.title} className="rounded mb-3 w-full h-auto" />
      <h3 className="text-lg font-bold">{movie.title} ({movie.year})</h3>
      <p className="text-sm text-gray-600">{movie.description}</p>
    </div>
  );
  
  export default MovieCard;
  