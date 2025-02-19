// src/App.jsx

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import TestMatterPage from './components/TestMatterPage';  // New import for test page
import CompareScores from './components/CompareScores/CompareScores';  // New import for compare page
import useDocumentMeta from '././hooks/useDocumentMeta';
import "./App.css";
import { AuthContext } from './AuthContext';

const App = () => {
  useDocumentMeta({
    title: 'About cred.blue',
    description: 'Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.',
  });
  const { isAuthenticated, handleLoginSuccess } = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="main-container" style={{ flex: 1 }}>
          <Routes>
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login onLoginSuccess={handleLoginSuccess} />
                ) : (
                  <Navigate to="/app" replace />
                )
              }
            />
            <Route path="/home" element={<Home />} />
            <Route path="/compare" element={<CompareScores />} />
            <Route path="/alt-text" element={<AltTextRatingTool />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/app/*"
              element={
                isAuthenticated ? (
                  <MainApp />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            {/* Note: placing this route after /compare avoids conflict */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/:username" element={<UserProfile />} />
            <Route path="/test-matter" element={<TestMatterPage />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/app' : '/home'} replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
