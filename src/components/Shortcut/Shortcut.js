// src/components/Shortcut/Shortcut.jsx
import React from 'react';
import './Shortcut.css';

const Shortcut = () => {
  return (
    <>
      <main className="shortcut-page">
        <div className="alt-card">
          <h1>Download Apple Shortcut</h1>
          <p>
            If you have an iPhone, iPad, or Macbook, you can download a special Apple Shortcut to your device that will allow you to quickly check a Bluesky account's cred.blue score while you're scrolling inside of the Bluesky app.
          </p>

          <p>
            You don't even have to go to an account's profile for the shortcut to work. You can tap the share button on any post, profile, or even use the developer mode "copy author DID" or "copy post URI", letting you quickly check a score even from within a thread or a feed.
          </p>

          <div className="image-container">
            <img
              src="/how-to-use-cred-blue-shortcut.png"
              alt="How to use Cred.blue Shortcut"
              className="shortcut-image"
            />
          </div>

          <p>
            Once you have the Apple Shortcut installed, go through the setup process to enter your username and then check to make sure that the Share Sheet feature has been enabled.
          </p>

          <div className="image-container">
            <img
              src="/enable-share-sheet.png"
              alt="Enable Share Sheet"
              className="shortcut-image"
            />
          </div>

          <div className="shortcut-buttons">
            <button
              className="shortcut-button"
              type="button"
              onClick={() => window.open('https://cred.blue/shortcut', '_blank')}
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