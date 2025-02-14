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
              size={200}
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
