// src/index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import "./index.css";

// Create a MetaTags component to set initial meta tags
const MetaTags = ({ children }) => {
  useEffect(() => {
    // Set initial meta tags that will be present before any routing or auth
    document.title = 'cred.blue';
    
    const metaTags = {
      'description': 'Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.',
      'og:title': 'cred.blue',
      'og:description': 'Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.',
      'og:image': `${window.location.origin}/cred-blue-banner.jpg`,
      'og:type': 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': 'cred.blue',
      'twitter:description': 'Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.',
      'twitter:image': `${window.location.origin}/cred-blue-banner.jpg`
    };

    // Helper function to update or create meta tags
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[${name.includes('og:') ? 'property' : 'name'}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.includes('og:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set all meta tags
    Object.entries(metaTags).forEach(([name, content]) => {
      updateMetaTag(name, content);
    });
  }, []);

  return children;
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <MetaTags>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </MetaTags>
  </React.StrictMode>
);