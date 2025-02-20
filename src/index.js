// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import "./index.css";
import { Analytics } from '@vercel/analytics/next';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <Analytics>
        <App />
      </Analytics>
    </ThemeProvider>
  </React.StrictMode>
);