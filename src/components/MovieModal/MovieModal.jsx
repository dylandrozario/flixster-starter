import { useEffect, useRef, useState } from "react";
import "./MovieModal.css";

const BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";

const MovieModal = ({ movie, onClose }) => {
  const modalRef = useRef(null);
  const [closing, setClosing] = useState(false);

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
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : null;

  const poster = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : null;

  const genreList = movie.genres || [];

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

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

        {backdrop && (
          <div className="modal-backdrop">
            <img src={backdrop} alt={`${movie.title} backdrop`} />
          </div>
        )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
