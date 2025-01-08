// src/components/ScoreResult.js

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./ScoreResult.css";

const ScoreResult = ({ result, loading }) => {
  // State Hooks
  const [showBluesky, setShowBluesky] = useState(true);
  const [showAtproto, setShowAtproto] = useState(true);
  const [activeHandle, setActiveHandle] = useState(null);

  // Ref to track if the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Safe state updater to prevent setting state on unmounted components
  const safeSetActiveHandle = useCallback((handle) => {
    if (isMounted.current && typeof setActiveHandle === "function") {
      setActiveHandle(handle);
    }
  }, []);

  if (loading) {
    return (
      <div className="score-result">
        {/* Loading Skeletons */}
        <div className="loading-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-bar"></div>
          <div className="skeleton-paragraph"></div>
          <div className="skeleton-paragraph"></div>
          <div className="skeleton-paragraph"></div>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-bar"></div>
          <div className="skeleton-paragraph"></div>
          <div className="skeleton-paragraph"></div>
          <div className="skeleton-paragraph"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  if (result.error) {
    return <div className="error">Error: {result.error}</div>;
  }

  /**
   * Renders the score breakdown sections for a given identity.
   * @param {Object} data - The result data for a single identity.
   * @param {String} label - A unique label to prevent key conflicts.
   */
  const renderScoreBreakdown = (data, label) => (
    <div className="score-breakdown" key={label}>
      {/* Username Header */}
      <h3 className="score-breakdown-header">{data.metadata.handle}</h3>

      {/* Bluesky Score Breakdown */}
      <div className="breakdown-section">
        <h4>Bluesky Score Breakdown</h4>
        <ul>
          {data.breakdown.bluesky.map((item, index) => (
            <li key={`${label}-bluesky-${index}`}>
              {item.description}: Math.ceil({item.points}) points
              {item.value && <span> ({item.value})</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Atproto Score Breakdown */}
      <div className="breakdown-section">
        <h4>Atproto Score Breakdown</h4>
        <ul>
          {data.breakdown.atproto.map((item, index) => (
            <li key={`${label}-atproto-${index}`}>
              {item.description}: Math.ceil({item.points}) points
              {item.value && <span> ({item.value})</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  /**
   * Renders the score toggle checkboxes.
   */
  const renderCheckboxes = () => (
    <div className="score-toggle-controls">
      <label>
        <input
          type="checkbox"
          checked={showBluesky}
          onChange={() => setShowBluesky((prev) => !prev)}
        />
        Show Bluesky Score
      </label>
      <label>
        <input
          type="checkbox"
          checked={showAtproto}
          onChange={() => setShowAtproto((prev) => !prev)}
        />
        Show Atproto Score
      </label>
    </div>
  );

  /**
   * Custom Tooltip Component for Recharts
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload; // Assuming first payload contains necessary data
      return (
        <div className="custom-tooltip">
          <p className="label"><strong>{dataPoint.handle}</strong></p>
          {showBluesky && <p>{`Bluesky Score: ${dataPoint.Bluesky}`}</p>}
          {showAtproto && <p>{`Atproto Score: ${dataPoint.Atproto}`}</p>}
          <p>{`Combined Score: ${dataPoint.Combined}`}</p>
        </div>
      );
    }
    return null;
  };

  /**
   * Renders the score chart for single mode.
   * @param {Object} data - The result data for a single identity.
   */
  const renderSingleChart = (data) => {
    // Prepare data for Recharts
    const chartData = [
      {
        handle: data.metadata.handle,
        Bluesky: data.blueskyScore,
        Atproto: data.atprotoScore,
        Combined: data.combinedScore,
      },
    ];

    return (
      <div className="single-chart">
        <h3>Score Breakdown</h3>
        {/* Render Checkboxes */}
        {renderCheckboxes()}
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            onMouseMove={(state) => {
              if (state.isTooltipActive && state.activeLabel) {
                safeSetActiveHandle(state.activeLabel);
              } else {
                safeSetActiveHandle(null);
              }
            }}
            onMouseLeave={() => safeSetActiveHandle(null)}
          >
            <XAxis dataKey="handle" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} /> {/* Use Custom Tooltip */}
            <Legend />
            {showBluesky && <Bar dataKey="Bluesky" stackId="a" fill="#007bff" />}
            {showAtproto && <Bar dataKey="Atproto" stackId="a" fill="#28a745" />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  /**
   * Renders the score chart for comparison mode.
   */
  const renderComparisonChart = () => {
    if (Array.isArray(result) && result.length === 2) {
      // Prepare data for Recharts
      const chartData = result.map((data) => ({
        handle: data.metadata.handle,
        Bluesky: data.blueskyScore,
        Atproto: data.atprotoScore,
        Combined: data.combinedScore,
      }));

      return (
        <div className="comparison-chart">
          <h3>Score Comparison</h3>
          {/* Render Checkboxes */}
          {renderCheckboxes()}
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              onMouseMove={(state) => {
                if (state.isTooltipActive && state.activeLabel) {
                  safeSetActiveHandle(state.activeLabel);
                } else {
                  safeSetActiveHandle(null);
                }
              }}
              onMouseLeave={() => safeSetActiveHandle(null)}
            >
              <XAxis dataKey="handle" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} /> {/* Use Custom Tooltip */}
              <Legend />
              {showBluesky && <Bar dataKey="Bluesky" stackId="a" fill="#007bff" />}
              {showAtproto && <Bar dataKey="Atproto" stackId="a" fill="#28a745" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    return null;
  };

  /**
   * Renders the comparison summary.
   */
  const renderComparisonSummary = () => {
    if (Array.isArray(result) && result.length === 2) {
      const [first, second] = result;

      return (
        <div className="comparison-summary">
          <h3>High-Level Comparison</h3>
          <p>
            <strong>{first.metadata.handle}</strong> has a combined score of{" "}
            <strong>{first.combinedScore.toFixed(2)}</strong>.
          </p>
          <p>
            <strong>{second.metadata.handle}</strong> has a combined score of{" "}
            <strong>{second.combinedScore.toFixed(2)}</strong>.
          </p>
          <p>
            {first.combinedScore > second.combinedScore ? (
              <span>
                <strong>{first.metadata.handle}</strong> is ranked higher.
              </span>
            ) : first.combinedScore < second.combinedScore ? (
              <span>
                <strong>{second.metadata.handle}</strong> is ranked higher.
              </span>
            ) : (
              <span>Both scores are equal!</span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="score-result">
      {Array.isArray(result) ? (
        <div className="comparison-mode">
          <div className="comparison-extras">
            {renderComparisonChart()}
            {renderComparisonSummary()}
          </div>
          <div className="score-breakdowns">
            {/* Render breakdowns for both identities */}
            {result.map((data, index) => (
              <div key={`comparison-${index}`}>
                {renderScoreBreakdown(data, `comparison-${index}`)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="single-mode">
          {renderSingleChart(result)}
          {/* Render breakdown for single identity */}
          {renderScoreBreakdown(result, "single")}
        </div>
      )}
    </div>
  );
};

export default ScoreResult;
