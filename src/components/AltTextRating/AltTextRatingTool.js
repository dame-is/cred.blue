// frontend/src/pages/AltTextRatingTool.js

import React, { useState, useEffect, useRef } from 'react';
import './AltTextRatingTool.css'; // Create a CSS file to include your styles

const PUBLIC_API_URL = "https://public.api.bsky.app";
// Define the static minimum date (as in your original script)
const STATIC_MIN_DATE = new Date("2023-04-22T12:01:00Z");

const AltTextRatingTool = () => {
  // Form and analysis states
  const [username, setUsername] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [actorDID, setActorDID] = useState('');
  const [loading, setLoading] = useState(false);
  // Controlled checkboxes:
  const [useLast90Days, setUseLast90Days] = useState(false);
  const [excludeReplies, setExcludeReplies] = useState(false);
  // For showing the Share button after analysis
  const [shareButtonVisible, setShareButtonVisible] = useState(false);
  // For displaying text results (as JSX)
  const [textResults, setTextResults] = useState(null);

  // Ref for the gauge needle group in the SVG
  const needleGroupRef = useRef(null);

  // ----------------------------
  // Helper Functions (converted from your inline scripts)
  // ----------------------------

  // Remove directional formatting characters and resolve handle to DID.
  async function resolveHandleToDID(handle) {
    const cleanedHandle = handle.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
    const res = await fetch(`${PUBLIC_API_URL}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(cleanedHandle)}`);
    const data = await res.json();
    if (data.did) return data.did;
    throw new Error("Invalid username. Please try again without including the '@' symbol before the domain.");
  }

  // Fetch the service endpoint given a DID.
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

  // A simple check for “reply to self”
  function isReplyToSelf(rec, actor) {
    return (
      rec.value.reply &&
      rec.value.reply.parent &&
      rec.value.reply.parent.author &&
      rec.value.reply.parent.author.did === actor
    );
  }

  // Analyze posts (using similar logic to your original analyzePosts function).
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

  // Update the gauge needle based on the given percentage.
  const updateGauge = (percentage) => {
    const angleDeg = (percentage / 100) * 180;
    if (needleGroupRef.current) {
      needleGroupRef.current.setAttribute("transform", `rotate(${angleDeg},200,300)`);
    }
  };

  // Update the share button action (opens an intent URL in a new tab)
  const handleShare = () => {
    if (!analysis) return;
    const shareText =
      `My alt text rating score is ${analysis.altTextPercentage.toFixed(2)}% ${analysis.emoji}\n\n` +
      `${analysis.totalPosts} posts analyzed,\n` +
      `${analysis.postsWithImages} contain images,\n` +
      `${analysis.postsWithAltText} have alt text...\n\n` +
      `Get your Bluesky alt text rating here: dame.is/ratingalttext`;
    const intentUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`;
    window.open(intentUrl, '_blank');
  };

  // Build a JSX fragment to display text analysis results.
  const renderTextResults = (analysisResult) => (
    <div>
      <p>{analysisResult.totalPosts} posts analyzed</p>
      <p>{analysisResult.postsWithImages} contain images</p>
      <p>{analysisResult.repliesWithImages} are replies</p>
      <p>{analysisResult.postsWithAltText} posts have alt text</p>
      <h2>Score: {analysisResult.altTextPercentage.toFixed(2)}% {analysisResult.emoji}</h2>
    </div>
  );

  // ----------------------------
  // Event Handlers
  // ----------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setShareButtonVisible(false);
    setAnalysis(null);
    setTextResults(null);

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
    } catch (error) {
      setTextResults(<p style={{ color: 'red' }}>Error: {error.message}</p>);
      updateGauge(0);
    }
    setLoading(false);
  }

  // When checkbox states change and we already have records, re-run the analysis.
  useEffect(() => {
    if (allRecords.length > 0 && actorDID) {
      const newAnalysis = analyzePosts(allRecords, useLast90Days, excludeReplies, actorDID);
      setAnalysis(newAnalysis);
      setTextResults(renderTextResults(newAnalysis));
      updateGauge(newAnalysis.altTextPercentage);
    }
  }, [useLast90Days, excludeReplies]);

  // ----------------------------
  // (Optional) Autocomplete logic could be added here via another useEffect or a separate component.
  // ----------------------------

  return (
    <div className="alt-text-rating-tool">
      {/* Alt Text Rating Form */}
      <div id="alt-text-rating-form" className="alt-card">
        <h1>Bluesky Alt Text Rating</h1>
        <p>How consistently do you use alt text?</p>
        <form className="search-bar" onSubmit={handleSubmit} autoComplete="off">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="(e.g., dame.bsky.social)"
              required
            />
            {/* Autocomplete suggestions can be rendered here if implemented */}
            <div id="autocomplete-list" className="autocomplete-items"></div>
          </div>
          <div className="action-row">
            <button type="submit">Analyze</button>
            <button type="button" onClick={handleShare} style={{ display: shareButtonVisible ? 'inline-block' : 'none' }}>
              Share Results
            </button>
          </div>
        </form>
        {/* Results */}
        <div className="results" style={{ display: analysis ? 'block' : 'none' }}>
          <div id="textResults">{textResults}</div>
          <div className="gauge-container">
            <svg className="gauge-svg" viewBox="0 0 400 300">
              {/* Quadrant paths */}
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
      {/* Extra Info Card */}
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
