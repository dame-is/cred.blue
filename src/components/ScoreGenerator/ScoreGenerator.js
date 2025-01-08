// src/components/MainApp/MainApp.jsx

import React, { useState } from "react";
import ScoreForm from "../ScoreForm";
import ScoreResult from "../ScoreResult";
import "./MainApp.css"; // Ensure you have appropriate styles

const MainApp = ({ agent, onLogout }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const fetchScores = async (identities) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const apiUrl = `${backendUrl}/api/score`; // Consider using environment variables

      if (comparisonMode && identities.length === 2) {
        // Fetch scores for two identities in comparison mode
        const responses = await Promise.all(
          identities.map(async (identity) => {
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ identity }),
            });

            if (!response.ok) {
              throw new Error(
                `Failed to fetch scores for ${identity}. Please check the backend server.`
              );
            }

            return response.json();
          })
        );

        setResult(responses); // Set both results as an array
      } else if (identities.length === 1) {
        // Fetch score for a single identity
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identity: identities[0] }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch scores for ${identities[0]}. Please check the backend server.`
          );
        }

        const data = await response.json();
        setResult(data); // Set single result
      } else {
        throw new Error("Please provide at least one valid identity.");
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleComparisonMode = (e) => {
    setComparisonMode(e.target.checked);
    setResult(null); // Reset results when toggling mode
  };

  return (
    <>
      {/* Main Content */}
      <main className="main-app">
        <div className="mode-toggle">
          <label>
            <input
              type="checkbox"
              checked={comparisonMode}
              onChange={toggleComparisonMode}
            />
            Enable Comparison Mode
          </label>
        </div>
        <ScoreForm onSubmit={fetchScores} comparisonMode={comparisonMode} />
        {error && <p className="error">{error}</p>}
        <ScoreResult result={result} loading={loading} />
      </main>
    </>
  );
};

export default MainApp;
