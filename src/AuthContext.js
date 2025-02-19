// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userHandle, setUserHandle] = useState(null);
  const [userDid, setUserDid] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Check if current route requires authentication
  const requiresAuth = (pathname) => {
    const authRoutes = ['/app', '/login'];
    return authRoutes.some(route => pathname.startsWith(route));
  };

  useEffect(() => {
    const checkAuth = async () => {
      // If route doesn't require auth, skip authentication check
      if (!requiresAuth(location.pathname)) {
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
  }, [location.pathname]);

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
      requiresAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};