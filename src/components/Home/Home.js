// src/components/Home/Home.jsx

import React from 'react';
import SearchBar from '../SearchBar/SearchBar'; // Import SearchBar
import './Home.css'; // Create corresponding CSS
import CircularLogo from '../UserProfile/CircularLogo';
import useDocumentMeta from '../../hooks/useDocumentMeta';

const Home = () => {
  useDocumentMeta({
    title: 'cred.blue',
    description: 'Welcome to cred.blue - a trusted source for Bluesky credibility scores and data analysis.'
  });
  return (
    <main className="home-page">
      <div className="home-content">
      <CircularLogo 
              size={205}
      />
      <h1>Welcome</h1>
      <p>
        {/* Your home content here */}
        Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.
      </p>
      {/* Include the SearchBar */}
      <SearchBar />
      </div>
    </main>
  );
};

export default Home;
