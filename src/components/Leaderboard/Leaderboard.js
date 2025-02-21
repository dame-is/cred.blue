import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scoreType, setScoreType] = useState('combined_score');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 25;

  const scoreTypes = {
    combined_score: 'Combined Score',
    bluesky_score: 'Bluesky Score',
    atproto_score: 'AT Proto Score'
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const start = (page - 1) * perPage;
      const end = start + perPage - 1;

      const { data, error } = await supabase
        .from('user_scores')
        .select(`
          handle,
          display_name,
          combined_score,
          bluesky_score,
          atproto_score,
          social_status
        `)
        .order(scoreType, { ascending: false })
        .range(start, end);

      if (error) throw error;

      if (data.length < perPage) {
        setHasMore(false);
      }

      if (page === 1) {
        setUsers(data);
      } else {
        setUsers(prev => [...prev, ...data]);
      }

    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, scoreType, perPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleScoreTypeChange = (type) => {
    setScoreType(type);
    setPage(1);
    setHasMore(true);
    setUsers([]);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

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
                <th>Display Name</th>
                <th>Status</th>
                <th className="score-column">Score</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.handle}>
                  <td className="rank-cell">#{(page - 1) * perPage + index + 1}</td>
                  <td>
                    <a 
                      href={`/${user.handle}`}
                      className="user-handle"
                    >
                      @{user.handle}
                    </a>
                  </td>
                  <td>{user.display_name || '-'}</td>
                  <td>
                    <span className="status-badge">
                      {user.social_status || 'Unknown'}
                    </span>
                  </td>
                  <td className="score-cell">
                    {user[scoreType]?.toFixed(1) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        )}

        {!loading && hasMore && (
          <div className="load-more-container">
            <button onClick={loadMore} className="load-more-button">
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;