import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompareScoresResults from "./CompareScoresResults";
import { loadAccountData } from "../../accountData";
import { isDID, resolveDIDToHandle } from "../../utils/didUtils";
import MatterLoadingAnimation from "../MatterLoadingAnimation";

const CompareScores = () => {
  const { username1: urlUsername1, username2: urlUsername2 } = useParams();
  const navigate = useNavigate();

  // Input states
  const [username1, setUsername1] = useState(urlUsername1 || "");
  const [username2, setUsername2] = useState(urlUsername2 || "");
  
  // Autocomplete states
  const [suggestions1, setSuggestions1] = useState([]);
  const [autocompleteActive1, setAutocompleteActive1] = useState(false);
  const [selectedSuggestion1, setSelectedSuggestion1] = useState("");
  const [activeSuggestionIndex1] = useState(-1);
  
  const [suggestions2, setSuggestions2] = useState([]);
  const [autocompleteActive2, setAutocompleteActive2] = useState(false);
  const [selectedSuggestion2, setSelectedSuggestion2] = useState("");
  const [activeSuggestionIndex2] = useState(-1);

  // Other states
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromUrl, setFromUrl] = useState(false);

  // Refs for debounced functions
  const debouncedFetchSuggestions1 = useRef(null);
  const debouncedFetchSuggestions2 = useRef(null);

  // Debounce helper function
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

  // Initialize debounced functions
  useEffect(() => {
    // Suggestion fetching functions
    const fetchSuggestions1 = async (query) => {
      if (!query || isDID(query)) {
        setSuggestions1([]);
        return;
      }
      try {
        const res = await fetch(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(query)}&limit=5`
        );
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();
        setSuggestions1(data.actors || []);
        setAutocompleteActive1(true);
      } catch (error) {
        console.error("Error fetching suggestions for input1:", error);
        setSuggestions1([]);
      }
    };

    const fetchSuggestions2 = async (query) => {
      if (!query || isDID(query)) {
        setSuggestions2([]);
        return;
      }
      try {
        const res = await fetch(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?q=${encodeURIComponent(query)}&limit=5`
        );
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();
        setSuggestions2(data.actors || []);
        setAutocompleteActive2(true);
      } catch (error) {
        console.error("Error fetching suggestions for input2:", error);
        setSuggestions2([]);
      }
    };

    debouncedFetchSuggestions1.current = debounce(fetchSuggestions1, 300);
    debouncedFetchSuggestions2.current = debounce(fetchSuggestions2, 300);

    return () => {
      if (debouncedFetchSuggestions1.current) {
        debouncedFetchSuggestions1.current.cancel();
      }
      if (debouncedFetchSuggestions2.current) {
        debouncedFetchSuggestions2.current.cancel();
      }
    };
  }, []);

  // Memoized comparison handler
  const handleComparison = useCallback(async (user1, user2) => {
    if (!user1 || !user2) {
      setError("Please enter both usernames or DIDs.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Resolve DIDs if necessary
      let resolvedUser1 = user1;
      let resolvedUser2 = user2;

      if (isDID(user1)) {
        resolvedUser1 = await resolveDIDToHandle(user1);
      }
      if (isDID(user2)) {
        resolvedUser2 = await resolveDIDToHandle(user2);
      }

      const data1 = await loadAccountData(resolvedUser1);
      const data2 = await loadAccountData(resolvedUser2);
      setResults([data1, data2]);

      // Update URL with resolved handles if necessary
      if (resolvedUser1 !== user1 || resolvedUser2 !== user2) {
        navigate(`/compare/${encodeURIComponent(resolvedUser1)}/${encodeURIComponent(resolvedUser2)}`, { replace: true });
      }
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError("Error fetching account data. Please check the usernames/DIDs and try again.");
    }
    setLoading(false);
  }, [navigate]);

  // URL parameters effect
  useEffect(() => {
    if (urlUsername1 && urlUsername2) {
      setUsername1(urlUsername1);
      setUsername2(urlUsername2);
      setFromUrl(true);
      handleComparison(urlUsername1, urlUsername2);
    }
  }, [urlUsername1, urlUsername2, handleComparison]);

  // Suggestion fetching effects
  useEffect(() => {
    if (!selectedSuggestion1 && !fromUrl && debouncedFetchSuggestions1.current) {
      debouncedFetchSuggestions1.current(username1);
    }
    return () => {
      if (debouncedFetchSuggestions1.current) {
        debouncedFetchSuggestions1.current.cancel();
      }
    };
  }, [username1, selectedSuggestion1, fromUrl]);

  useEffect(() => {
    if (!selectedSuggestion2 && !fromUrl && debouncedFetchSuggestions2.current) {
      debouncedFetchSuggestions2.current(username2);
    }
    return () => {
      if (debouncedFetchSuggestions2.current) {
        debouncedFetchSuggestions2.current.cancel();
      }
    };
  }, [username2, selectedSuggestion2, fromUrl]);

  // Input change handlers
  const handleInputChange1 = (e) => {
    const value = e.target.value;
    setUsername1(value);
    if (selectedSuggestion1 && value !== selectedSuggestion1) {
      setSelectedSuggestion1("");
    }
    if (fromUrl) {
      setFromUrl(false);
    }
    // Hide suggestions if it's a DID
    if (isDID(value)) {
      setSuggestions1([]);
      setAutocompleteActive1(false);
    }
  };

  const handleInputChange2 = (e) => {
    const value = e.target.value;
    setUsername2(value);
    if (selectedSuggestion2 && value !== selectedSuggestion2) {
      setSelectedSuggestion2("");
    }
    if (fromUrl) {
      setFromUrl(false);
    }
    // Hide suggestions if it's a DID
    if (isDID(value)) {
      setSuggestions2([]);
      setAutocompleteActive2(false);
    }
  };

  // Suggestion selection handlers
  const handleSuggestionSelect1 = async (handle) => {
    setUsername1(handle);
    setSelectedSuggestion1(handle);
    setSuggestions1([]);
    setAutocompleteActive1(false);
    if (debouncedFetchSuggestions1.current) {
      debouncedFetchSuggestions1.current.cancel();
    }
    
    if (username2) {
      navigate(`/compare/${encodeURIComponent(handle)}/${encodeURIComponent(username2)}`, { replace: true });
      await handleComparison(handle, username2);
    }
  };

  const handleSuggestionSelect2 = async (handle) => {
    setUsername2(handle);
    setSelectedSuggestion2(handle);
    setSuggestions2([]);
    setAutocompleteActive2(false);
    if (debouncedFetchSuggestions2.current) {
      debouncedFetchSuggestions2.current.cancel();
    }
    
    if (username1) {
      navigate(`/compare/${encodeURIComponent(username1)}/${encodeURIComponent(handle)}`, { replace: true });
      await handleComparison(username1, handle);
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username1 || !username2) {
      setError("Please enter both usernames or DIDs.");
      return;
    }
    
    // Update URL without triggering a page reload
    navigate(`/compare/${encodeURIComponent(username1)}/${encodeURIComponent(username2)}`, { replace: true });
    
    // Trigger comparison
    await handleComparison(username1, username2);
  };

  return (
    <div className="compare-scores-page">
      <form onSubmit={handleSubmit}>
        <h1>Compare Scores</h1>
        <div>
          <label>
            Username/DID 1:
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username1}
                onChange={handleInputChange1}
                placeholder="e.g., alice.bsky.social or did:plc:..."
              />
              {autocompleteActive1 && suggestions1.length > 0 && (
                <div className="autocomplete-items">
                  {suggestions1.map((actor, index) => (
                    <div
                      key={actor.handle}
                      className={`autocomplete-item ${index === activeSuggestionIndex1 ? 'active' : ''}`}
                      onClick={() => handleSuggestionSelect1(actor.handle)}
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
          </label>
        </div>
        <div>
          <label>
            Username/DID 2:
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username2}
                onChange={handleInputChange2}
                placeholder="e.g., bob.bsky.social or did:plc:..."
              />
              {autocompleteActive2 && suggestions2.length > 0 && (
                <div className="autocomplete-items">
                  {suggestions2.map((actor, index) => (
                    <div
                      key={actor.handle}
                      className={`autocomplete-item ${index === activeSuggestionIndex2 ? 'active' : ''}`}
                      onClick={() => handleSuggestionSelect2(actor.handle)}
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
          </label>
        </div>
        <button type="submit">Compare</button>
      </form>
      
      {error && <div className="error" style={{ color: "red" }}>{error}</div>}
      {loading ? (
        <div className="compare-scores loading-container">
          <MatterLoadingAnimation />
        </div>
      ) : (
        results && <CompareScoresResults result={results} loading={loading} />
      )}
    </div>
  );
};

export default CompareScores;