// src/components/MainApp/MainApp.jsx

import React, { useState, useContext } from "react";
import ScoreForm from "../ScoreForm";
import ScoreResult from "../ScoreResult";
import "./MainApp.css";
import { AuthContext } from "../../AuthContext";

const MainApp = () => {
  const { isAuthenticated, userHandle, loading } = useContext(AuthContext);
  const [result, setResult] = useState(null);
  const [loadingScores, setLoadingScores] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [scoreStoredToday, setScoreStoredToday] = useState(false);



  const fetchScores = async (identities) => {
    setLoadingScores(true);
    setResult(null);
    setError(null);

    try {
      const apiUrl = "http://localhost:5001/api/score"; // Use relative path due to proxy setup

      if (comparisonMode && identities.length === 2) {
        // Fetch scores for two identities in comparison mode
        const responses = await Promise.all(
          identities.map(async (identity) => {
            const response = await fetch("http://localhost:5001/api/scorecomparison", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ identity }),
              credentials: "include", // Include cookies in requests
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Failed to fetch scores for ${identity}.`);
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
          credentials: "include", // Include cookies in requests
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch scores for ${identities[0]}.`);
        }

        const data = await response.json();
        setResult(data); // Set single result

        // Check if the score was successfully stored today
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const recordKey = `${today}`;
        const recordExists = await checkRecordExists(recordKey);
        setScoreStoredToday(recordExists);
      } else {
        throw new Error("Please provide at least one valid identity.");
      }
    } catch (err) {
      console.error("Error fetching scores:", err);
      setError(err.message);
    } finally {
      setLoadingScores(false);
    }
  };

  // Function to check if a score record exists for today
  const checkRecordExists = async (recordKey) => {
    try {
      const response = await fetch(`/api/checkRecord?recordKey=${recordKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in requests
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check existing score record.");
      }
  
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking record existence:", error);
      return false; // Assume it doesn't exist on error
    }
  };

  const toggleComparisonMode = (e) => {
    setComparisonMode(e.target.checked);
    setResult(null); // Reset results when toggling mode
    setScoreStoredToday(false); // Reset score stored flag
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to view your scores.</div>;
  }

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
        <ScoreForm
          onSubmit={fetchScores}
          comparisonMode={comparisonMode}
          defaultIdentity={userHandle} // Pass the userHandle as defaultIdentity
          scoreStoredToday={scoreStoredToday && !comparisonMode} // Only disable in non-comparison mode
        />
        {error && <p className="error">{error}</p>}
        <ScoreResult result={result} loading={loadingScores} />
      </main>
    </>
  );
};

export default MainApp;
