// src/components/ScoreCard/ScoreCard.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ScoreCard = ({ blueskyScore, atprotoScore }) => {
  // Ensure scores are within 0-100
  const validatedBlueskyScore = Math.max(0, Math.min(blueskyScore, 100));
  const validatedAtprotoScore = Math.max(0, Math.min(atprotoScore, 100));

  // Data for the bar chart
  const data = [
    {
      name: 'Scores',
      'Bluesky Score': validatedBlueskyScore,
      'Atproto Score': validatedAtprotoScore,
    },
  ];

  return (
    <div className="score-card">
      <h2>Account Scores</h2>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="Bluesky Score" fill="#8884d8" barSize={20} />
          <Bar dataKey="Atproto Score" fill="#82ca9d" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
      <div className="score-values">
        <div className="score-item">
          <span className="score-label bluesky">Bluesky Score:</span>
          <span className="score-number">{validatedBlueskyScore}/100</span>
        </div>
        <div className="score-item">
          <span className="score-label atproto">Atproto Score:</span>
          <span className="score-number">{validatedAtprotoScore}/100</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;
