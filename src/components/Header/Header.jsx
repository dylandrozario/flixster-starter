import { useState, useEffect } from "react";
import "./Header.css";

const Header = ({ onSearch, onClear, isSearchMode }) => {
  const [input, setInput] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
    setMobileSearchOpen(false);
  };

  const handleHome = () => {
    setInput("");
    setMobileSearchOpen(false);
    onClear();
  };

  return (
    <>
      <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
        <div className="header-left">
          <span className="header-logo">FLIXSTER</span>
          <nav className="header-nav">
            <button className="nav-link" onClick={handleHome}>Home</button>
            <span className="nav-link">Movies</span>
          </nav>
        </div>
        <div className="header-right">
          <form className="header-search header-search-desktop" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search movies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <button
            className="mobile-search-toggle"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {isSearchMode && (
            <button className="header-clear-btn" onClick={handleHome}>
              Now Playing
            </button>
          )}
        </div>
      </header>
      {mobileSearchOpen && (
        <div className="mobile-search-drawer">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search movies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button type="submit">Search</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;
