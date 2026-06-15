import "./MovieCard.css";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const MovieCard = ({ movie, onClick }) => {
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
              src={`${POSTER_BASE_URL}${movie.poster_path}`}
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
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
