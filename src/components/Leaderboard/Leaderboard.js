import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [runnerUps, setRunnerUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreType, setScoreType] = useState('combined_score');

  const scoreTypes = {
    combined_score: 'Combined Score',
    bluesky_score: 'Bluesky Score',
    atproto_score: 'AT Proto Score'
  };

  // Calculate protocol balance score (0-100)
  const calculateBalanceScore = (bskyRecords, nonBskyRecords) => {
    if (!bskyRecords && !nonBskyRecords) return 0;
    const total = bskyRecords + nonBskyRecords;
    if (total === 0) return 0;
    
    // Calculate the ratio of the smaller to the larger number
    const ratio = Math.min(bskyRecords, nonBskyRecords) / Math.max(bskyRecords, nonBskyRecords);
    // Convert to a 0-100 score, with 1 (perfect balance) = 100
    return Math.round(ratio * 100);
  };

  const getBalanceIndicator = (score) => {
    if (score >= 80) return 'Balanced';
    if (score >= 50) return 'Moderately Balanced';
    if (score >= 20) return 'Imbalanced';
    return 'Highly Imbalanced';
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch top 100 users
      const { data: topUsers, error: topError } = await supabase
        .from('user_scores')
        .select(`
          handle,
          display_name,
          combined_score,
          bluesky_score,
          atproto_score,
          activity_status,
          age_in_days,
          total_bsky_records,
          total_non_bsky_records
        `)
        .order(scoreType, { ascending: false })
        .limit(100);

      if (topError) throw topError;

      // Fetch next 10 users
      const { data: nextUsers, error: nextError } = await supabase
        .from('user_scores')
        .select(`
          handle,
          display_name,
          combined_score,
          bluesky_score,
          atproto_score,
          activity_status,
          age_in_days,
          total_bsky_records,
          total_non_bsky_records
        `)
        .order(scoreType, { ascending: false })
        .range(100, 109);  // Get positions 101-110

      if (nextError) throw nextError;

      setUsers(topUsers || []);
      setRunnerUps(nextUsers || []);

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
        <a href={`/${user.handle}`} className="user-handle">
          @{user.handle}
        </a>
      </td>
      <td>{user.display_name || '-'}</td>
      <td>
        <span className="activity-badge">
          {user.activity_status || 'Unknown'}
        </span>
      </td>
      <td className="age-cell">
        {Math.round(user.age_in_days)} days
      </td>
      <td>
        <div className="balance-indicator">
          <div 
            className="balance-bar"
            style={{
              width: `${calculateBalanceScore(user.total_bsky_records, user.total_non_bsky_records)}%`
            }}
          ></div>
          <span>{getBalanceIndicator(calculateBalanceScore(user.total_bsky_records, user.total_non_bsky_records))}</span>
        </div>
      </td>
      <td className="score-cell">
        {Math.round(user[scoreType] || 0)}
      </td>
    </tr>
  );

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h1>Leaderboard</h1>
          <p className="leaderboard-description">
            Discover the top-performing accounts on the Bluesky network. Rankings are based on various factors including engagement, activity, and protocol participation.
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

        <div className="table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Handle</th>
                <th className="score-column">Score</th>
                <th>Activity Status</th>
                <th>Account Age</th>
                <th>Protocol Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => renderUserRow(user, index))}
              {runnerUps.map((user, index) => renderUserRow(user, index + 100, true))}
            </tbody>
          </table>
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