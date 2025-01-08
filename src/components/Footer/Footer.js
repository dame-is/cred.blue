// src/components/Footer/Footer.jsx

import React from 'react';
import './Footer.css'; // Import the corresponding CSS

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Important Links */}
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a
            href="https://bsky.app/profile/dame.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
            className="credit-link-anchor"
          >
            Made by @dame.bsky.social
          </a>
          {/* Add more links as needed */}
        </div>

        {/* Additional Info */}
        <div className="footer-info">
          <p>&copy; {new Date().getFullYear()} cred.blue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
