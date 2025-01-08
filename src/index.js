// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext'; // Ensure correct path
import { ThemeProvider } from './contexts/ThemeContext'; // Adjust the path as necessary

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
