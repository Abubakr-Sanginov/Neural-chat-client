import { Search, X } from "lucide-react";
import { useState } from "react";

const SearchBar = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (value) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <div className="relative mb-4">
      <Search
        size={18}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder="Search in chat..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="bg-[#1A232E] pl-10 pr-10 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
