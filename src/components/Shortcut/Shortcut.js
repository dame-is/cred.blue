// src/components/Shortcut/Shortcut.jsx

import React from 'react';
import './Shortcut.css';

const Shortcut = () => {
  return (
    <>
      <main className="shortcut-page">
       <div className="alt-card">
        <h1>Download Apple Shortcut</h1>

          <p>If you have an iPhone, iPad, or Macbook, you can download a special Apple Shortcut to your device that will allow you to quickly check a Bluesky account's cred.blue score while you're scrolling inside of the Bluesky app.
          </p>
          
          <p>Thank you for considering supporting me,</p>

          <p>Dame</p>
          <p><a href="https://bsky.app/profile/dame.is" target="_blank" rel="noreferrer">@dame.is</a></p>

          <div className="shortcut-buttons">
          <button
              className="patreon-button"
              type="button"
              onClick={() => window.open(
                `https://cred.blue/shortcut`, '_blank'
              )}
              >
                Download Shortcut 
              </button>
          </div>
       </div> 
      </main>
    </>
  );
};

export default Shortcut;
