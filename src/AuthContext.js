// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

const backendUrl = process.env.REACT_APP_BACKEND_URL;
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userHandle, setUserHandle] = useState(null);
  const [userDid, setUserDid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBot, setIsBot] = useState(false);

  useEffect(() => {
    // Check if the request is from a bot
    const userAgent = navigator.userAgent.toLowerCase();
    const isSocialMediaBot = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i.test(userAgent);
    setIsBot(isSocialMediaBot);

    const checkAuth = async () => {
      // If it's a bot, don't check authentication
      if (isSocialMediaBot) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/authenticated`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        
        if (response.ok && data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserHandle(data.handle);
          setUserDid(data.did);
        } else {
          setIsAuthenticated(false);
          setUserHandle(null);
          setUserDid(null);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
        setUserHandle(null);
        setUserDid(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (handle, did) => {
    setIsAuthenticated(true);
    setUserHandle(handle);
    setUserDid(did);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        setIsAuthenticated(false);
        setUserHandle(null);
        setUserDid(null);
      } else {
        console.error('Logout failed:', data.error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userHandle, 
      userDid, 
      handleLoginSuccess, 
      handleLogout, 
      loading,
      isBot 
    }}>
      {children}
    </AuthContext.Provider>
  );
};