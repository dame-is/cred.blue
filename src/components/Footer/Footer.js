// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Important Links */}
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <a
            href="https://bsky.app/profile/dame.is"
            target="_blank"
            rel="noopener noreferrer"
            className="credit-link-anchor"
          >
            Made by @dame.is
          </a>
        </div>
        {/* Additional Info */}
        <div className="footer-info">
          <p>&copy; {new Date().getFullYear()} cred.blue. All rights reserved. <Link to="/zen" className="zen-link">Zen</Link>.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;