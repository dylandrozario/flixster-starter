import MovieCard from "../MovieCard/MovieCard";
import "./MovieList.css";

const MovieList = ({ movies, onMovieClick, onLoadMore, hasMore, isLoading, error, onRetry, isSearchMode, searchQuery, sortBy, onSortChange, page, totalPages, hearted, starred, watched, onToggleHeart, onToggleStar, onToggleWatched }) => {
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

  const sectionTitle = isSearchMode ? `Results for "${searchQuery}"` : "Upcoming Movies";

  return (
    <div className="movie-list-container">
      <div className="movie-list-header">
        <h2 className="movie-list-title">{sectionTitle}</h2>
        <div className="movie-list-controls">
          <select
            className="movie-list-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="">All</option>
            <option value="title">Title (A-Z)</option>
            <option value="rating">Rating</option>
            <option value="release_date">Release Date</option>
          </select>
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
