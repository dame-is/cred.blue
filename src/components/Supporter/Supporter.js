// src/components/About/About.jsx

import React from 'react';
import './Supporter.css';

const Supporter = () => {
  return (
    <>
      <main className="supporter-page">
       <div className="alt-card">
        <h1>Become a Supporter</h1>
          <div className="supporter-buttons">
          <button
              className="patreon-button"
              type="button"
              onClick={() => window.open(
                `https://patreon.com/dameis`, '_blank'
              )}
              >
                Monthly Donation 
              </button>
              <button
              className="ko-fi-button"
              type="button"
              onClick={() => window.open(
                `https://ko-fi.com/dameis`, '_blank'
              )}
              >
                One-time Tip 
              </button>
          </div>
          <p>My name is Dame. I'm an artist and software experimentalist who has been creating resources, tools, and content for the AT Protocol + Bluesky community for the past several months during my professional (unpaid) sabbatical. I've been a part of Bluesky since almost the very beginning (user #1,216), and I've developed a keen interest in helping make the "Atmosphere" better.</p>
          
          <p>Today I'm launching the beta version of a new platform I've created called cred.blue. It allows you to generate a Bluesky "credibility" score, helps you understand your AT Protocol data footprint, and let's you vibe check strangers and new accounts. Bots, fake accounts, and bad actors are all over the place these days, so it's my hope that this platform can play a small part in helping you better navigate the digital spaces we inhabit.</p>
          
          <p>Launching and maintaining a project of this nature requires a significant time investment as well as ongoing costs in the form of servers, hosting, and various services. It's my hope that through this Patreon I'll be able to at least cover the upkeep costs of the various free resources I've made. I should be able to do that well for around ~$350. Beyond that, I'm interested in focusing more of my time towards creating new projects, tools, and resources that can help people live healthier digital lives... both within the AT Protocol + Bluesky ecosystem and beyond.</p>
          
          <p>Thank you for considering supporting me,</p>

          <p>Dame</p>
       </div> 
      </main>
    </>
  );
};

export default Supporter;
