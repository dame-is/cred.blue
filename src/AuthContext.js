// src/contexts/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component to wrap around parts of the app that need access to auth state
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userHandle, setUserHandle] = useState(null);
    const [userDid, setUserDid] = useState(null); // New state for DID
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const checkAuth = async () => {
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
            console.log('User is authenticated. Handle:', data.handle, 'DID:', data.did);
          } else {
            setIsAuthenticated(false);
            setUserHandle(null);
            setUserDid(null);
            console.log('User is not authenticated.');
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
      console.log('User logged in successfully. Handle:', handle, 'DID:', did);
    };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/logout`, { // Endpoint to logout
        method: 'POST',
        credentials: 'include', // Include cookies in the request
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(false);
        setUserHandle(null);
        setUserDid(null);
        console.log('Logout successful.');
      } else {
        console.error('Logout failed:', data.error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userHandle, userDid, handleLoginSuccess, handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
