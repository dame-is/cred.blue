import React from 'react';
import './ErrorPage.css'; // Create corresponding CSS

const ErrorPage = ({ title = "Page Not Found", message = "We couldn't find what you were looking for.", username = null, onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-lg">
        {/* Butterfly emoji with animation */}
        <div className="text-6xl animate-bounce mb-8">🦋</div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          {username ? (
            <>
              We couldn't find the Bluesky account "<span className="font-semibold">{username}</span>".
              <br />
              This might be because:
              <ul className="text-left mt-4 list-disc list-inside">
                <li>The handle doesn't exist on Bluesky</li>
                <li>The account has been deleted</li>
                <li>There might be a typo in the URL</li>
              </ul>
            </>
          ) : (
            message
          )}
        </p>

        <div className="space-y-4">
          <button 
            onClick={() => onNavigate('/home')}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
          
          <p className="text-gray-500 mt-4">
            Want to try searching for another account? Head back to our{' '}
            <button 
              onClick={() => onNavigate('/home')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              search page
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;