// src/contexts/ThemeContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// Create the ThemeContext with default value
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme based on user's system preference or localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // Fallback to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Toggle the theme and save preference to localStorage
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      localStorage.setItem('isDarkMode', JSON.stringify(!prevMode));
      return !prevMode;
    });
  };

  // Optional: Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {/* Apply a class to the body based on the theme */}
      <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
