// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import "./index.css";
import { Helmet } from 'react-helmet';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
      <AuthProvider>
        <ThemeProvider>
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
          <App />
        </ThemeProvider>
      </AuthProvider>
  </React.StrictMode>
);