import { useState } from "react";
import "./Hero.css";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const Hero = ({ movies }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!movies || movies.length === 0) return null;

  const featured = movies.slice(0, 5);
  const movie = featured[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const backdrop = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : null;

  return (
    <section className="hero" style={backdrop ? { backgroundImage: `url(${backdrop})` } : {}}>
      <div className="hero-overlay">
        <button className="hero-arrow hero-arrow-left" onClick={handlePrev}>
          <span>‹</span>
        </button>
        <div className="hero-content">
          <span className="hero-label">Now Playing</span>
          <h1 className="hero-title">{movie.title}</h1>
          <div className="hero-meta">
            <span className="hero-rating">⭐ {movie.vote_average.toFixed(1)}</span>
            <span className="hero-date">{movie.release_date}</span>
          </div>
          <p className="hero-overview">{movie.overview}</p>
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
