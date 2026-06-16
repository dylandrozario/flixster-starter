import { useState, useEffect } from "react";
import "./Header.css";

const Header = ({ onSearch, onClear, isSearchMode, onOpenSidebar }) => {
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
        <span className="header-logo" onClick={handleHome}>FLIXSTER</span>
        <form className="header-search header-search-desktop" onSubmit={handleSubmit}>
          <div className="search-input-wrapper">
            <button type="submit" className="search-submit" aria-label="Search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search movies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {input && (
              <button type="button" className="search-clear" onClick={handleHome} aria-label="Clear search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </form>
        <div className="header-right">
          <button
            className="mobile-search-toggle"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className="header-sidebar-btn" onClick={onOpenSidebar} aria-label="Open my lists">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
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
