// frontend/src/components/CompareScores/CompareScoresResults.js

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
import PropTypes from "prop-types";
import "./CompareScores.css"; // Adjust the CSS path as needed

const CompareScoresResults = ({ result, loading }) => {
  // State for toggling which scores to display
  const [showBluesky, setShowBluesky] = useState(true);
  const [showAtproto, setShowAtproto] = useState(true);
  const [, setActiveHandle] = useState(null);

  // Keep track of whether the component is mounted
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetActiveHandle = useCallback((handle) => {
    if (isMounted.current && typeof setActiveHandle === "function") {
      setActiveHandle(handle);
    }
  }, []);

  useEffect(() => {
    console.log("CompareScoresResults received:", result);
  }, [result]);

  if (loading) {
    return (
      <div className="score-result">
        {/* Loading Skeleton */}
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

  // Determine if we are in comparison mode
  const isComparison = Array.isArray(result);

  /**
   * Extracts the actual score data from the object.
   * If the object contains an "accountData90Days" property, we use that.
   * Otherwise, we assume the object itself is the score data.
   */
  const extractData = (scoreObj) => {
    if (scoreObj.accountData90Days) {
      return {
        scoreData: scoreObj.accountData90Days,
        breakdownData: scoreObj.accountData90Days.breakdown || {},
      };
    }
    return {
      scoreData: scoreObj,
      breakdownData: scoreObj.breakdown || {},
    };
  };

  // Render a breakdown summary from an object of key/value pairs.
  const renderBreakdownSummary = (breakdownData) => {
    if (!breakdownData || Object.keys(breakdownData).length === 0) {
      return <p>No breakdown data available.</p>;
    }
    return (
      <ul>
        {Object.entries(breakdownData).map(([key, value]) => (
          <li key={key}>
            {key}:{" "}
            {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
          </li>
        ))}
      </ul>
    );
  };

  // Render the score breakdown for one identity.
  const renderScoreBreakdown = (scoreObj, label) => {
    const { scoreData, breakdownData } = extractData(scoreObj);
    const { handle = "Unknown Handle" } = scoreData;
    return (
      <div className="score-breakdown" key={label}>
        <h3 className="score-breakdown-header">{handle}</h3>
        <div className="breakdown-section">
          <h4>Score Breakdown</h4>
          {renderBreakdownSummary(breakdownData)}
        </div>
      </div>
    );
  };

  // Render the toggle checkboxes.
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

  // Custom tooltip for the chart.
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="label">
            <strong>{dataPoint.handle || "Unknown Handle"}</strong>
          </p>
          {showBluesky && <p>{`Bluesky Score: ${dataPoint.Bluesky || 0}`}</p>}
          {showAtproto && <p>{`Atproto Score: ${dataPoint.Atproto || 0}`}</p>}
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

  // Render a chart for a single identity.
  const renderSingleChart = (scoreObj) => {
    const { scoreData } = extractData(scoreObj);
    const {
      handle = "Unknown Handle",
      blueskyScore,
      atprotoScore,
      combinedScore,
      scoreGeneratedAt,
    } = scoreData;
    const chartData = [
      {
        handle,
        Bluesky: blueskyScore || 0,
        Atproto: atprotoScore || 0,
        Combined: combinedScore || 0,
        scoreGeneratedAt: scoreGeneratedAt || new Date().toISOString(),
      },
    ];
    return (
      <div className="single-chart">
        <h3>Score Overview</h3>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showBluesky && <Bar dataKey="Bluesky" stackId="a" fill="#007bff" />}
            {showAtproto && <Bar dataKey="Atproto" stackId="a" fill="#28a745" />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render a comparison chart when two identities are being compared.
  const renderComparisonChart = () => {
    if (isComparison && Array.isArray(result) && result.length === 2) {
      const chartData = result.map((scoreObj) => {
        const { scoreData } = extractData(scoreObj);
        const {
          handle = "Unknown Handle",
          blueskyScore,
          atprotoScore,
          combinedScore,
          scoreGeneratedAt,
        } = scoreData;
        return {
          handle,
          Bluesky: blueskyScore || 0,
          Atproto: atprotoScore || 0,
          Combined: combinedScore || 0,
          scoreGeneratedAt: scoreGeneratedAt || new Date().toISOString(),
        };
      });
      return (
        <div className="comparison-chart">
          <h3>Score Comparison</h3>
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
              <Tooltip content={<CustomTooltip />} />
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

  // Render a high-level comparison summary based on the combined scores.
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
              <strong>{first.handle || "Unknown Handle"}</strong> has a combined score of{" "}
              <strong>{Math.ceil(firstScore)}</strong>.
            </p>
            <p>
              <strong>{second.handle || "Unknown Handle"}</strong> has a combined score of{" "}
              <strong>{Math.ceil(secondScore)}</strong>.
            </p>
            <p>
              {firstScore > secondScore ? (
                <span>
                  <strong>{first.handle || "First User"}</strong> is ranked higher.
                </span>
              ) : firstScore < secondScore ? (
                <span>
                  <strong>{second.handle || "Second User"}</strong> is ranked higher.
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

  // Choose which chart to render: single or comparison.
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

  // Render breakdown details for each identity.
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
    <div className={`score-result ${isComparison ? "comparison-mode" : ""}`}>
      {renderChart()}
      <div className="score-breakdowns">{renderAllBreakdowns()}</div>
    </div>
  );
};

CompareScoresResults.propTypes = {
  result: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        // Note: The shape here is not enforced strictly because we extract the inner data.
      })
    ),
    PropTypes.shape({}),
  ]),
  loading: PropTypes.bool.isRequired,
};

export default CompareScoresResults;
