import React from 'react';
import CircularLogo from '../UserProfile/CircularLogo';
import SearchBar from '../SearchBar/SearchBar';
import { Helmet } from 'react-helmet';
import './ErrorPage.css';

const ErrorPage = ({ title = "Page Not Found", message = "We couldn't find what you were looking for.", username = null, onNavigate }) => {
  return (
    <>
      <Helmet>
        <title>Not Found - cred.blue</title>
        <meta name="description" content="The requested Bluesky account could not be found on cred.blue" />
      </Helmet>
      
      <main className="error-page">
        <div className="error-content">
          <CircularLogo
            size={205}
          />
          
          <h1>{title}</h1>
          
          {username ? (
            <div className="error-message">
              <p>
                We couldn't find the Bluesky account "<strong>{username}</strong>".
              </p>
              <p>This might be because:</p>
              <ul>
                <li>The handle doesn't exist on Bluesky</li>
                <li>The account has been deleted</li>
                <li>There might be a typo in the URL</li>
              </ul>
            </div>
          ) : (
            <p className="error-message">{message}</p>
          )}
          
          <div className="search-section">
            <p className="try-another">Try searching for another account:</p>
            <SearchBar />
          </div>
          
          <p className="disclaimer">
            <strong>Note:</strong> If you believe this is an error, please try again later.
          </p>
        </div>
      </main>
    </>
  );
};

export default ErrorPage;