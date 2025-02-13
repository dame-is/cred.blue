import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = () => {
  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteActive, setAutocompleteActive] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);

  const debounce = (func, delay) => {
    let timer;
    const debounced = (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
    debounced.cancel = () => {
      clearTimeout(timer);
    };
    return debounced;
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(query)}&limit=5`
      );
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setSuggestions(data.actors || []);
      setAutocompleteActive(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = useRef(debounce(fetchSuggestions, 300)).current;

  useEffect(() => {
    if (!selectedSuggestion) {
      debouncedFetchSuggestions(username);
    }
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [username, debouncedFetchSuggestions, selectedSuggestion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== "") {
      const encodedUsername = encodeURIComponent(username.trim());
      navigate(`/${encodedUsername}`);
      setUsername("");
      setSuggestions([]);
      setAutocompleteActive(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    setUsername(e.target.value);
    if (selectedSuggestion && e.target.value !== selectedSuggestion) {
      setSelectedSuggestion('');
    }
  };

  const handleKeyDown = (e) => {
    if (!autocompleteActive) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          e.preventDefault();
          const selectedHandle = suggestions[activeSuggestionIndex].handle;
          setUsername(selectedHandle);
          setSelectedSuggestion(selectedHandle);
          setSuggestions([]);
          setAutocompleteActive(false);
          navigate(`/${encodeURIComponent(selectedHandle)}`);
        }
        break;
      case "Escape":
        setAutocompleteActive(false);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <form className="search-bar" onSubmit={handleSubmit} role="search" autoComplete="off">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="(e.g. dame.bsky.social)"
              value={username}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              required
              role="combobox"
              aria-autocomplete="list"
              aria-controls="autocomplete-items"
              aria-expanded={autocompleteActive}
              aria-haspopup="listbox"
              aria-activedescendant={
                activeSuggestionIndex >= 0
                  ? `suggestion-${activeSuggestionIndex}`
                  : undefined
              }
            />
            {autocompleteActive && suggestions.length > 0 && (
              <div className="autocomplete-items" id="autocomplete-items">
                {suggestions.map((actor, index) => (
                  <div
                    key={actor.handle}
                    className={`autocomplete-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                    onClick={() => {
                      setUsername(actor.handle);
                      setSelectedSuggestion(actor.handle);
                      setSuggestions([]);
                      setAutocompleteActive(false);
                      debouncedFetchSuggestions.cancel();
                      navigate(`/${encodeURIComponent(actor.handle)}`);
                    }}
                  >
                    <img 
                      src={actor.avatar} 
                      alt={`${actor.handle}'s avatar`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <span>{actor.handle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="action-row">
            <button type="submit" className="submit-button">Submit</button>
          </div>
        </form>
        {isLoading && <div className="loading">Loading...</div>}
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {suggestions.length > 0
            ? `${suggestions.length} suggestions available.`
            : "No suggestions available."}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;