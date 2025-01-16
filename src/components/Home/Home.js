// src/components/Home/Home.jsx

import React from 'react';
import SearchBar from '../SearchBar/SearchBar'; // Import SearchBar
import './Home.css'; // Create corresponding CSS

const Home = () => {
  return (
    <main className="home-page">
      <h1>Welcome to cred.blue</h1>
      <p>
        {/* Your home content here */}
        Discover and compare Bluesky accounts based on their activity and engagement.
      </p>
      {/* Include the SearchBar */}
      <SearchBar />
    </main>
  );
};

export default Home;
