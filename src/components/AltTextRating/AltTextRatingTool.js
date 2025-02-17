// frontend/src/pages/AltTextRatingTool.js

import React, { useState, useEffect, useRef } from 'react';
import './AltTextRatingTool.css';

const PUBLIC_API_URL = "https://public.api.bsky.app";
// Define the static minimum date from your original script.
const STATIC_MIN_DATE = new Date("2023-04-22T12:01:00Z");

const AltTextRatingTool = () => {
  // Form state and analysis data.
  const [username, setUsername] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [actorDID, setActorDID] = useState('');
  const [loading, setLoading] = useState(false);
  // Checkboxes state.
  const [useLast90Days, setUseLast90Days] = useState(false);
  const [excludeReplies, setExcludeReplies] = useState(false);
  // For the share button.
  const [shareButtonVisible, setShareButtonVisible] = useState(false);
  // For text results display.
  const [textResults, setTextResults] = useState(null);
  // For autocomplete suggestions.
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteActive, setAutocompleteActive] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  // New state to store a selected suggestion
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  // New state: show results div immediately after submission.
  const [showResults, setShowResults] = useState(false);

  // Ref for the gauge needle (SVG group).
  const needleGroupRef = useRef(null);
  // Refs for animation.
  const animFrameIdRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const currentOscillationRef = useRef(0);
  const oscillationDirectionRef = useRef(1);

  // ----------------------------
  // Helper functions (converted from inline script)
  // ----------------------------

  // Update the gauge needle based on the given percentage.
  const updateGauge = (percentage) => {
    const angleDeg = (percentage / 100) * 180;
    if (needleGroupRef.current) {
      needleGroupRef.current.setAttribute("transform", `rotate(${angleDeg},200,300)`);
    }
  };

  // Resolve handle to DID (with cleaning of directional characters).
  async function resolveHandleToDID(handle) {
    const cleanedHandle = handle.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
    const res = await fetch(`${PUBLIC_API_URL}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(cleanedHandle)}`);
    const data = await res.json();
    if (data.did) return data.did;
    throw new Error("Invalid username. Please try again without including the '@' symbol before the domain.");
  }

  // Fetch the service endpoint for a given DID.
  async function fetchServiceEndpoint(did) {
    let url;
    if (did.startsWith("did:web:")) {
      const domain = did.slice("did:web:".length);
      url = `https://${domain}/.well-known/did.json`;
    } else if (did.startsWith("did:plc:")) {
      url = `https://plc.directory/${did}`;
    } else {
      throw new Error(`Unsupported DID method for DID: ${did}`);
    }
    const res = await fetch(url);
    const data = await res.json();
    if (data.service && data.service.length > 0) {
      return data.service[0].serviceEndpoint;
    }
    throw new Error(`Service endpoint not found for DID: ${did}`);
  }

  // Fetch all records for a given collection.
  async function fetchRecordsForCollection(serviceEndpoint, did, collectionName) {
    let urlBase = `${serviceEndpoint}/xrpc/com.atproto.repo.listRecords?repo=${encodeURIComponent(did)}&collection=${encodeURIComponent(collectionName)}&limit=100`;
    let records = [];
    let cursor = null;
    do {
      const url = cursor ? `${urlBase}&cursor=${encodeURIComponent(cursor)}` : urlBase;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data.records)) {
        records = records.concat(data.records);
      }
      cursor = data.cursor || null;
    } while (cursor);
    return records;
  }
  
  // Analyze posts based on checkboxes.
  function analyzePosts(records, useLast90Days, excludeReplies, actor) {
    let dynamicMinDate;
    if (useLast90Days) {
      dynamicMinDate = new Date();
      dynamicMinDate.setDate(dynamicMinDate.getDate() - 90);
    } else {
      dynamicMinDate = new Date("1970-01-01T00:00:00Z");
    }
    const minDate = useLast90Days
      ? (dynamicMinDate > STATIC_MIN_DATE ? dynamicMinDate : STATIC_MIN_DATE)
      : STATIC_MIN_DATE;

    let totalPosts = 0;
    let postsWithImages = 0;
    let repliesWithImages = 0;
    let postsWithAltText = 0;

    records.forEach(rec => {
      if (!rec.value.createdAt) return;
      const postDate = new Date(rec.value.createdAt);
      if (postDate < minDate) return;
      const isReply = !!rec.value.reply;
      let isReplyToSelfFlag = false;
      if (isReply && rec.value.reply && rec.value.reply.parent && rec.value.reply.parent.author) {
        isReplyToSelfFlag = rec.value.reply.parent.author.did === actor;
      }
      if (isReply) {
        if (isReplyToSelfFlag) {
          totalPosts += 1;
          if (rec.value.embed && rec.value.embed["$type"] === "app.bsky.embed.images") {
            postsWithImages += 1;
            const hasAltText = rec.value.embed.images.some(img => img.alt && img.alt.trim());
            if (hasAltText) postsWithAltText += 1;
          }
        } else {
          if (!excludeReplies) {
            totalPosts += 1;
            if (rec.value.embed && rec.value.embed["$type"] === "app.bsky.embed.images") {
              postsWithImages += 1;
              repliesWithImages += 1;
              const hasAltText = rec.value.embed.images.some(img => img.alt && img.alt.trim());
              if (hasAltText) postsWithAltText += 1;
            }
          }
        }
      } else {
        totalPosts += 1;
        if (rec.value.embed && rec.value.embed["$type"] === "app.bsky.embed.images") {
          postsWithImages += 1;
          const hasAltText = rec.value.embed.images.some(img => img.alt && img.alt.trim());
          if (hasAltText) postsWithAltText += 1;
        }
      }
    });

    const altTextPercentage = (postsWithAltText / postsWithImages) * 100 || 0;
    const emojis = ["☹️", "😐", "🙂", "☺️"];
    let emoji = emojis[0];
    if (altTextPercentage >= 75) emoji = emojis[3];
    else if (altTextPercentage >= 50) emoji = emojis[2];
    else if (altTextPercentage >= 25) emoji = emojis[1];

    return {
      totalPosts,
      postsWithImages,
      repliesWithImages,
      postsWithAltText,
      altTextPercentage,
      emoji,
    };
  }

  // ----------------------------
  // Gauge Needle Animation (using requestAnimationFrame)
  // ----------------------------
  const baseSpeed = 0.10; // base speed per millisecond
  const oscillationMin = 0; // minimum percentage
  const oscillationMax = 100; // maximum percentage
  const bounceRange = 10;   // bounce offset

  const animateNeedle = (timestamp) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }
    const deltaTime = timestamp - lastTimestampRef.current;
    lastTimestampRef.current = timestamp;

    const randomFactor = 0.8 + Math.random() * 0.4; // between 0.8 and 1.2
    const increment = baseSpeed * deltaTime * randomFactor;
    currentOscillationRef.current += oscillationDirectionRef.current * increment;

    if (currentOscillationRef.current >= oscillationMax) {
      currentOscillationRef.current = oscillationMax - Math.random() * bounceRange;
      oscillationDirectionRef.current = -1;
    } else if (currentOscillationRef.current <= oscillationMin) {
      currentOscillationRef.current = oscillationMin + Math.random() * bounceRange;
      oscillationDirectionRef.current = 1;
    }

    updateGauge(currentOscillationRef.current);
    animFrameIdRef.current = requestAnimationFrame(animateNeedle);
  };

  const startNeedleAnimation = () => {
    currentOscillationRef.current = oscillationMin;
    oscillationDirectionRef.current = 1;
    lastTimestampRef.current = null;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    animFrameIdRef.current = requestAnimationFrame(animateNeedle);
  };

  const stopNeedleAnimation = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  };

  // ----------------------------
  // Autocomplete Functions (with debounce and cancel)
  // ----------------------------
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
    }
  };

  const debouncedFetchSuggestions = useRef(debounce(fetchSuggestions, 300)).current;

  useEffect(() => {
    // Only fetch suggestions if the username does NOT match a selected suggestion.
    if (!selectedSuggestion) {
      debouncedFetchSuggestions(username);
    }
  }, [username, debouncedFetchSuggestions, selectedSuggestion]);

  // ----------------------------
  // Render text analysis results.
  // ----------------------------
  const renderTextResults = (analysisResult) => (
    <div>
      <p><strong>{analysisResult.totalPosts}</strong> posts analyzed</p>
      <p><strong>{analysisResult.postsWithImages}</strong> contain images</p>
      <p><strong>{analysisResult.repliesWithImages}</strong> are replies</p>
      <p><strong>{analysisResult.postsWithAltText}</strong> posts have alt text</p>
      <h2>Score: {analysisResult.altTextPercentage.toFixed(2)}% {analysisResult.emoji}</h2>
    </div>
  );

  // ----------------------------
  // Form Handler
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowResults(true);
    setLoading(true);
    setShareButtonVisible(false);
    setAnalysis(null);
    setTextResults(null);
    stopNeedleAnimation();
    startNeedleAnimation();

    try {
      const did = await resolveHandleToDID(username);
      setActorDID(did);
      const serviceEndpoint = await fetchServiceEndpoint(did);
      const records = await fetchRecordsForCollection(serviceEndpoint, did, "app.bsky.feed.post");
      setAllRecords(records);

      const analysisResult = analyzePosts(records, useLast90Days, excludeReplies, did);
      setAnalysis(analysisResult);
      setTextResults(renderTextResults(analysisResult));
      updateGauge(analysisResult.altTextPercentage);
      setShareButtonVisible(true);
      stopNeedleAnimation();
    } catch (error) {
      setTextResults(<p style={{ color: 'red' }}>Error: {error.message}</p>);
      updateGauge(0);
      stopNeedleAnimation();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (allRecords.length > 0 && actorDID) {
      const newAnalysis = analyzePosts(allRecords, useLast90Days, excludeReplies, actorDID);
      setAnalysis(newAnalysis);
      setTextResults(renderTextResults(newAnalysis));
      updateGauge(newAnalysis.altTextPercentage);
    }
  }, [useLast90Days, excludeReplies]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------------------
  // Input onChange: clear selectedSuggestion if user types manually.
  // ----------------------------
  const handleInputChange = (e) => {
    setUsername(e.target.value);
    if (selectedSuggestion && e.target.value !== selectedSuggestion) {
      setSelectedSuggestion('');
    }
  };

  return (
    <div className="alt-text-rating-tool">
      <div id="alt-text-rating-form" className="alt-card">
        <h1>Bluesky Alt Text Rating</h1>
        <p>How consistently do you use alt text?</p>
        <form className="search-bar" onSubmit={handleSubmit} autoComplete="off">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={username}
              onChange={handleInputChange}
              placeholder="(e.g., user.bsky.social)"
              required
            />
            {autocompleteActive && suggestions.length > 0 && (
              <div className="autocomplete-items">
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
                    }}
                  >
                    <img src={actor.avatar} alt={`${actor.handle}'s avatar`} />
                    <span>{actor.handle}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="action-row">
            <button className="analyze-button" type="submit">Analyze</button>
            <button
                className="share-button"
              type="button"
              onClick={() => window.open(
                `https://bsky.app/intent/compose?text=${encodeURIComponent(
                  `My alt text rating score is ${analysis?.altTextPercentage?.toFixed(2)}% ${analysis?.emoji}\n\n${analysis?.totalPosts} posts analyzed,\n${analysis?.postsWithImages} contain images,\n${analysis?.postsWithAltText} have alt text...\n\nGet your Bluesky alt text rating here: dame.is/ratingalttext`
                )}`, '_blank'
              )}
              style={{ display: shareButtonVisible ? 'inline-block' : 'none' }}
            >
              Share Results
            </button>
          </div>
        </form>
        <div className="results" style={{ display: showResults ? 'block' : 'none' }}>
          <div id="textResults">{textResults}</div>
          <div className="gauge-container">
            <svg className="gauge-svg" viewBox="0 0 400 300">
              <path d="M50,300 A150,150 0 0,1 93.93,193.93 L200,300 Z" fill="#ff0000" />
              <path d="M93.93,193.93 A150,150 0 0,1 200,150 L200,300 Z" fill="#ff9900" />
              <path d="M200,150 A150,150 0 0,1 306.07,193.93 L200,300 Z" fill="#ffff66" />
              <path d="M306.07,193.93 A150,150 0 0,1 350,300 L200,300 Z" fill="#00cc00" />
              <circle cx="200" cy="300" r="10" fill="#000" />
              <g ref={needleGroupRef} className="needle-group" transform="rotate(0,200,300)">
                <line x1="200" y1="300" x2="50" y2="300" stroke="#000" strokeWidth="7" />
              </g>
            </svg>
          </div>
          <div className="filters-container">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={useLast90Days}
                onChange={(e) => setUseLast90Days(e.target.checked)}
              />
              <span className="checkbox-indicator"></span>
              Last 90 Days
            </label>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={excludeReplies}
                onChange={(e) => setExcludeReplies(e.target.checked)}
              />
              <span className="checkbox-indicator"></span>
              Exclude Replies
            </label>
          </div>
          <p>
            <a href="https://bsky.app/settings/accessibility" target="_blank" rel="noreferrer">
              Change your Bluesky alt text settings
            </a>
          </p>
          <p>
            <a href="https://bsky.app/profile/cred.blue" target="_blank" rel="noreferrer">
              Discover more tools: @cred.blue
            </a>
          </p>
        </div>
      </div>
      <div id="extra-info" className="alt-card">
        <div className="resources">
          <h3>Learn more about alt text:</h3>
          <ul>
            <li>
              <a href="https://www.section508.gov/create/alternative-text/" target="_blank" rel="noreferrer">
                Authoring Meaningful Alternative Text
              </a>
            </li>
            <li>
              <a href="https://accessibility.huit.harvard.edu/describe-content-images" target="_blank" rel="noreferrer">
                Write helpful Alt Text to describe images
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AltTextRatingTool;
