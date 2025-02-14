// src/components/About/About.jsx

import React from 'react';
import './About.css';

const About = () => {
  return (
    <>
      <main className="about-page">
      <div className="alt-card">
        <h1>About cred.blue</h1>
        <p>
          Unlike social media scores that have predated it, cred.blue is <strong>not</strong> a measurement of social influence or popularity. Instead, it aims to measure an account’s general reputation or footprint within the Atmosphere community, regardless of how many followers it has.
        </p>
        <p>
        The cred.blue score is not set in stone. It will evolve in tandem with the AT Protocol and Atmosphere.
        </p>
      </div>
      </main>
    </>
  );
};

export default About;
