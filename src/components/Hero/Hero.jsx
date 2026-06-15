import { useState, useEffect } from "react";
import "./Hero.css";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const Hero = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [movieDetails, setMovieDetails] = useState(null);

  const featured = movies ? movies.slice(0, 5) : [];
  const movie = featured[currentIndex];

  useEffect(() => {
    if (!movie) return;
    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
        );
        if (res.ok) {
          const data = await res.json();
          setMovieDetails(data);
        }
      } catch {
        setMovieDetails(null);
      }
    };
    setMovieDetails(null);
    fetchDetails();
  }, [movie?.id]);

  if (!movies || movies.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const backdrop = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : null;

  const formatRuntime = (minutes) => {
    if (!minutes) return null;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const mainGenre = movieDetails?.genres?.[0]?.name || null;
  const runtime = formatRuntime(movieDetails?.runtime);
  const releaseFormatted = formatDate(movie.release_date);

  return (
    <section className="hero" style={backdrop ? { backgroundImage: `url(${backdrop})` } : {}}>
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
            <button className="hero-play-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Play
            </button>
            <button className="hero-info-btn">
              More Info
            </button>
          </div>
          <span className="hero-indicator">{currentIndex + 1} / {featured.length}</span>
        </div>
        <button className="hero-arrow hero-arrow-right" onClick={handleNext}>
          <span>›</span>
        </button>
      </div>
    </section>
  );
};

export default Hero;
