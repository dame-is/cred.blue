import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import Newsletter from './components/Newsletter/Newsletter';
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

const App = () => {
  const { isAuthenticated, handleLoginSuccess } = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
            <Route path="/newsletter" element={<Newsletter />} />
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