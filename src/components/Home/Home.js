// src/components/Home/Home.jsx

import React from 'react';
import SearchBar from '../SearchBar/SearchBar'; // Import SearchBar
import './Home.css'; // Create corresponding CSS
import CircularLogo from '../UserProfile/CircularLogo';
import { Helmet } from 'react-helmet';

const Home = () => {

  return (
    <>
    <Helmet>
    {/* Default meta tags */}
    <title>cred.blue</title>
    <meta name="description" content="Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts." />
    
    {/* OpenGraph Meta Tags */}
    <meta property="og:title" content="cred.blue" />
    <meta property="og:description" content="Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts." />
    <meta property="og:image" content="https://cred.blue/cred-blue-banner.jpg" />
    <meta property="og:url" content="https://cred.blue" />
    <meta property="og:type" content="website" />
    
    {/* Twitter Card Meta Tags */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="cred.blue" />
    <meta name="twitter:description" content="Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts." />
    <meta name="twitter:image" content="https://cred.blue/cred-blue-banner.jpg" />
  </Helmet>

    <main className="home-page">
      <div className="home-content">
      <CircularLogo 
              size={205}
      />
      <h1>Welcome</h1>
      <p>
        Generate a Bluesky credibility score. Understand your AT Proto data footprint. Vibe check strangers and new accounts.
      </p>
      <p className="disclaimer">
        <strong>Note:</strong> this tool is currently in beta and things will change.
      </p>
      <SearchBar />
      </div>
    </main>
    </>
  );
};

export default Home;
