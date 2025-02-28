import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Navbar.css';

// Dropdown Menu Component
const DropdownMenu = ({ title, path, items }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <li 
      className="dropdown-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={path} className="dropdown-trigger">{title}</Link>
      {isHovered && (
        <ul className="dropdown-menu">
          {items.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>{item.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Define dropdown menus structure
  const scoreDropdown = {
    title: "score",
    path: "/",
    items: [
      { title: "score", path: "/" },
      { title: "compare", path: "/compare" },
      { title: "leaderboard", path: "/leaderboard" },
      { title: "alt text rating", path: "/alt-text" },
      { title: "shortcut", path: "/shortcut" }
    ]
  };

  const aboutDropdown = {
    title: "about",
    path: "/about",
    items: [
      { title: "about", path: "/about" },
      { title: "methodology", path: "/methodology" },
      { title: "definitions", path: "/definitions" }
    ]
  };

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
              <DropdownMenu {...scoreDropdown} />
              <li><Link to="/resources">resources</Link></li>
              <DropdownMenu {...aboutDropdown} />
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
            href="https://github.com/dame-is/cred.blue"
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
          <div className="navbar-support-button-container">
            <button
              className="navbar-support-button"
              type="button"
              onClick={() => navigate(`/supporter`)}
            >
              become a supporter
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;