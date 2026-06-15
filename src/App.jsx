import { useState, useEffect, useRef } from 'react'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import MovieList from './components/MovieList/MovieList'
import MovieModal from './components/MovieModal/MovieModal'
import './App.css'

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const triggerRef = useRef(null);

  const fetchMovies = async (query, pageNum) => {
    setIsLoading(true);
    setError(null);

    const url = query
      ? `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${pageNum}`
      : `${TMDB_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=${pageNum}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Invalid API key. Check your .env file."
            : `Failed to fetch movies (${response.status})`
        );
      }

      const data = await response.json();
      setTotalPages(data.total_pages);

      if (pageNum === 1) {
        setMovies(data.results);
      } else {
        setMovies(prevMovies => [...prevMovies, ...data.results]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    setIsModalLoading(true);
    setModalError(null);

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Movie not found."
            : response.status === 401
            ? "Invalid API key."
            : `Failed to fetch movie details (${response.status})`
        );
      }

      const data = await response.json();
      setSelectedMovie(data);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies("", 1);
  }, []);

  const handleMovieClick = (movieId) => {
    triggerRef.current = document.activeElement;
    fetchMovieDetails(movieId);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
    setModalError(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearchMode(true);
    setPage(1);
    fetchMovies(query, 1);
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setPage(1);
    fetchMovies("", 1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(searchQuery, nextPage);
  };

  const handleRetry = () => {
    fetchMovies(searchQuery, page);
  };

  const handleSortChange = (criteria) => {
    setSortBy(criteria);
  };

  const getSortedMovies = () => {
    if (!sortBy) return movies;
    const sorted = [...movies];
    switch (sortBy) {
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "rating":
        sorted.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case "release_date":
        sorted.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        break;
    }
    return sorted;
  };

  return (
    <div className="App">
      <Header
        onSearch={handleSearch}
        onClear={handleClear}
        isSearchMode={isSearchMode}
      />
      {!isSearchMode && <Hero movies={movies} />}
      <MovieList
        movies={getSortedMovies()}
        onMovieClick={handleMovieClick}
        onLoadMore={handleLoadMore}
        hasMore={page < totalPages}
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        isSearchMode={isSearchMode}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        page={page}
        totalPages={totalPages}
      />
      {isModalLoading && (
        <div className="modal-loading-overlay">
          <p>Loading movie details...</p>
        </div>
      )}
      {modalError && !selectedMovie && (
        <div className="modal-loading-overlay" onClick={handleCloseModal}>
          <div className="modal-error-message">
            <p>{modalError}</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default App
