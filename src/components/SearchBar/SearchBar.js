// src/components/SearchBar/SearchBar.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = () => {
  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1); // New state
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch suggestions from the API
  const fetchSuggestions = useCallback(async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(
          query
        )}&limit=5`
      );

      if (!response.ok) {
        console.error("Error fetching suggestions:", response.statusText);
        setSuggestions([]);
        return;
      }

      const data = await response.json();
      setSuggestions(data.actors || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce the API call to prevent excessive requests
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(username.trim());
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [username, fetchSuggestions]);

  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1); // Reset active suggestion
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== "") {
      const encodedUsername = encodeURIComponent(username.trim());
      navigate(`/${encodedUsername}`);
      setUsername("");
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (handle) => {
    setUsername(handle);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    // Optionally, navigate immediately upon selection
    navigate(`/${encodeURIComponent(handle)}`);
  };

  const handleInputChange = (e) => {
    setUsername(e.target.value);
    setShowSuggestions(true);
    setActiveSuggestionIndex(-1); // Reset active suggestion on input change
  };

  // Handle key down events for keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveSuggestionIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex].handle);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  return (
    <div className="search-bar-container" ref={suggestionsRef}>
      <form className="search-bar" onSubmit={handleSubmit} role="search">
        <input
          type="text"
          placeholder="(e.g. dame.bsky.social)"
          value={username}
          onChange={handleInputChange}
          required
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown} // Added key down handler
          role="combobox"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-activedescendant={
            activeSuggestionIndex >= 0
              ? `suggestion-${activeSuggestionIndex}`
              : undefined
          }
        />
        <button type="submit">Search</button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="suggestions-list"
          id="suggestions-list"
          role="listbox"
          aria-label="Username suggestions"
        >
          {suggestions.map((actor, index) => (
            <li
              key={actor.did}
              id={`suggestion-${index}`}
              className={`suggestion-item ${
                index === activeSuggestionIndex ? "active" : ""
              }`}
              role="option"
              aria-selected={index === activeSuggestionIndex}
              onClick={() => handleSuggestionClick(actor.handle)}
              onMouseEnter={() => setActiveSuggestionIndex(index)} // Optional: highlight on hover
            >
              <img
                src={actor.avatar}
                alt={`${actor.handle} avatar`}
                className="suggestion-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png"; // Fallback avatar
                }}
              />
              <span className="suggestion-handle">{actor.handle}</span>
            </li>
          ))}
        </ul>
      )}
      {isLoading && <div className="loading">Loading...</div>}
      {/* Accessible live region for screen readers */}
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
  );
};

export default SearchBar;
