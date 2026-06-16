import { useState } from "react";
import { IMG_BASE_URL, POSTER_SIZE } from "../../utils/api";
import "./Sidebar.css";

const Sidebar = ({ movies, starred, watched, onMovieClick, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("favorites");

  const favoriteMovies = movies.filter((m) => starred.has(m.id));
  const watchedMovies = movies.filter((m) => watched.has(m.id));

  const displayList = activeTab === "favorites" ? favoriteMovies : watchedMovies;

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">My Lists</h2>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">✕</button>
        </div>
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === "favorites" ? "sidebar-tab-active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            ★ Favorites ({favoriteMovies.length})
          </button>
          <button
            className={`sidebar-tab ${activeTab === "watched" ? "sidebar-tab-active" : ""}`}
            onClick={() => setActiveTab("watched")}
          >
            ✓ Watched ({watchedMovies.length})
          </button>
        </div>
        <div className="sidebar-list">
          {displayList.length === 0 ? (
            <p className="sidebar-empty">
              {activeTab === "favorites"
                ? "No favorites yet — star a movie to add it here."
                : "No watched movies yet — mark a movie as watched to track it here."}
            </p>
          ) : (
            displayList.map((movie) => (
              <div
                key={movie.id}
                className="sidebar-item"
                onClick={() => onMovieClick(movie.id)}
              >
                {movie.poster_path ? (
                  <img
                    className="sidebar-item-poster"
                    src={`${IMG_BASE_URL}/${POSTER_SIZE}${movie.poster_path}`}
                    alt={`${movie.title} poster`}
                  />
                ) : (
                  <div className="sidebar-item-placeholder" />
                )}
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">{movie.title}</span>
                  <span className="sidebar-item-rating">⭐ {movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
