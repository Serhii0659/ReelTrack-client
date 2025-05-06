const SeriesCard = ({ series }) => (
    <div className="bg-white text-black rounded shadow p-4">
      <img src={series.poster} alt={series.title} className="rounded mb-3 w-full h-auto" />
      <h3 className="text-lg font-bold">{series.title} ({series.year})</h3>
      <p className="text-sm text-gray-600">{series.description}</p>
    </div>
  );
  
  export default SeriesCard;
  