// src/components/Login/Login.jsx

import React, { useState, useContext } from 'react';
import './Login.css'; // Ensure you have appropriate styles
import { AuthContext } from '../../AuthContext'; // Adjust the path as necessary

const Login = () => {
  const [appPassword, setAppPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const { handleLoginSuccess } = useContext(AuthContext); // Function to update AuthContext

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(''); // Reset error message

    // Basic validation
    if (!handle || !appPassword) {
      setError('Please enter both your handle and app password.');
      return;
    }

    try {
      console.log('Attempting login with:', { handle, appPassword });

      // Send POST request to /api/login with credentials
      const response = await fetch('http://localhost:5001/api/login', { // Using relative URL due to proxy setup
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: handle.trim(), password: appPassword.trim() }),
        credentials: 'include', // Include cookies in the request
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful! Handle:', data.handle);
        handleLoginSuccess(data.handle); // Update AuthContext with user handle
        // Optionally, redirect the user or update UI here
      } else {
        console.error('Login failed:', data.error);
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <main className="login-container">

      <div className="login-form">
        <h2 className="login-subtitle">Login with Bluesky</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              id="handle"
              className="form-input"
              placeholder="Handle (user.bsky.social)"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              aria-label="User Handle"  /* Accessibility Improvement */
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="appPassword"
              className="form-input"
              placeholder="App Password (keod-iadh-kbrx-pafw)"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              aria-label="App Password" /* Accessibility Improvement */
              required
            />
          </div>

          <div className="form-links">
            <a
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className="form-link"
            >
              Need an app password? Go here.
            </a>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}
    </main>
  );
};

export default Login;
