import { useState, useEffect } from "react";
import { fetchMovieDetails, fetchMovieTrailer, formatRuntime, IMG_BASE_URL, BACKDROP_SIZE } from "../../utils/api";
import "./Hero.css";

const Hero = ({ movies, onMovieClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [movieDetails, setMovieDetails] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const featured = movies ? movies.slice(0, 5) : [];
  const movie = featured[currentIndex];

  useEffect(() => {
    if (!movie) return;
    setMovieDetails(null);
    setTrailerKey(null);
    setShowTrailer(false);
    fetchMovieDetails(movie.id)
      .then((data) => setMovieDetails(data))
      .catch(() => setMovieDetails(null));
    fetchMovieTrailer(movie.id)
      .then((key) => setTrailerKey(key));
  }, [movie?.id]);

  if (!movies || movies.length === 0) return null;

  const handleNext = () => {
    setShowTrailer(false);
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = () => {
    setShowTrailer(false);
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handlePlay = () => {
    if (trailerKey) setShowTrailer(true);
  };

  const handleExitTrailer = () => {
    setShowTrailer(false);
  };

  const handleMoreInfo = () => {
    onMovieClick(movie.id);
  };

  const backdrop = movie.backdrop_path
    ? `${IMG_BASE_URL}/${BACKDROP_SIZE}${movie.backdrop_path}`
    : null;

  const formatHeroDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const mainGenre = movieDetails?.genres?.[0]?.name || null;
  const runtime = movieDetails?.runtime ? formatRuntime(movieDetails.runtime) : null;
  const releaseFormatted = formatHeroDate(movie.release_date);

  return (
    <section className="hero" style={!showTrailer && backdrop ? { backgroundImage: `url(${backdrop})` } : {}}>
      {showTrailer && trailerKey ? (
        <div className="hero-trailer-container">
          <iframe
            className="hero-trailer"
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
            title={`${movie.title} trailer`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <button className="hero-trailer-exit" onClick={handleExitTrailer}>
            ✕ Back
          </button>
        </div>
      ) : (
        <div className="hero-overlay">
          <button className="hero-arrow hero-arrow-left" onClick={handlePrev}>
            <span>‹</span>
          </button>
          <div className="hero-content" key={movie.id}>
            <span className="hero-label">Now Playing</span>
            <h1 className="hero-title">{movie.title}</h1>
            <div className="hero-meta">
              <span className="hero-rating">⭐ {movie.vote_average.toFixed(1)}</span>
              {mainGenre && <><span className="hero-dot">•</span><span className="hero-genre">{mainGenre}</span></>}
              {releaseFormatted && <><span className="hero-dot">•</span><span className="hero-date">{releaseFormatted}</span></>}
              {runtime && <><span className="hero-dot">•</span><span className="hero-runtime">{runtime}</span></>}
            </div>
            <p className="hero-overview">{movie.overview}</p>
            <div className="hero-buttons">
              <button className="hero-play-btn" onClick={handlePlay}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Play
              </button>
              <button className="hero-info-btn" onClick={handleMoreInfo}>
                More Info
              </button>
            </div>
            <span className="hero-indicator">{currentIndex + 1} / {featured.length}</span>
          </div>
          <button className="hero-arrow hero-arrow-right" onClick={handleNext}>
            <span>›</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default Hero;
