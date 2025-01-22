// src/components/Home/Home.jsx

import React from 'react';
import SearchBar from '../SearchBar/SearchBar'; // Import SearchBar
import './Home.css'; // Create corresponding CSS

const Home = () => {
  return (
    <main className="home-page">
      <div className="home-content">
      <h1>Welcome</h1>
      <p>
        {/* Your home content here */}
        Discover and compare Bluesky accounts based on their activity and engagement.
      </p>
      {/* Include the SearchBar */}
      <SearchBar />
      </div>
    </main>
  );
};

export default Home;
