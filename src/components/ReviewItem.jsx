const ReviewItem = ({ review }) => (
    <div className="bg-gray-800 p-4 rounded shadow">
      <h3 className="font-bold text-lg">{review.title}</h3>
      <p className="text-gray-300">
        Оцінка: <span className="text-yellow-400">{review.rating}/10</span>
      </p>
      <p className="text-gray-400">{review.comment}</p>
    </div>
  );
  
  export default ReviewItem;
  