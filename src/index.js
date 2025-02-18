// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from './AuthContext'; // Ensure correct path
import { ThemeProvider } from './contexts/ThemeContext'; // Adjust the path as necessary
import "./index.css";

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Analytics>
    <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    </AuthProvider>
    </Analytics>
  </React.StrictMode>
);
