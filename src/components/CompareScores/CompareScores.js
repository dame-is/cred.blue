import React, { useState } from "react";
import CompareScoresResults from "./CompareScoresResults";
// Adjust the import path for your score data module as needed:
import { loadAccountData } from "../../accountData";

const CompareScores = () => {
  const [username1, setUsername1] = useState("");
  const [username2, setUsername2] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username1 || !username2) {
      setError("Please enter both usernames.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Fetch the account data for both usernames
      const data1 = await loadAccountData(username1);
      const data2 = await loadAccountData(username2);
      // Pass the two results as an array for comparison mode
      setResults([data1, data2]);
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError("Error fetching account data. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="compare-scores-page">
      <h2>Compare Scores</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Username 1:
            <input
              type="text"
              value={username1}
              onChange={(e) => setUsername1(e.target.value)}
              placeholder="e.g., alice.bsky.social"
            />
          </label>
        </div>
        <div>
          <label>
            Username 2:
            <input
              type="text"
              value={username2}
              onChange={(e) => setUsername2(e.target.value)}
              placeholder="e.g., bob.bsky.social"
            />
          </label>
        </div>
        <button type="submit">Compare</button>
      </form>
      {error && <div className="error" style={{ color: "red" }}>{error}</div>}
      {loading && <div>Loading...</div>}
      {results && <CompareScoresResults result={results} loading={loading} />}
    </div>
  );
};

export default CompareScores;
