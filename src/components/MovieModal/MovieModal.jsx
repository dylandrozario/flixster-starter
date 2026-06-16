import { useEffect, useRef, useState } from "react";
import { getMovieInsight, fetchMovieTrailer, formatDate, formatRuntime, IMG_BASE_URL, POSTER_SIZE, BACKDROP_SIZE } from "../../utils/api";
import "./MovieModal.css";

const MovieModal = ({ movie, onClose }) => {
  const modalRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Tab") trapFocus(e);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    if (modalRef.current) modalRef.current.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!movie) return;
    fetchMovieTrailer(movie.id).then((key) => setTrailerKey(key));
  }, [movie?.id]);

  useEffect(() => {
    if (!movie) return;
    let cancelled = false;

    const genres = movie.genres ? movie.genres.map((g) => g.name).join(", ") : "";

    setAiLoading(true);
    setAiRecommendation(null);
    setAiError(null);

    getMovieInsight(movie.title, genres, movie.overview || "").then((result) => {
      if (cancelled) return;
      if (result) {
        setAiRecommendation(result);
      } else {
        setAiError("We couldn't generate a recommendation for this one — check out the overview above!");
      }
      setAiLoading(false);
    });

    return () => { cancelled = true; };
  }, [movie?.id]);

  const handlePlayTrailer = () => {
    if (trailerKey) setShowTrailer(true);
  };

  const trapFocus = (e) => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const backdrop = movie.backdrop_path
    ? `${IMG_BASE_URL}/${BACKDROP_SIZE}${movie.backdrop_path}`
    : null;

  const poster = movie.poster_path
    ? `${IMG_BASE_URL}/${POSTER_SIZE}${movie.poster_path}`
    : null;

  const genreList = movie.genres || [];

  return (
    <div
      className={`modal-overlay ${closing ? "modal-closing" : ""}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className={`modal-content ${closing ? "modal-content-closing" : ""}`}>
        <button className="modal-close" onClick={handleClose} aria-label="Close modal">✕</button>

        <div className="modal-backdrop">
          {showTrailer && trailerKey ? (
            <iframe
              className="modal-trailer"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title={`${movie.title} trailer`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              {backdrop && <img src={backdrop} alt={`${movie.title} backdrop`} />}
              {trailerKey && (
                <button className="modal-play-btn" onClick={handlePlayTrailer} aria-label="Play trailer">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        <div className="modal-body">
          <div className="modal-poster-section">
            {poster && (
              <img
                className="modal-poster"
                src={poster}
                alt={`${movie.title} poster`}
              />
            )}
          </div>
          <div className="modal-details">
            <h2 id="modal-title" className="modal-title">{movie.title}</h2>
            <div className="modal-meta">
              <span className="modal-rating">⭐ {movie.vote_average?.toFixed(1)}</span>
              <span className="modal-runtime">{formatRuntime(movie.runtime)}</span>
              <span className="modal-release">{formatDate(movie.release_date)}</span>
            </div>
            {genreList.length > 0 && (
              <div className="modal-genres">
                {genreList.map((g) => (
                  <span key={g.id} className="modal-genre-tag">{g.name}</span>
                ))}
              </div>
            )}
            <p className="modal-overview">{movie.overview}</p>

            <div className="modal-ai-section">
              <h3 className="modal-ai-title">Watch Recommendation</h3>
              {aiLoading && (
                <p className="modal-ai-loading">✨ Generating recommendation...</p>
              )}
              {aiRecommendation && (
                <p className="modal-ai-text">{aiRecommendation}</p>
              )}
              {aiError && (
                <p className="modal-ai-error">{aiError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
