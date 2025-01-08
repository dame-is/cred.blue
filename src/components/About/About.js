// src/components/About/About.jsx

import React from 'react';
import './About.css'; // Create corresponding CSS

const About = () => {
  return (
    <>
      <main className="about-page">
        <h1>About cred.blue</h1>
        <p>
          {/* Your about content here */}
          Unlike social media scores that have predated it, cred.blue is **not** a measurement of social influence or popularity. Instead, it aims to measure an account’s general reputation or footprint within the Atmosphere community, regardless of how many followers it has.
        </p>
        <p>
        The cred.blue score is not set in stone. It will evolve in tandem with the AT Protocol and Atmosphere.
        </p>
      </main>
    </>
  );
};

export default About;
