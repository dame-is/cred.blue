import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

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
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
          <p className="text-gray-600">
            Discover the top-performing accounts on the Bluesky network. Rankings are based on various factors including engagement, activity, and protocol participation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(scoreTypes).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleScoreTypeChange(value)}
              className={`px-4 py-2 rounded-full transition-colors ${
                scoreType === value 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error loading leaderboard: {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Handle</th>
                <th className="py-3 px-4 text-left">Display Name</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr 
                  key={user.handle} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">#{(page - 1) * perPage + index + 1}</td>
                  <td className="py-3 px-4">
                    <a 
                      href={`/${user.handle}`}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      @{user.handle}
                    </a>
                  </td>
                  <td className="py-3 px-4">{user.display_name || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {user.social_status || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {user[scoreType]?.toFixed(1) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {!loading && hasMore && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;