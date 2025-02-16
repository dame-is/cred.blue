import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Navbar.css';

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
              <Link to="/">
                <span className="cred">cred</span>
                <span className="period">.</span>
                <span className="blue">blue</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo">
            <Link to="/">
              <span className="cred">cred</span>
              <span className="period">.</span>
              <span className="blue">blue</span>
            </Link>
          </div>
          <nav className="navbar-links">
            <ul>
              <li><Link to="/">score</Link></li>
              <li><Link to="/compare">compare</Link></li>
              <li><Link to="/alt-text">alt text</Link></li>
              <li><Link to="/about">about</Link></li>
            </ul>
          </nav>
        </div>
        <div className="navbar-actions">
          {/* Social Links */}
          <a 
            href="https://bsky.app/profile/cred.blue" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-icon" 
            aria-label="Bluesky Profile"
          >
            <svg className="icon" fill="currentColor">
              <use href="/icons/icons-sprite.svg#icon-bluesky" />
            </svg>
          </a>
          <a 
            href="https://github.com/damedotblog" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-icon" 
            aria-label="GitHub Profile"
          >
            <svg className="icon" fill="currentColor">
              <use href="/icons/icons-sprite.svg#icon-github" />
            </svg>
          </a>
          
          {/* Theme Toggle */}
          <button 
            className="theme-toggle-button" 
            onClick={toggleDarkMode} 
            aria-label="Toggle dark mode"
          >
            <svg className="icon" fill="currentColor">
              <use href={`/icons/icons-sprite.svg#icon-${isDarkMode ? 'sun' : 'moon'}`} />
            </svg>
          </button>

          {/* Auth Button */}
          <div className="navbar-auth-button">
            <button
              className={`auth-button ${isAuthenticated ? 'logout-button' : 'login-button'}`}
              onClick={handleAuthAction}
              aria-label={isAuthenticated ? 'Logout' : 'Login'}
            >
              {isAuthenticated ? 'logout' : 'login'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;