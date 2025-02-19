// src/components/Home/Home.jsx

import React from 'react';
import SearchBar from '../SearchBar/SearchBar'; // Import SearchBar
import './Home.css'; // Create corresponding CSS
import CircularLogo from '../UserProfile/CircularLogo';

const Home = () => {

  return (
    <main className="home-page">
      <div className="home-content">
      <CircularLogo 
              size={205}
      />
      <h1>Welcome</h1>
      <p>
        Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.
      </p>
      <p className="disclaimer">
        <strong>Note:</strong> this tool is currently in beta and things will change.
      </p>
      <SearchBar />
      </div>
    </main>
  );
};

export default Home;
