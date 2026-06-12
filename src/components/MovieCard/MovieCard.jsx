import "./MovieCard.css";

const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

const MovieCard = ({ movie, onClick }) => {
  const hasPoster = movie.poster_path !== null;

  const handleClick = () => {
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
  );
};

export default MovieCard;
