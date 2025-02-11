// src/App.jsx

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import MainApp from './components/MainApp/MainApp';
import About from './components/About/About';
import Home from './components/Home/Home';
import UserProfile from './components/UserProfile/UserProfile';
import TestMatterPage from './components/TestMatterPage';  // New import for test page
import CompareScores from './components/CompareScores/CompareScores';  // New import for compare page
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
            <Route path="/about" element={<About />} />
            <Route path="/home" element={<Home />} />
            {/* Added CompareScores route */}
            <Route path="/compare" element={<CompareScores />} />
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
