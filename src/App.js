import { useState, useEffect, useRef } from 'react';
import './main.css';

const API_KEY = 'fc1fef96';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showSearchList, setShowSearchList] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);

  /* Helper: Poster Fallback */
  const getPoster = (poster) => 
    poster !== 'N/A' ? poster : 'https://via.placeholder.com/40x60?text=No+Poster';

  /* Event Handlers */
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectMovie = (imdbID) => {
    setShowSearchList(false);
    setError(null);
    setIsLoading(true);
    fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        setSelectedMovie(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch movie details');
        setIsLoading(false);
      });
  };

  /* Search API Logic */
  useEffect(() => {
    const fetchMovies = async () => {
      const trimmed = searchTerm.trim();
      if (trimmed.length === 0) {
        setShowSearchList(false);
        setError(null);
        return;
      }

      try {
        const res = await fetch(
          `https://www.omdbapi.com/?s=${encodeURIComponent(trimmed)}&page=1&apikey=${API_KEY}`
        );
        const data = await res.json();

        if (data.Response === 'True') {
          setSearchResults(data.Search);
          setShowSearchList(true);
          setError(null);
        } else {
          setSearchResults([]);
          setShowSearchList(false);
          setError(data.Error || 'No results found');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        setSearchResults([]);
        setShowSearchList(false);
      }
    };

    const debounce = setTimeout(fetchMovies, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  /* Click-Outside Handler */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="wrapper">

      {/* Branding & Logo */}
      <div className="logo">
        <a href="/" className="logo-link">
          <img 
            src="moviescript-logo.png" 
            alt="Logo" 
            className="site-logo-icon" 
          />
          <p>Movie<span>Script</span></p>
        </a>
      </div>
      <div className="container">

        {/* Search Interface */}
        <div className="search-element" ref={searchRef}>
          <h3>Search Movie:</h3>

          <div className="search-input-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Type a movie name..."
              value={searchTerm}
              onChange={handleInputChange}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          {/* Search Dropdown */}
          {showSearchList && searchResults.length > 0 && !error && (
            <ul className="search-list">
              {searchResults.map((movie) => (
                <li
                  key={movie.imdbID}
                  className="search-list-item"
                  onClick={() => handleSelectMovie(movie.imdbID)}
                >
                  <div className="search-item-thumbnail">
                    <img src={getPoster(movie.Poster)} alt={movie.Title} />
                  </div>
                  <div className="search-item-info">
                    <h3>{movie.Title}</h3>
                    <p>{movie.Year}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching movie details...</p>
          </div>
        )}

        {/* Movie Details */}
        {selectedMovie && !isLoading && (
          <div className="result-container">
            <div className="result-grid">
              <div className="movie-poster">
                <img src={getPoster(selectedMovie.Poster)} alt={selectedMovie.Title} />
              </div>
              <div className="movie-info">
                <h2 className="movie-title">{selectedMovie.Title}</h2>
                <ul className="movie-misc-info">
                  {selectedMovie.Year && <li>{selectedMovie.Year}</li>}
                  {selectedMovie.Rated && <li className="rated">{selectedMovie.Rated}</li>}
                  {selectedMovie.Runtime && <li>{selectedMovie.Runtime}</li>}
                  {selectedMovie.Genre && <li className="genre">{selectedMovie.Genre}</li>}
                </ul>
                <p className="plot">{selectedMovie.Plot}</p>
                {selectedMovie.Actors && <p className="actors"><strong>Actors:</strong> {selectedMovie.Actors}</p>}
                {selectedMovie.Director && <p className="writer"><strong>Director:</strong> {selectedMovie.Director}</p>}
                {selectedMovie.Language && <p className="language"><strong>Language:</strong> {selectedMovie.Language}</p>}
                {selectedMovie.Awards && <p className="awards">🏆 {selectedMovie.Awards}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
