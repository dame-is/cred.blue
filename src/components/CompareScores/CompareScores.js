// frontend/src/components/CompareScores/CompareScores.js

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompareScoresResults from "./CompareScoresResults";
import { loadAccountData } from "../../accountData";
import MatterLoadingAnimation from "../MatterLoadingAnimation";

const CompareScores = () => {
  const { username1: urlUsername1, username2: urlUsername2 } = useParams();
  const navigate = useNavigate();

  // Input states
  const [username1, setUsername1] = useState(urlUsername1 || "");
  const [username2, setUsername2] = useState(urlUsername2 || "");
  
  // Autocomplete state for input1
  const [suggestions1, setSuggestions1] = useState([]);
  const [autocompleteActive1, setAutocompleteActive1] = useState(false);
  const [selectedSuggestion1, setSelectedSuggestion1] = useState("");
  const [activeSuggestionIndex1] = useState(-1);
  
  // Autocomplete state for input2
  const [suggestions2, setSuggestions2] = useState([]);
  const [autocompleteActive2, setAutocompleteActive2] = useState(false);
  const [selectedSuggestion2, setSelectedSuggestion2] = useState("");
  const [activeSuggestionIndex2] = useState(-1);

  // Other states
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Effect to handle URL parameters
  // Flag to track if usernames came from URL
  const [fromUrl, setFromUrl] = useState(false);

  useEffect(() => {
    if (urlUsername1 && urlUsername2) {
      setUsername1(urlUsername1);
      setUsername2(urlUsername2);
      setFromUrl(true);
      handleComparison(urlUsername1, urlUsername2);
    }
  }, [urlUsername1, urlUsername2]);

  // Debounce Helper Function
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

  // Comparison logic
  const handleComparison = async (user1, user2) => {
    if (!user1 || !user2) {
      setError("Please enter both usernames.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data1 = await loadAccountData(user1);
      const data2 = await loadAccountData(user2);
      setResults([data1, data2]);
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError("Error fetching account data. Please try again.");
    }
    setLoading(false);
  };

  // Autocomplete: Fetch Suggestions for Input1
  const fetchSuggestions1 = async (query) => {
    if (!query) {
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

  const debouncedFetchSuggestions1 = useRef(debounce(fetchSuggestions1, 300)).current;

  useEffect(() => {
    if (!selectedSuggestion1 && !fromUrl) {
      debouncedFetchSuggestions1(username1);
    }
    return () => {
      debouncedFetchSuggestions1.cancel();
    };
  }, [username1, debouncedFetchSuggestions1, selectedSuggestion1, fromUrl]);

  // Autocomplete: Fetch Suggestions for Input2
  const fetchSuggestions2 = async (query) => {
    if (!query) {
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

  const debouncedFetchSuggestions2 = useRef(debounce(fetchSuggestions2, 300)).current;

  useEffect(() => {
    if (!selectedSuggestion2 && !fromUrl) {
      debouncedFetchSuggestions2(username2);
    }
    return () => {
      debouncedFetchSuggestions2.cancel();
    };
  }, [username2, debouncedFetchSuggestions2, selectedSuggestion2, fromUrl]);

  // Input change handlers
  const handleInputChange1 = (e) => {
    setUsername1(e.target.value);
    if (selectedSuggestion1 && e.target.value !== selectedSuggestion1) {
      setSelectedSuggestion1("");
    }
    // Reset fromUrl flag when user starts typing
    if (fromUrl) {
      setFromUrl(false);
    }
  };

  const handleInputChange2 = (e) => {
    setUsername2(e.target.value);
    if (selectedSuggestion2 && e.target.value !== selectedSuggestion2) {
      setSelectedSuggestion2("");
    }
    // Reset fromUrl flag when user starts typing
    if (fromUrl) {
      setFromUrl(false);
    }
  };

  // Suggestion selection handlers
  const handleSuggestionSelect1 = (handle) => {
    setUsername1(handle);
    setSelectedSuggestion1(handle);
    setSuggestions1([]);
    setAutocompleteActive1(false);
    debouncedFetchSuggestions1.cancel();
    
    if (username2) {
      navigate(`/compare/${encodeURIComponent(handle)}/${encodeURIComponent(username2)}`, { replace: true });
      handleComparison(handle, username2);
    }
  };

  const handleSuggestionSelect2 = (handle) => {
    setUsername2(handle);
    setSelectedSuggestion2(handle);
    setSuggestions2([]);
    setAutocompleteActive2(false);
    debouncedFetchSuggestions2.cancel();
    
    if (username1) {
      navigate(`/compare/${encodeURIComponent(username1)}/${encodeURIComponent(handle)}`, { replace: true });
      handleComparison(username1, handle);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username1 || !username2) {
      setError("Please enter both usernames.");
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
            Username 1:
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username1}
                onChange={handleInputChange1}
                placeholder="e.g., alice.bsky.social"
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
            Username 2:
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username2}
                onChange={handleInputChange2}
                placeholder="e.g., bob.bsky.social"
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