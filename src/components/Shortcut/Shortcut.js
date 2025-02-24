// src/components/Shortcut/Shortcut.jsx
import React, { useState } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import './Shortcut.css';

const Shortcut = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    {
      original: '/how-to-use-cred-blue-shortcut.png',
      thumbnail: '/how-to-use-cred-blue-shortcut.png',
    },
    {
      original: '/enable-share-sheet.png',
      thumbnail: '/enable-share-sheet.png',
    },
  ];

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setCurrentIndex(0);
    setIsOpen(false);
  };

  return (
    <>
      <main className="shortcut-page">
        <div className="alt-card">
          <h1>Download Apple Shortcut</h1>
          <p>
            If you have an iPhone, iPad, or Macbook, you can download a special Apple Shortcut to your device that will allow you to quickly check a Bluesky account's cred.blue score while you're scrolling inside of the Bluesky app.
          </p>
          <div className="image-container">
            <img
              src="/how-to-use-cred-blue-shortcut.png"
              alt="How to use Cred.blue Shortcut"
              className="shortcut-image"
              onClick={() => openLightbox(0)}
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
              onClick={() => openLightbox(1)}
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

      {isOpen && (
        <ImageGallery
          items={images}
          startIndex={currentIndex}
          onClose={closeLightbox}
          showThumbnails={false}
          showPlayButton={false}
          showFullscreenButton={false}
        />
      )}
    </>
  );
};

export default Shortcut;