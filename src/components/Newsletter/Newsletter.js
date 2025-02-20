// src/components/Newsletter/Newsletter.jsx
import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <main className="newsletter-page">
      <div className="alt-card">
        <h1>Subscribe to the Newsletter</h1>
        <p>Lorem ipsum...</p>
        
        <form 
          className="newsletter-form embeddable-buttondown-form"
          action="https://buttondown.com/api/emails/embed-subscribe/dame"
          method="post"
          target="popupwindow"
          onSubmit={() => window.open('https://buttondown.com/dame', 'popupwindow')}
        >
          <label htmlFor="bd-email">Email Address</label>
          <input 
            type="email" 
            name="email" 
            id="bd-email" 
            placeholder="username@gmail.com" 
          />

          <label htmlFor="bsky-handle">Bluesky Handle (Optional)</label>
          <input 
            type="text" 
            name="metadata__bsky-handle" 
            id="bsky-handle" 
            placeholder="username.bsky.social" 
          />

          <label htmlFor="name">Name or Pseudonym (Optional)</label>
          <input 
            type="text" 
            name="metadata__name" 
            id="name" 
            placeholder="name" 
          />

          <input type="submit" value="Subscribe" />
          <input type="hidden" name="tag" value="cred.blue subscribers" />
        </form>
      </div>
    </main>
  );
};

export default Newsletter;