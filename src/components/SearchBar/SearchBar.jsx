import { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({ onSearch, onClear, isSearchMode }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    onSearch(trimmed);
  };

  const handleClear = () => {
    setInput("");
    onClear();
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search movies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      {isSearchMode && (
        <button className="clear-btn" onClick={handleClear}>
          Now Playing
        </button>
      )}
    </div>
  );
};

export default SearchBar;
