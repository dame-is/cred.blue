import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteActive, setAutocompleteActive] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Debounce function
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

  // Function to resolve DID to handle
  const resolveDid = async (did) => {
    try {
      // Use the identity.resolveHandle endpoint for DID resolution
      const res = await fetch(
        `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(did)}`
      );
      
      if (!res.ok) {
        // If that fails, try the repo.describeRepo endpoint
        const repoRes = await fetch(
          `https://public.api.bsky.app/xrpc/com.atproto.repo.describeRepo?repo=${encodeURIComponent(did)}`
        );
        
        if (!repoRes.ok) throw new Error("Failed to resolve DID");
        const repoData = await repoRes.json();
        return repoData.handle;
      }
      
      const data = await res.json();
      if (!data.did) throw new Error("Could not resolve DID");
      
      // Now get the handle from the DID
      const handleRes = await fetch(
        `https://public.api.bsky.app/xrpc/com.atproto.repo.describeRepo?repo=${encodeURIComponent(data.did)}`
      );
      
      if (!handleRes.ok) throw new Error("Failed to get handle from DID");
      const handleData = await handleRes.json();
      return handleData.handle;
    } catch (error) {
      console.error("Error resolving DID:", error);
      throw error;
    }
  };

  // Fetch suggestions from the API
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
      debouncedFetchSuggestions(searchTerm);
    }
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchTerm, debouncedFetchSuggestions, selectedSuggestion]);

  const handleNavigation = async (term) => {
    let handle = term;
    
    // Check if the term is a DID
    if (term.startsWith('did:')) {
      const resolvedHandle = await resolveDid(term);
      if (resolvedHandle) {
        handle = resolvedHandle;
      } else {
        // If DID resolution fails, still try to use the DID
        handle = term;
      }
    }

    // First navigate to home to reset any error states
    navigate("/home");
    // Then navigate to the profile
    setTimeout(() => {
      navigate(`/${encodeURIComponent(handle)}`);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      await handleNavigation(searchTerm.trim());
      setSearchTerm("");
      setSuggestions([]);
      setAutocompleteActive(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (selectedSuggestion && e.target.value !== selectedSuggestion) {
      setSelectedSuggestion('');
    }
  };

  const handleKeyDown = async (e) => {
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
          setSearchTerm(selectedHandle);
          setSelectedSuggestion(selectedHandle);
          setSuggestions([]);
          setAutocompleteActive(false);
          await handleNavigation(selectedHandle);
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
      <form className="search-bar" onSubmit={handleSubmit} role="search">
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Enter handle or DID (e.g. user.bsky.social or did:plc:...)"
            value={searchTerm}
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
                  onClick={async () => {
                    setSearchTerm(actor.handle);
                    setSelectedSuggestion(actor.handle);
                    setSuggestions([]);
                    setAutocompleteActive(false);
                    debouncedFetchSuggestions.cancel();
                    await handleNavigation(actor.handle);
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
                  <div className="suggestion-info">
                    <span className="handle">{actor.handle}</span>
                    <span className="did">{actor.did}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit">Search</button>
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
  );
};

export default SearchBar;