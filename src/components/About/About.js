// src/components/About/About.jsx

import React from 'react';
import './About.css';
import useDocumentMeta from '../../hooks/useDocumentMeta';

const About = () => {
  useDocumentMeta({
    title: `About cred.blue`,
    description: `Learn more about the cred.blue scoring methodology and mission.`,
    image: `${window.location.origin}/cred-blue-banner.jpg`
  });
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
        <h2>
        Roadmap
        </h2>
        <p>
        Future versions of cred.blue will focus on the following features and functionality...
        </p>
        <ul>
        <li>Authenticated data analysis</li>
        <li>Lexicon and tracking</li>
        <li>Badges and rewards</li>
        </ul>
      </div> 
      </main>
    </>
  );
};

export default About;
