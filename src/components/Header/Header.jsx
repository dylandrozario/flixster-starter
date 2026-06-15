import { useState, useEffect } from "react";
import "./Header.css";

const Header = ({ onSearch, onClear, isSearchMode }) => {
  const [input, setInput] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.querySelector(".hero");
      if (heroEl) {
        setScrolled(window.scrollY > heroEl.offsetHeight - 60);
      } else {
        setScrolled(true);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    onSearch(trimmed);
  };

  const handleHome = () => {
    setInput("");
    onClear();
  };

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="header-left">
        <span className="header-logo">FLIXSTER</span>
        <nav className="header-nav">
          <button className="nav-link" onClick={handleHome}>Home</button>
          <span className="nav-link">Movies</span>
        </nav>
      </div>
      <div className="header-right">
        <form className="header-search" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search movies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {isSearchMode && (
          <button className="header-clear-btn" onClick={handleHome}>
            Now Playing
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
