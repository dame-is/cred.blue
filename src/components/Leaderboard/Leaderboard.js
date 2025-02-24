import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import './Leaderboard.css';

// Function to truncate handles that are too long
const truncateHandle = (handle, maxLength = 20) => {
  if (!handle) return '';
  if (handle.length <= maxLength) return handle;
  
  // For handles with domains, try to preserve the beginning and domain part
  if (handle.includes('.')) {
    const parts = handle.split('.');
    const domain = parts.slice(-2).join('.');
    const username = parts.slice(0, -2).join('.');
    
    // If username + domain is short enough, just return it
    if (username.length + domain.length + 1 <= maxLength) {
      return `${username}.${domain}`;
    }
    
    // Otherwise, truncate the username part
    const availableLength = maxLength - domain.length - 4; // Account for ellipsis and dot
    if (availableLength > 0) {
      return `${username.substring(0, availableLength)}...${domain}`;
    }
  }
  
  // For simple handles or fallback
  return `${handle.substring(0, maxLength - 3)}...`;
};

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [runnerUps, setRunnerUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreType, setScoreType] = useState('combined_score');

  const scoreTypes = {
    combined_score: 'Combined Score',
    bluesky_score: 'Bluesky Score',
    atproto_score: 'ATProto Score'
  };

  // Calculate protocol balance and determine which side has more activity
  const calculateProtocolBalance = (bskyRecords, nonBskyRecords) => {
    if (!bskyRecords && !nonBskyRecords) return { score: 50, leaning: 'neutral' };
    const total = bskyRecords + nonBskyRecords;
    if (total === 0) return { score: 50, leaning: 'neutral' };
    
    // Calculate the percentage of bsky records
    const bskyPercentage = (bskyRecords / total) * 100;
    
    // Return both the percentage and which side it leans towards
    return {
      score: bskyPercentage,
      leaning: bskyRecords > nonBskyRecords ? 'bsky' : 'atproto'
    };
  };

  const getBalanceDescription = (bskyRecords, nonBskyRecords) => {
    const { score, leaning } = calculateProtocolBalance(bskyRecords, nonBskyRecords);
    
    if (score >= 45 && score <= 55) return 'Balanced usage';
    if (leaning === 'bsky') {
      if (score > 90) return 'Almost entirely Bluesky';
      if (score > 75) return 'Heavily Bluesky';
      return 'Leans Bluesky';
    } else {
      if (score < 10) return 'Almost entirely ATProto';
      if (score < 25) return 'Heavily ATProto';
      return 'Leans ATProto';
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log(`Fetching leaderboard data for scoreType: ${scoreType}`);
      
      // Call the backend endpoint instead of directly querying Supabase
      const response = await fetch(`https://api.cred.blue/api/leaderboard?scoreType=${scoreType}&limit=100`);
      
      // Check for non-200 responses
      if (!response.ok) {
        let errorMessage;
        try {
          // Try to parse error JSON
          const errorData = await response.json();
          errorMessage = errorData.error || `Server error: ${response.status} ${response.statusText}`;
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      // Debug logging
      console.log(`Received ${data.topUsers?.length || 0} top users and ${data.runnerUps?.length || 0} runner ups`);
      
      setUsers(data.topUsers || []);
      setRunnerUps(data.runnerUps || []);
  
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [scoreType]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleScoreTypeChange = (type) => {
    setScoreType(type);
    setUsers([]);
    setRunnerUps([]);
  };

  const renderUserRow = (user, index, isRunnerUp = false) => (
    <tr key={user.handle} className={isRunnerUp ? 'runner-up' : ''}>
      <td className="rank-cell">#{index + 1}</td>
      <td>
        <a 
          href={`/${user.handle}`} 
          className="user-handle" 
          title={`@${user.handle}`} // Add title for hover to see full handle
        >
          @{truncateHandle(user.handle)}
        </a>
      </td>
      <td className="score-cell">
        {Math.round(user[scoreType] || 0)}
      </td>
      <td>
        <div className="balance-indicator">
          <div className="balance-track">
            <div 
              className="balance-bar"
              style={{
                left: `${calculateProtocolBalance(user.total_bsky_records, user.total_non_bsky_records).score}%`
              }}
            ></div>
            <div className="protocol-labels">
              <span className="at-proto-label">ATProto</span>
              <span className="bsky-label">Bluesky</span>
            </div>
          </div>
          <span className="balance-description">
            {getBalanceDescription(user.total_bsky_records, user.total_non_bsky_records)}
          </span>
        </div>
      </td>
      <td className="age-cell">
        {Math.round(user.age_in_days)} days
      </td>
      <td>
        <span className="activity-badge">
          {user.activity_status || 'Unknown'}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h1>Leaderboard (Top 100)</h1>
          <p className="leaderboard-description">
            Discover the highest scoring accounts across Bluesky and the AT Protocol network that have been calculated so far. Scores are based on numerous factors across activity and protocol participation. If a username has never been searched on cred.blue, it won't appear here. <Link to="/methodology">Learn more about the scoring methodology.</Link>
          </p>
        </div>

        <div className="score-type-filters">
          {Object.entries(scoreTypes).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleScoreTypeChange(value)}
              className={`filter-button ${scoreType === value ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="error-message">
            Error loading leaderboard: {error}
          </div>
        )}

        <div className="table-wrapper">
          <div className="table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Handle</th>
                  <th className="score-column">Score</th>
                  <th>Protocol Balance</th>
                  <th>Account Age</th>
                  <th>Activity Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => renderUserRow(user, index))}
                {runnerUps.map((user, index) => renderUserRow(user, index + 100, true))}
              </tbody>
            </table>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;