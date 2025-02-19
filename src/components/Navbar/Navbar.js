import React, { useContext, navigate } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

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
            <div className="beta-badge">
              beta
            </div>
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
          <div className="navbar-newsletter-button-container">
          <button
            className="navbar-newsletter-button"
            type="button"
            onClick={() => navigate('/newsletter')}
          >
            newsletter
          </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;