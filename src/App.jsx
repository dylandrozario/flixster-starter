import { useState, useEffect, useRef } from 'react'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import MovieList from './components/MovieList/MovieList'
import MovieModal from './components/MovieModal/MovieModal'
import Footer from './components/Footer/Footer'
import Sidebar from './components/Sidebar/Sidebar'
import { fetchNowPlaying, searchMovies, fetchMovieDetails, sortMovies } from './utils/api'
import './App.css'

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
  const [modalError, setModalError] = useState(null);
  const [hearted, setHearted] = useState(new Set());
  const [starred, setStarred] = useState(new Set());
  const [watched, setWatched] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const triggerRef = useRef(null);

  const loadMovies = async (query, pageNum) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = query
        ? await searchMovies(query, pageNum)
        : await fetchNowPlaying(pageNum);

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

  const handleMovieClick = async (movieId) => {
    triggerRef.current = document.activeElement;
    setModalError(null);

    try {
      const data = await fetchMovieDetails(movieId);
      setSelectedMovie(data);
    } catch (err) {
      setModalError(err.message);
    }
  };

  useEffect(() => {
    loadMovies("", 1);
  }, []);

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
    loadMovies(query, 1);
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsSearchMode(false);
    setPage(1);
    loadMovies("", 1);
  };

  const handleToggleHeart = (movieId) => {
    setHearted((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  };

  const handleToggleStar = (movieId) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  };

  const handleToggleWatched = (movieId) => {
    setWatched((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(searchQuery, nextPage);
  };

  const handleRetry = () => {
    loadMovies(searchQuery, page);
  };

  return (
    <div className="App">
      <Header
        onSearch={handleSearch}
        onClear={handleClear}
        isSearchMode={isSearchMode}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      <main>
        {!isSearchMode && <Hero movies={movies} onMovieClick={handleMovieClick} />}
        <MovieList
          movies={sortMovies(movies, sortBy)}
          onMovieClick={handleMovieClick}
          onLoadMore={handleLoadMore}
          hasMore={page < totalPages}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          isSearchMode={isSearchMode}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          page={page}
          totalPages={totalPages}
          hearted={hearted}
          starred={starred}
          watched={watched}
          onToggleHeart={handleToggleHeart}
          onToggleStar={handleToggleStar}
          onToggleWatched={handleToggleWatched}
        />
      </main>
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
      <Sidebar
        movies={movies}
        hearted={hearted}
        watched={watched}
        onMovieClick={handleMovieClick}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Footer />
    </div>
  );
};

export default App
