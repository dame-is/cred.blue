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
import PropTypes from "prop-types"; // Import PropTypes for type checking
import "./ScoreResult.css";

const ScoreResult = ({ result, loading }) => {
  // State Hooks
  const [showBluesky, setShowBluesky] = useState(true);
  const [showAtproto, setShowAtproto] = useState(true);
  const [, setActiveHandle] = useState(null);

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

  // Debugging: Log the received result prop
  useEffect(() => {
    console.log("ScoreResult received:", result);
  }, [result]);

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
   * Determine if result is array or single object.
   */
  const isComparison = Array.isArray(result);

  /**
   * Function to extract score data and breakdown from a single score object
   * @param {Object} scoreObj - Single score object.
   * @returns {Object} - { scoreData, breakdownData }
   */
  const extractData = (scoreObj) => {
    // If the scoreObj has 'data' and 'breakdown', use them
    if (scoreObj.data && scoreObj.breakdown) {
      return {
        scoreData: scoreObj.data,
        breakdownData: scoreObj.breakdown,
      };
    }
    // Else, assume scoreObj itself has data fields and breakdown
    return {
      scoreData: scoreObj,
      breakdownData: scoreObj.breakdown || {},
    };
  };

  /**
   * Renders the score breakdown sections for a given identity.
   * @param {Object} scoreObj - The result data for a single identity.
   * @param {String} label - A unique label to prevent key conflicts.
   */
  const renderScoreBreakdown = (scoreObj, label) => {
    const { scoreData, breakdownData } = extractData(scoreObj);

    // Directly extract handle from scoreData
    const { handle = "Unknown Handle" } = scoreData;

    // Safeguard against missing breakdown sections
    const blueskyBreakdown = breakdownData.bluesky || [];
    const atprotoBreakdown = breakdownData.atproto || [];

    return (
      <div className="score-breakdown" key={label}>
        {/* Username Header */}
        <h3 className="score-breakdown-header">{handle}</h3>

        {/* Bluesky Score Breakdown */}
        <div className="breakdown-section">
          <h4>Bluesky Score Breakdown</h4>
          {blueskyBreakdown.length > 0 ? (
            <ul>
              {blueskyBreakdown.map((item, index) => (
                <li key={`${label}-bluesky-${index}`}>
                  {item.description}: {Math.ceil(item.points)} points
                  {(item.value || item.details) && (
                    <span>
                      {" "}
                      (
                      {item.value
                        ? item.value
                        : item.details
                        ? item.details
                        : ""}
                      )
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No Bluesky score breakdown available.</p>
          )}
        </div>

        {/* Atproto Score Breakdown */}
        <div className="breakdown-section">
          <h4>AT Proto Score Breakdown</h4>
          {atprotoBreakdown.length > 0 ? (
            <ul>
              {atprotoBreakdown.map((item, index) => (
                <li key={`${label}-atproto-${index}`}>
                  {item.description}: {Math.ceil(item.points)} points
                  {(item.value || item.details) && (
                    <span>
                      {" "}
                      (
                      {item.value
                        ? item.value
                        : item.details
                        ? item.details
                        : ""}
                      )
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No AT Proto score breakdown available.</p>
          )}
        </div>
      </div>
    );
  };

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
        Show AT Proto Score
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
          <p className="label">
            <strong>{dataPoint.handle || "Unknown Handle"}</strong>
          </p>
          {showBluesky && (
            <p>{`Bluesky Score: ${dataPoint.Bluesky || 0}`}</p>
          )}
          {showAtproto && (
            <p>{`AT Proto Score: ${dataPoint.Atproto || 0}`}</p>
          )}
          <p>{`Combined Score: ${dataPoint.Combined || 0}`}</p>
        </div>
      );
    }
    return null;
  };

  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array,
    label: PropTypes.string,
  };

  /**
   * Renders the score chart for single mode.
   * @param {Object} scoreObj - The result data for a single identity.
   */
  const renderSingleChart = (scoreObj) => {
    const { scoreData } = extractData(scoreObj);

    const { handle = "Unknown Handle", blueskyScore, atprotoScore, combinedScore, generatedAt } = scoreData;

    // Prepare data for Recharts
    const chartData = [
      {
        handle: handle,
        Bluesky: blueskyScore || 0,
        Atproto: atprotoScore || 0,
        Combined: combinedScore || 0,
        generatedAt: generatedAt || new Date().toISOString(),
      },
    ];

    console.log("Single Chart Data:", chartData);

    return (
      <div className="single-chart">
        <h3>Score Overview</h3>
        {/* Render Checkboxes */}
        {renderCheckboxes()}
        <ResponsiveContainer width="100%" height={300}>
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
            {showBluesky && (
              <Bar dataKey="Bluesky" stackId="a" fill="#3B9AF8" />
            )}
            {showAtproto && (
              <Bar dataKey="Atproto" stackId="a" fill="#28a745" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  /**
   * Renders the score chart for comparison mode.
   */
  const renderComparisonChart = () => {
    if (isComparison && Array.isArray(result) && result.length === 2) {
      // Prepare data for Recharts
      const chartData = result.map((scoreObj) => {
        const { scoreData } = extractData(scoreObj);
        const { handle = "Unknown Handle", blueskyScore, atprotoScore, combinedScore, generatedAt } = scoreData;

        return {
          handle: handle,
          Bluesky: blueskyScore || 0,
          Atproto: atprotoScore || 0,
          Combined: combinedScore || 0,
          generatedAt: generatedAt || new Date().toISOString(),
        };
      });

      console.log("Comparison Chart Data:", chartData);

      return (
        <div className="comparison-chart">
          <h3>Score Comparison</h3>
          {/* Render Checkboxes */}
          {renderCheckboxes()}
          <ResponsiveContainer width="100%" height={300}>
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
              {showBluesky && (
                <Bar dataKey="Bluesky" stackId="a" fill="#3B9AF8" />
              )}
              {showAtproto && (
                <Bar dataKey="Atproto" stackId="a" fill="#28a745" />
              )}
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
    if (isComparison && Array.isArray(result) && result.length === 2) {
      const [first, second] = result.map((scoreObj) => extractData(scoreObj).scoreData);

      const firstScore = first.combinedScore || 0;
      const secondScore = second.combinedScore || 0;

      return (
        <div className="comparison-summary">
          <div className="comparison-summary-text">
            <h3>High-Level Comparison</h3>
            <p>
              <strong>{first.handle || "Unknown Handle"}</strong> has a
              combined score of <strong>{Math.ceil(firstScore.toFixed(2))}</strong>.
            </p>
            <p>
              <strong>{second.handle || "Unknown Handle"}</strong> has a
              combined score of <strong>{Math.ceil(secondScore.toFixed(2))}</strong>.
            </p>
            <p>
              {firstScore > secondScore ? (
                <span>
                  <strong>{first.handle || "First User"}</strong> is
                  ranked higher.
                </span>
              ) : firstScore < secondScore ? (
                <span>
                  <strong>{second.handle || "Second User"}</strong> is
                  ranked higher.
                </span>
              ) : (
                <span>Both scores are equal!</span>
              )}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  /**
   * Renders the score chart (single or comparison mode).
   */
  const renderChart = () => {
    if (isComparison && Array.isArray(result)) {
      return (
        <>
          {renderComparisonChart()}
          {renderComparisonSummary()}
        </>
      );
    } else {
      return renderSingleChart(result);
    }
  };

  /**
   * Renders the score breakdowns for all identities.
   */
  const renderAllBreakdowns = () => {
    if (isComparison && Array.isArray(result)) {
      return result.map((scoreObj, index) =>
        renderScoreBreakdown(scoreObj, `comparison-${index}`)
      );
    } else {
      return renderScoreBreakdown(result, "single");
    }
  };

  return (
    <div
      className={`score-result ${isComparison ? "comparison-mode" : ""}`}
    >
      {renderChart()}
      <div className="score-breakdowns">{renderAllBreakdowns()}</div>
    </div>
  );
};

// Define PropTypes for type checking
ScoreResult.propTypes = {
  result: PropTypes.oneOfType([
    // Comparison Mode: Array of score objects
    PropTypes.arrayOf(
      PropTypes.shape({
        handle: PropTypes.string.isRequired,
        did: PropTypes.string.isRequired,
        blueskyScore: PropTypes.number.isRequired,
        atprotoScore: PropTypes.number.isRequired,
        combinedScore: PropTypes.number.isRequired,
        generatedAt: PropTypes.string.isRequired,
        breakdown: PropTypes.shape({
          bluesky: PropTypes.arrayOf(
            PropTypes.shape({
              description: PropTypes.string.isRequired,
              points: PropTypes.number.isRequired,
              value: PropTypes.string,
              details: PropTypes.string,
            })
          ),
          atproto: PropTypes.arrayOf(
            PropTypes.shape({
              description: PropTypes.string.isRequired,
              points: PropTypes.number.isRequired,
              value: PropTypes.string,
              details: PropTypes.string,
            })
          ),
        }).isRequired,
      })
    ),
    // Single Mode: Single score object
    PropTypes.shape({
      handle: PropTypes.string.isRequired,
      did: PropTypes.string.isRequired,
      blueskyScore: PropTypes.number.isRequired,
      atprotoScore: PropTypes.number.isRequired,
      combinedScore: PropTypes.number.isRequired,
      generatedAt: PropTypes.string.isRequired,
      breakdown: PropTypes.shape({
        bluesky: PropTypes.arrayOf(
          PropTypes.shape({
            description: PropTypes.string.isRequired,
            points: PropTypes.number.isRequired,
            value: PropTypes.string,
            details: PropTypes.string,
          })
        ),
        atproto: PropTypes.arrayOf(
          PropTypes.shape({
            description: PropTypes.string.isRequired,
            points: PropTypes.number.isRequired,
            value: PropTypes.string,
            details: PropTypes.string,
          })
        ),
      }).isRequired,
    }),
  ]),
  loading: PropTypes.bool.isRequired,
};

export default ScoreResult;
