// App.jsx
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Login from './components/Login/Login';
import Newsletter from './components/Newsletter/Newsletter';
import MainApp from './components/MainApp/MainApp';
import About from './components/About/About';
import Home from './components/Home/Home';
import Terms from './components/PrivacyTerms/Terms';
import Privacy from './components/PrivacyTerms/Privacy';
import AltTextRatingTool from './components/AltTextRating/AltTextRatingTool';
import UserProfile from './components/UserProfile/UserProfile';
import ZenPage from './components/ZenPage';
import CompareScores from './components/CompareScores/CompareScores';
import "./App.css";
import { AuthContext } from './AuthContext';
import { Helmet } from 'react-helmet';

// Create AuthCheck component to handle route changes
const AuthCheck = () => {
  const location = useLocation();
  const { checkAuth } = useContext(AuthContext);

  useEffect(() => {
    checkAuth(location.pathname);
  }, [location.pathname, checkAuth]);

  return null;
};

const App = () => {
  const { isAuthenticated, handleLoginSuccess } = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Helmet>
          {/* Default meta tags */}
          <title>cred.blue</title>
          <meta name="description" content="Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts." />
          
          {/* OpenGraph Meta Tags */}
          <meta property="og:title" content="cred.blue" />
          <meta property="og:description" content="Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts." />
          <meta property="og:image" content="https://cred.blue/cred-blue-banner.jpg" />
          <meta property="og:url" content="https://cred.blue" />
          <meta property="og:type" content="website" />
          
          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="cred.blue" />
          <meta name="twitter:description" content="Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts." />
          <meta name="twitter:image" content="https://cred.blue/cred-blue-banner.jpg" />
        </Helmet>
        
        <AuthCheck />
       <Navbar />
       <div className="main-container" style={{ flex: 1 }}>
         <Routes>
           {/* Auth-protected route */}
           <Route
             path="/app/*"
             element={isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />}
           />
           
           {/* Login route with redirect if already authenticated */}
           <Route
             path="/login"
             element={!isAuthenticated ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/app" replace />}
           />
           
           {/* Public routes - no authentication required */}
           <Route path="/home" element={<Home />} />
           <Route path="/compare" element={<CompareScores />} />
           <Route path="/alt-text" element={<AltTextRatingTool />} />
           <Route path="/about" element={<About />} />
           <Route path="/privacy" element={<Privacy />} />
           <Route path="/terms" element={<Terms />} />
           <Route path="/newsletter" element={<Newsletter />} />
           <Route path="/:username" element={<UserProfile />} />
           <Route path="/zen" element={<ZenPage />} />
           
           {/* Default routes */}
           <Route path="/" element={<Navigate to="/home" replace />} />
           <Route path="*" element={<Navigate to="/home" replace />} />
         </Routes>
       </div>
       <Footer />
     </div>
   </Router>
 );
};

export default App;