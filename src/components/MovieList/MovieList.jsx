import { useState, useRef, useEffect } from "react";
import MovieCard from "../MovieCard/MovieCard";
import "./MovieList.css";

const MovieList = ({ movies, onMovieClick, onLoadMore, hasMore, isLoading, error, onRetry, isSearchMode, searchQuery, sortBy, onSortChange, page, totalPages, hearted, starred, watched, onToggleHeart, onToggleStar, onToggleWatched }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (error && movies.length === 0) {
    return (
      <div className="movie-list-error">
        <p>{error}</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }

  if (isLoading && movies.length === 0) {
    return (
      <div className="movie-list-loading">
        <p>Loading movies...</p>
      </div>
    );
  }

  if (!isLoading && movies.length === 0 && isSearchMode) {
    return (
      <div className="movie-list-empty">
        <p>No movies found for "{searchQuery}"</p>
      </div>
    );
  }

  const getSectionTitle = () => {
    if (isSearchMode) return `Results for "${searchQuery}"`;
    switch (sortBy) {
      case "title": return "Movies A-Z";
      case "rating": return "Top Rated";
      case "release_date": return "Latest Releases";
      default: return "Upcoming Movies";
    }
  };

  const sectionTitle = getSectionTitle();

  return (
    <div className="movie-list-container">
      <div className="movie-list-header">
        <h2 className="movie-list-title">{sectionTitle}</h2>
        <div className="movie-list-controls">
          <div className="sort-dropdown" ref={dropdownRef}>
            <button className={`sort-dropdown-trigger ${dropdownOpen ? "trigger-active" : ""}`} onClick={() => setDropdownOpen(!dropdownOpen)}>
              {sortBy === "title" ? "Title (A-Z)" : sortBy === "rating" ? "Rating" : sortBy === "release_date" ? "Release Date" : "Sort By"}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <div className={`sort-dropdown-menu ${dropdownOpen ? "sort-dropdown-open" : ""}`}>
              <button className={`sort-dropdown-item ${sortBy === "" ? "active" : ""}`} onClick={() => { onSortChange(""); setDropdownOpen(false); }}>All</button>
              <button className={`sort-dropdown-item ${sortBy === "title" ? "active" : ""}`} onClick={() => { onSortChange("title"); setDropdownOpen(false); }}>Title (A-Z)</button>
              <button className={`sort-dropdown-item ${sortBy === "rating" ? "active" : ""}`} onClick={() => { onSortChange("rating"); setDropdownOpen(false); }}>Rating</button>
              <button className={`sort-dropdown-item ${sortBy === "release_date" ? "active" : ""}`} onClick={() => { onSortChange("release_date"); setDropdownOpen(false); }}>Release Date</button>
            </div>
          </div>
        </div>
      </div>
      <div className="movie-list-grid">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={onMovieClick}
            isHearted={hearted.has(movie.id)}
            isStarred={starred.has(movie.id)}
            isWatched={watched.has(movie.id)}
            onToggleHeart={onToggleHeart}
            onToggleStar={onToggleStar}
            onToggleWatched={onToggleWatched}
          />
        ))}
      </div>
      <div className="movie-list-footer">
        <span className="page-indicator">Page {page} of {totalPages}</span>
        {hasMore && (
          <button
            className="load-more-btn"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieList;
