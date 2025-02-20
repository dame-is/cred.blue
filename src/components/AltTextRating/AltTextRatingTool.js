import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AltTextRatingTool.css';

const PUBLIC_API_URL = "https://public.api.bsky.app";

const AltTextRatingTool = () => {
  const [username, setUsername] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [actorDID, setActorDID] = useState('');
  const [loading, setLoading] = useState(false);
  const [excludeReplies, setExcludeReplies] = useState(false);
  const [shareButtonVisible, setShareButtonVisible] = useState(false);
  const [textResults, setTextResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [autocompleteActive, setAutocompleteActive] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [showResults, setShowResults] = useState(false);

  const needleGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const currentOscillationRef = useRef(0);
  const oscillationDirectionRef = useRef(1);

  const navigate = useNavigate();

  const updateGauge = (percentage) => {
    const angleDeg = (percentage / 100) * 180;
    if (needleGroupRef.current) {
      needleGroupRef.current.setAttribute("transform", `rotate(${angleDeg},200,300)`);
    }
  };

  async function resolveHandleToDID(handle) {
    const cleanedHandle = handle.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
    const res = await fetch(`${PUBLIC_API_URL}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(cleanedHandle)}`);
    const data = await res.json();
    if (data.did) return data.did;
    throw new Error("Invalid username. Please try again without including the '@' symbol before the domain.");
  }

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

  async function fetchRecordsForCollection(serviceEndpoint, did, collectionName) {
    // Calculate cutoff time for 90 days
    const cutoffTime = Date.now() - 90 * 24 * 60 * 60 * 1000;
    
    const urlBase = `${serviceEndpoint}/xrpc/com.atproto.repo.listRecords?repo=${encodeURIComponent(did)}&collection=${encodeURIComponent(collectionName)}&limit=100`;
    let records = [];
    let cursor = null;

    while (true) {
      const url = cursor ? `${urlBase}&cursor=${encodeURIComponent(cursor)}` : urlBase;
      const res = await fetch(url);
      const data = await res.json();

      if (!data || !Array.isArray(data.records) || data.records.length === 0) {
        break;
      }

      let minCreatedAt = Infinity;
      const pageRecords = [];

      for (const rec of data.records) {
        const createdAt = rec.value?.createdAt;
        if (!createdAt) continue;

        const recordTime = new Date(createdAt).getTime();
        minCreatedAt = Math.min(minCreatedAt, recordTime);

        if (recordTime >= cutoffTime) {
          pageRecords.push(rec);
        }
      }

      records.push(...pageRecords);

      if (minCreatedAt < cutoffTime) {
        break;
      }

      if (!data.cursor) {
        break;
      }
      
      cursor = data.cursor;
    }

    return records;
  }

  function analyzePosts(records, excludeReplies, actor) {
    let totalPosts = 0;
    let postsWithImages = 0;
    let repliesWithImages = 0;
    let postsWithAltText = 0;

    records.forEach(rec => {
      if (!rec.value.createdAt) return;
      
      const isReply = !!rec.value.reply;
      let isReplyToSelfFlag = false;
      
      if (isReply && rec.value.reply?.parent?.author) {
        isReplyToSelfFlag = rec.value.reply.parent.author.did === actor;
      }

      if (isReply) {
        if (isReplyToSelfFlag) {
          totalPosts += 1;
          if (rec.value.embed?.["$type"] === "app.bsky.embed.images") {
            postsWithImages += 1;
            const hasAltText = rec.value.embed.images.some(img => img.alt?.trim());
            if (hasAltText) postsWithAltText += 1;
          }
        } else if (!excludeReplies) {
          totalPosts += 1;
          if (rec.value.embed?.["$type"] === "app.bsky.embed.images") {
            postsWithImages += 1;
            repliesWithImages += 1;
            const hasAltText = rec.value.embed.images.some(img => img.alt?.trim());
            if (hasAltText) postsWithAltText += 1;
          }
        }
      } else {
        totalPosts += 1;
        if (rec.value.embed?.["$type"] === "app.bsky.embed.images") {
          postsWithImages += 1;
          const hasAltText = rec.value.embed.images.some(img => img.alt?.trim());
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

  // Animation code remains the same
  const baseSpeed = 0.10;
  const oscillationMin = 0;
  const oscillationMax = 100;
  const bounceRange = 10;

  const animateNeedle = (timestamp) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }
    const deltaTime = timestamp - lastTimestampRef.current;
    lastTimestampRef.current = timestamp;

    const randomFactor = 0.8 + Math.random() * 0.4;
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

  // Autocomplete functions remain the same
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
    if (!selectedSuggestion) {
      debouncedFetchSuggestions(username);
    }
  }, [username, debouncedFetchSuggestions, selectedSuggestion]);

  const renderTextResults = (analysisResult) => (
    <div>
      <p><strong>{analysisResult.totalPosts}</strong> posts analyzed</p>
      <p><strong>{analysisResult.postsWithImages}</strong> contain images</p>
      <p><strong>{analysisResult.repliesWithImages}</strong> are replies</p>
      <p><strong>{analysisResult.postsWithAltText}</strong> posts have alt text</p>
      {analysisResult.postsWithImages > 0 ? (
        <h2>Score: {analysisResult.altTextPercentage.toFixed(2)}% {analysisResult.emoji}</h2>
      ) : (
        <h2>No images found!</h2>
      )}
    </div>
  );

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

      const analysisResult = analyzePosts(records, excludeReplies, did);
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
      const newAnalysis = analyzePosts(allRecords, excludeReplies, actorDID);
      setAnalysis(newAnalysis);
      setTextResults(renderTextResults(newAnalysis));
      updateGauge(newAnalysis.altTextPercentage);
    }
  }, [excludeReplies, allRecords, actorDID]);

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
                  `My alt text rating score is ${analysis?.altTextPercentage?.toFixed(2)}% ${analysis?.emoji}\n\n${analysis?.totalPosts} posts analyzed,\n${analysis?.postsWithImages} contain images,\n${analysis?.postsWithAltText} have alt text...\n\nGet your Bluesky alt text rating here: https://cred.blue/alt-text`
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
                checked={excludeReplies}
                onChange={(e) => setExcludeReplies(e.target.checked)}
              />
              <span className="checkbox-indicator"></span>
              Exclude Replies
            </label>
          </div>
          <button 
            className="full-analysis-button" 
            type="button"
            onClick={() => navigate(`/${username}`)}
          >
            View Full Analysis
          </button>
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