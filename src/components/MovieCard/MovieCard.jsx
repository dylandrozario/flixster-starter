import { formatDate, IMG_BASE_URL, POSTER_SIZE } from "../../utils/api";
import "./MovieCard.css";

const MovieCard = ({ movie, onClick, isHearted, isStarred, isWatched, onToggleHeart, onToggleStar, onToggleWatched }) => {
  const hasPoster = movie.poster_path !== null;

  const handleClick = (e) => {
    e.currentTarget.blur();
    onClick(movie.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(movie.id);
    }
  };

  const handleHeart = (e) => {
    e.stopPropagation();
    onToggleHeart(movie.id);
  };

  const handleStar = (e) => {
    e.stopPropagation();
    onToggleStar(movie.id);
  };

  const handleWatched = (e) => {
    e.stopPropagation();
    onToggleWatched(movie.id);
  };

  return (
    <div
      className="movie-card"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="movie-card-inner">
        <div className="movie-card-front">
          {hasPoster ? (
            <img
              className="movie-card-poster"
              src={`${IMG_BASE_URL}/${POSTER_SIZE}${movie.poster_path}`}
              alt={`${movie.title} poster`}
            />
          ) : (
            <div className="movie-card-placeholder">
              <span className="movie-card-placeholder-text">{movie.title}</span>
            </div>
          )}
          <div className="movie-card-info">
            <h3 className="movie-card-title">{movie.title}</h3>
            <span className="movie-card-rating">⭐ {movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
        <div className="movie-card-back">
          <h3 className="movie-card-back-title">{movie.title}</h3>
          <div className="movie-card-back-meta">
            <span className="movie-card-back-rating">⭐ {movie.vote_average.toFixed(1)}</span>
            <span className="movie-card-back-date">{formatDate(movie.release_date)}</span>
          </div>
          <p className="movie-card-back-overview">
            {movie.overview
              ? movie.overview.length > 150
                ? movie.overview.slice(0, 150) + "..."
                : movie.overview
              : "No description available."}
          </p>
          <div className="movie-card-back-actions">
            <button
              className={`card-action-btn ${isHearted ? "card-action-btn-active" : ""}`}
              onClick={handleHeart}
              aria-label={isHearted ? "Remove heart" : "Heart this movie"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isHearted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              className={`card-action-btn ${isStarred ? "card-action-btn-star" : ""}`}
              onClick={handleStar}
              aria-label={isStarred ? "Remove star" : "Star this movie"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
            <button
              className={`card-action-btn ${isWatched ? "card-action-btn-watched" : ""}`}
              onClick={handleWatched}
              aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
