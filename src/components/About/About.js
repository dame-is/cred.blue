// src/components/About/About.jsx

import React from 'react';
import './About.css';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <>
      <main className="about-page">
       <div className="alt-card">
        <h1>About cred.blue</h1>
          <ul>
            <li>Generate a Bluesky credibility score.</li>
            <li>Understand your AT Proto data footprint.</li>
            <li>Vibe check strangers and new accounts.</li>
          </ul>
          <h2>Intro</h2>
          <p>The <strong>cred.blue</strong> platform allows anyone to better understand the data footprint that an <strong>AT Protocol</strong> or <strong>Bluesky</strong> identity is creating. During its beta launch, <strong>cred.blue</strong> provides an early version of its custom scoring algorithm that generates a "credibility" score based on an identity's activity in the ecosystem. Additionally, there is an <strong>Alt Text Rating Tool</strong> that allows you to see how consistently an account includes accessibility alt-text when posting images on Bluesky.</p>
          
          <p>The <strong>cred.blue</strong> scoring methodology is intended to provide a helpful contextual analysis of the public data associated with an AT Protocol or Bluesky identity. The hope is that the scoring system might help incentivize healthier behaviors and activity patterns on the network.</p>

          <div className="scoring-info">
          <p><Link to="/methodology" className="methodology-link">Learn more about the scoring methodology</Link> and how to increase your score.</p>
          </div>
          
          <p>Future versions of cred.blue may include authenticated data analysis (for your personal AT Proto data that isn't public), a custom score/credibility tracking lexicon, and an in-app labeler for the Bluesky platform.</p>

          <a href="https://bsky.app/profile/did:plc:7lazllqgiktcts3gs4i6xtv6" target="_blank" rel="noreferrer">Follow cred.blue on Bluesky</a>

          <h2>FAQs</h2>
          
          <h3>Who created cred.blue?</h3>
          <p>It was created by <a href="https://bsky.app/profile/dame.is" target="_blank" rel="noreferrer">@dame.is</a>! Dame has been a part of the Bluesky community from almost the very beginning and is passionate about the AT Protocol. Dame was user number Bluesky user #1,216 and is building cred.blue independently.</p>

          <p>Consider becoming a paid supporter of Dame <a href="https://bsky.app/profile/dame.is" target="_blank" rel="noreferrer">@dame.is</a>! Dame has been a part of the Bluesky community from almost the very beginning and is passionate about the AT Protocol. Dame was Bluesky user #1,216 and is building cred.blue independently.</p>
          
          <h3>Why was cred.blue created?</h3>
          <p>Since its inception, Bluesky has relied upon an innovative domain verification system to help identities establish their credibility and authority. This system is powerful and should be taken advantage of, but it can only do so much in its current form. The cred.blue platform is just one experiment among many that is attempting to help people understand which social media accounts are more (or less) trustworthy.</p>
          
          <h3>Is this just a social credit score like they have in China?</h3>
          <p>Not at all! To begin with, the often imagined "social credit" system that many people think exists in China is not really real... to better understand the prevalent misconceptions people have about this subject, check out <a href="https://en.wikipedia.org/wiki/Social_Credit_System" target="_blank" rel="noreferrer">the Wikipedia article</a>.</p>
          
          <p>At its core, the cred.blue scoring system is just an attempt to help people understand the data footprint that is being left behind by every Bluesky or AT Protocol identity. In a world saturated in fake profiles or AI-controlled accounts, it's never been more vital to have resources that can help humans effectively and safely navigate their online spaces.</p>
          
          <h3>Why is cred.blue in a "beta" state?</h3>
          <p>To put it simply, cred.blue is very experimental and at this early stage things will likely change a lot. The first version of the scoring algorithm lays a foundation for future plans, but it will take some time (and real-world usage) to calibrate the model's weights and variables.</p>
       </div> 
      </main>
    </>
  );
};

export default About;
