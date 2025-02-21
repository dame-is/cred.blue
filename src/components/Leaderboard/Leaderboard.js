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
      
      // Fetch top 100 users
      const { data: topUsers, error: topError } = await supabase
        .from('user_scores')
        .select(`
          handle,
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
      <td className="score-cell">
        {Math.round(user[scoreType] || 0)}
      </td>
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
    </tr>
  );

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h1>Leaderboard</h1>
          <p className="leaderboard-description">
            Discover the highest scoring accounts across Bluesky and the AT Protocol network that have been calculated so far. Scores are based on numerous factors across activity and protocol participation. If a username has never been searched on cred.blue, it won't appear here. <a href="https://testing.cred.blue/methodology">Learn more about the scoring methodology.</a>
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