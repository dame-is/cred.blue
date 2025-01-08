// src/App.jsx

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import MainApp from './components/MainApp/MainApp';
import About from './components/About/About';
import Home from './components/Home/Home';
import UserProfile from './components/UserProfile/UserProfile'; // Import UserProfile
import { AuthContext } from './AuthContext'; // Ensure correct path

const App = () => {
  const { isAuthenticated, handleLoginSuccess, loading } = useContext(AuthContext);

  if (loading) {
    // Optionally, render a loading spinner or placeholder
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
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

            {/* Authenticated Routes */}
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

            {/* Dynamic User Profile Route */}
            {/* Place this route after all specific routes to prevent conflicts */}
            <Route path="/:username" element={<UserProfile />} />

            {/* Redirect any unknown routes */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/app" : "/home"} replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
