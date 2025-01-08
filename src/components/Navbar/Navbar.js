// src/components/Navbar/Navbar.jsx

import React, { useContext } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { isAuthenticated, handleLogout, loading } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await handleLogout();
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="navbar-logo">
              <Link to="/">cred.blue</Link>
            </div>
            <nav className="navbar-links">
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/about">About</Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="navbar-actions">
            <button className="theme-toggle-button" disabled>
              Loading...
            </button>
            <div className="navbar-auth-button">
              <button className="auth-button disabled-button" disabled>
                Loading...
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Left Section: Logo and Links */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <Link to="/">cred.blue</Link>
          </div>

          <nav className="navbar-links">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
              {/* Add more links as needed */}
            </ul>
          </nav>
        </div>

        {/* Right Section: Dark Mode Toggle and Auth Button */}
        <div className="navbar-actions">
          {/* Dark Mode Toggle */}
          <button className="theme-toggle-button" onClick={toggleDarkMode} aria-label="Toggle dark mode">
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            {isDarkMode ? ' Light Mode' : ' Dark Mode'}
          </button>

          {/* Authentication Button */}
          <div className="navbar-auth-button">
            <button
              className={`auth-button ${isAuthenticated ? 'logout-button' : 'login-button'}`}
              onClick={handleAuthAction}
              aria-label={isAuthenticated ? 'Logout' : 'Login'}
            >
              {isAuthenticated ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
