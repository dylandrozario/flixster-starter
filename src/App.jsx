import { useState, useEffect } from 'react'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import MovieList from './components/MovieList/MovieList'
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

  useEffect(() => {
    fetchMovies("", 1);
  }, []);

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
        onMovieClick={(id) => console.log("Movie clicked:", id)}
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
    </div>
  );
};

export default App
