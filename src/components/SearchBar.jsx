const SearchBar = ({ value, onChange }) => (
    <div className="mb-8">
      <input
        type="text"
        placeholder="Пошук у бібліотеці..."
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>
  );
  
  export default SearchBar;
  