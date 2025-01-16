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
import "./App.css";
import { AuthContext } from './AuthContext';

const App = () => {
  const { isAuthenticated, handleLoginSuccess, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
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
            <Route path="/:username" element={<UserProfile />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/app' : '/home'} replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
