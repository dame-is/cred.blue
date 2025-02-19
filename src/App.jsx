import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import MainApp from './components/MainApp/MainApp';
import About from './components/About/About';
import Home from './components/Home/Home';
import Terms from './components/PrivacyTerms/Terms';
import Privacy from './components/PrivacyTerms/Privacy';
import AltTextRatingTool from './components/AltTextRating/AltTextRatingTool';
import UserProfile from './components/UserProfile/UserProfile';
import TestMatterPage from './components/TestMatterPage';
import CompareScores from './components/CompareScores/CompareScores';
import "./App.css";
import { AuthContext } from './AuthContext';

// Meta tag updater component
const MetaUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    const updateMetaTags = () => {
      // Default meta values
      let title = 'cred.blue';
      let description = 'Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.';

      // Update meta tags based on route
      switch (location.pathname) {
        case '/home':
          // Use defaults
          break;
        case '/about':
          title = 'About | cred.blue';
          description = 'Learn about how cred.blue generates Bluesky credibility scores and helps you understand your Atproto data footprint.';
          break;
        case '/compare':
          title = 'Compare Scores | cred.blue';
          description = 'Compare Bluesky credibility scores between different accounts.';
          break;
        case '/alt-text':
          title = 'Alt Text Rating | cred.blue';
          description = 'Rate and analyze alt text quality for Bluesky images.';
          break;
        default:
          // Check if it's a username route
          if (location.pathname.slice(1)) {
            const username = location.pathname.slice(1);
            title = `${username} | cred.blue`;
            description = `View ${username}'s Bluesky credibility score and profile analysis`;
          }
      }

      // Update only the client-side visible elements
      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
    };

    updateMetaTags();
  }, [location]);

  return null;
};

const App = () => {
  const { isAuthenticated, handleLoginSuccess } = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <MetaUpdater />
        <Navbar />
        <div className="main-container" style={{ flex: 1 }}>
          <Routes>
            {/* Auth-protected route */}
            <Route
              path="/app/*"
              element={isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />}
            />
            {/* Login route with redirect if already authenticated */}
            <Route
              path="/login"
              element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/app" replace />}
            />
            {/* Public routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/compare" element={<CompareScores />} />
            <Route path="/alt-text" element={<AltTextRatingTool />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/:username" element={<UserProfile />} />
            <Route path="/test-matter" element={<TestMatterPage />} />
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;