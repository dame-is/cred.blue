// src/components/Login/Login.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import './Login.css';
import useDocumentMeta from '../../hooks/useDocumentMeta';

const Login = () => {
  useDocumentMeta({
    title: 'Login',
    description: 'Login to cred.blue to get your analysis and score.',
    // This will reference an image from your public folder
    image: `${window.location.origin}/cred-blue-banner.jpg`
  });
  const { isDarkMode } = useContext(ThemeContext);
  const [appPassword, setAppPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const { handleLoginSuccess } = useContext(AuthContext);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!handle || !appPassword) {
      setError('Please enter both your handle and app password.');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier: handle.trim(), 
          password: appPassword.trim() 
        }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (response.ok) {
        handleLoginSuccess(data.handle);
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <main className="home-page">
      <div className={`home-content ${isDarkMode ? 'dark-mode' : ''}`}>
        <h1>Login</h1>
        <p>
          Enter your Bluesky handle and app password to access your account.
        </p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-container">
            <input
              type="text"
              id="handle"
              placeholder="Handle (user.bsky.social)"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className={isDarkMode ? 'dark-mode' : ''}
              aria-label="User Handle"
              required
            />
          </div>

          <div className="input-container">
            <input
              type="password"
              id="appPassword"
              placeholder="App Password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              className={isDarkMode ? 'dark-mode' : ''}
              aria-label="App Password"
              required
            />
          </div>

          <div className="form-links">
            <a
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className={`form-link ${isDarkMode ? 'dark-mode' : ''}`}
            >
              Need an app password?
            </a>
          </div>

          <button 
            type="submit"
            className={isDarkMode ? 'dark-mode' : ''}
          >
            Login
          </button>
        </form>

        {error && (
          <div className={`error-message ${isDarkMode ? 'dark-mode' : ''}`}>
            {error}
          </div>
        )}
      </div>
    </main>
  );
};

export default Login;