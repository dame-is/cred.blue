// frontend/src/components/AltTextCard.jsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed
import "./AltTextCard.css"; // Optional: add specific styles for AltTextCard

const emojis = ["☹️", "😐", "🙂", "☺️"];

const AltTextCard = () => {
  const accountData = useContext(AccountDataContext);
  const [analysis, setAnalysis] = useState(null);
  const [renderedPercentage, setRenderedPercentage] = useState(0);

  // Ref to store the current animation frame ID
  const animationFrameRef = useRef(null);

  // Ref to store the previous percentage for smooth animation
  const previousPercentageRef = useRef(0);

  useEffect(() => {
    if (
      accountData &&
      accountData.activityAll &&
      accountData.activityAll["app.bsky.feed.post"]
    ) {
      const postStats = accountData.activityAll["app.bsky.feed.post"];
      const filteredAnalysis = computeAnalysis(postStats);
      setAnalysis(filteredAnalysis);
      animateGauge(filteredAnalysis.altTextPercentage);
    }

    // Cleanup function to cancel any ongoing animation when the component unmounts or dependencies change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [accountData]);

  const computeAnalysis = (postStats) => {
    const {
      postsWithImages,
      imagePostsPerDay,
      imagePostsAltText,
      imagePostsNoAltText,
      altTextPercentage,
      imagePostsReplies,
    } = postStats;

    let emoji = emojis[0];
    if (altTextPercentage >= 75) {
      emoji = emojis[3];
    } else if (altTextPercentage >= 50) {
      emoji = emojis[2];
    } else if (altTextPercentage >= 25) {
      emoji = emojis[1];
    }

    return {
      postsWithImages,
      imagePostsPerDay,
      imagePostsAltText,
      imagePostsNoAltText,
      altTextPercentage,
      imagePostsReplies,
      emoji,
    };
  };

  const animateGauge = (targetPercentage) => {
    const duration = 1000; // Animation duration in milliseconds
    const startTime = performance.now();
    const startPercentage = previousPercentageRef.current;
    const endPercentage = targetPercentage;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Ensure progress doesn't exceed 1
      const currentPercentage =
        startPercentage + (endPercentage - startPercentage) * progress;
      setRenderedPercentage(currentPercentage);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        previousPercentageRef.current = endPercentage; // Update the previous percentage
      }
    };

    // Cancel any ongoing animation before starting a new one
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  if (!accountData || !analysis) {
    return <div className="alt-text-card">Loading alt text statistics...</div>;
  }

  return (
    <div className="alt-text-card">
      <h2>Alt Text Statistics</h2>
      <ul>
        <li>
          <strong>Posts with Images:</strong> {analysis.postsWithImages}
        </li>
        <li>
          <strong>Image Posts per Day:</strong> {analysis.imagePostsPerDay}
        </li>
        <li>
          <strong>Image Posts with Alt Text:</strong> {analysis.imagePostsAltText}
        </li>
        <li>
          <strong>Image Posts without Alt Text:</strong> {analysis.imagePostsNoAltText}
        </li>
        <li>
          <strong>Alt Text Percentage:</strong> {analysis.altTextPercentage.toFixed(2)}% {analysis.emoji}
        </li>
        <li>
          <strong>Image Posts (Replies):</strong> {analysis.imagePostsReplies}
        </li>
      </ul>
      <div className="gauge-container">
        <svg className="gauge-svg" viewBox="0 0 400 300">
          {/* Quadrants for the gauge */}
          <path d="M50,300 A150,150 0 0,1 93.93,193.93 L200,300 Z" fill="#ff0000" />
          <path d="M93.93,193.93 A150,150 0 0,1 200,150 L200,300 Z" fill="#ff9900" />
          <path d="M200,150 A150,150 0 0,1 306.07,193.93 L200,300 Z" fill="#ffff66" />
          <path d="M306.07,193.93 A150,150 0 0,1 350,300 L200,300 Z" fill="#00cc00" />
          {/* Center pivot circle */}
          <circle cx="200" cy="300" r="10" fill="#000" />
          {/* Needle group with pivot at (200,300) */}
          <g
            id="needle-group"
            className="needle-group"
            transform={`rotate(${(renderedPercentage / 100) * 180},200,300)`}
          >
            {/* Needle from (200,300) to (50,300) */}
            <line
              id="needle"
              x1="200"
              y1="300"
              x2="50"
              y2="300"
              stroke="#000"
              strokeWidth="7"
            />
          </g>
        </svg>
      </div>
      <p>
        <a href="https://bsky.app/profile/cred.blue" target="_blank" rel="noopener noreferrer">
          Discover more tools: @cred.blue
        </a>
      </p>
    </div>
  );
};

export default AltTextCard;
