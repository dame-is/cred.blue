import React, { useState } from 'react';
import './ScoringMethodology.css';
import ScoreGauge from '../UserProfile/ScoreGauge';

const ScoringMethodology = () => {
  // State to track which definition is expanded
  const [expandedTerm, setExpandedTerm] = useState(null);
  // State to track which social status is expanded
  const [expandedStatus, setExpandedStatus] = useState(null);

  // Toggle function for definitions accordion
  const toggleTerm = (term) => {
    if (expandedTerm === term) {
      setExpandedTerm(null);
    } else {
      setExpandedTerm(term);
    }
  };

  // Toggle function for social status accordion
  const toggleStatus = (status) => {
    if (expandedStatus === status) {
      setExpandedStatus(null);
    } else {
      setExpandedStatus(status);
    }
  };

  // Definitions data
  const definitions = [
    {
      id: "pds",
      term: "Personal Data Server (PDS)",
      definition: "A server that hosts your AT Protocol data and content. You can use Bluesky's PDS or choose a third-party PDS for more control over your data."
    },
    {
      id: "lexicon",
      term: "Lexicon",
      definition: "The schema system used by the AT Protocol to define data structures. Third-party lexicons allow for custom features and extensions to the protocol."
    },
    {
      id: "plc",
      term: "PLC (Decentralized Identity)",
      definition: "The Personal Ledger of Claims system that manages identities in the AT Protocol. PLC logs contain cryptographic proofs of identity ownership."
    },
    {
      id: "rotation-key",
      term: "Rotation Key",
      definition: "A security feature that allows you to recover your account if your primary credentials are compromised."
    },
    {
      id: "alt-text",
      term: "Alt Text",
      definition: "Text descriptions added to images that make content accessible to users with visual impairments or when images fail to load."
    },
    {
      id: "social-graph",
      term: "Social Graph",
      definition: "The network of connections between accounts, including followers, following, and engagement patterns."
    },
    {
      id: "labelers",
      term: "Labelers",
      definition: "Entities that can apply labels to content on Bluesky for moderation purposes. Users can choose which labelers they trust."
    },
    {
      id: "engagement-rate",
      term: "Engagement Rate",
      definition: "A metric that measures how much interaction your content receives relative to your audience size."
    }
  ];

  // Social status data
  const socialStatuses = [
    {
      id: "newcomer",
      name: "Newcomer",
      description: "Accounts that are new to Bluesky or have minimal activity. These users are just getting started on the platform and beginning to build their presence."
    },
    {
      id: "explorer",
      name: "Explorer",
      description: "Users who are actively engaging with the platform, discovering features, and building their initial network. They have established a basic presence but are still growing their connections."
    },
    {
      id: "pathfinder",
      name: "Pathfinder",
      description: "Established users who have developed a consistent presence and are actively contributing to conversations. These accounts have a growing influence and solid engagement within their communities."
    },
    {
      id: "guide",
      name: "Guide",
      description: "Well-established users who have significant impact within specific communities. They often create valuable content and maintain strong engagement with their followers."
    },
    {
      id: "leader",
      name: "Leader",
      description: "Highly influential accounts with substantial followings and engagement. These users have a broad impact across multiple communities and consistently contribute high-value content to the platform."
    }
  ];

  return (
    <main className="methodology-page">
      <div className="alt-card">
        <h1>The Scoring Methodology</h1>
        <div className="methodology-page-chart">
          <ScoreGauge score={500} />
        </div>
        <p>Your cred.blue score is generated based on two major categories...</p>
        
        <h3>1. Bluesky Data</h3>
        <ul className="methodology-list">
          <li>Profile content (avatar, description, etc)</li>
          <li>Posts, likes, lists, etc</li>
          <li>Social graph</li>
          <li>Labelers and moderation</li>
          <li>etc.</li>
        </ul>
        
        <h3>2. AT Protocol Data</h3>
        <ul className="methodology-list">
          <li>Personal Data Server (PDS)</li>
          <li>Third-party lexicon usage</li>
          <li>Domain name</li>
          <li>PLC logs</li>
          <li>etc.</li>
        </ul>
        
        <p>
          Separate scores are generated for each category and then combined to produce your final cred.blue score, allowing you to easily see which major category (Bluesky vs AT Proto) has the most impact on your score.
        </p>
        
        <h2>Score Ranges</h2>
        <p>
          For Version 1 of the scoring algorithm, there is a max score of 1,000 points. This may change in the future, or it could theoretically even be scaled down depending on feedback and usage.
        </p>
        <p>
          A score between 0-300 likely indicates that an account is either very new to the network or isn't very active. A score of 300-700 is within a "healthy" range. Scores that are 700+ typically indicate accounts that have been around awhile and are very active. The different score ranges are still in early development along with the algorithm, so these details are likely to change.
        </p>
        
        <h2>How do I increase my score?</h2>
        <p>
          The scoring methodology is fairly complex and not all of the variables can be easily changed (for instance, an account's age), but there are some specific actions you can take that can help give you a boost:
        </p>
        <ol className="increase-score-list">
          <li>Fully complete your Bluesky profile</li>
          <li>Focus on posting things people will enjoy or find helpful</li>
          <li>Use more of Bluesky's features</li>
          <li>Add a custom domain name</li>
          <li>Use a third-party PDS</li>
          <li>Remember to add alt text to images</li>
          <li>Add your own rotation key</li>
          <li>Set your pronouns</li>
        </ol>
        <p>
          This is not an exhaustive list by any means, but it should get you started. The goal of the cred.blue score isn't to attempt to max it out... rather, the point is to foster healthy behavior and activity that benefits the
          entire community.
        </p>
        
        <h2>What are the different social statuses?</h2>
        <p>
          Rather than displaying follower counts on profiles, the cred.blue analysis categorizes each identity into one of five social statuses based on its follower count, social graph ratio, engagement rate, and age. There are additional labels placed before the social status to indicate how engaging the account actually is.
        </p>
        <div className="social-statuses-container definitions-container">
          {socialStatuses.map((status) => (
            <div key={status.id} className="definition-item">
              <dt 
                className="definition-term" 
                onClick={() => toggleStatus(status.id)}
                role="button"
                aria-expanded={expandedStatus === status.id}
              >
                {status.name}
                {expandedStatus === status.id ? 
                  <span className="toggle-icon" aria-hidden="true">−</span> : 
                  <span className="toggle-icon" aria-hidden="true">+</span>
                }
              </dt>
              <dd 
                className={`definition-description ${expandedStatus === status.id ? 'expanded' : ''}`}
                aria-hidden={expandedStatus !== status.id}
              >
                {status.description}
              </dd>
            </div>
          ))}
        </div>
        
        <h2>Key Terms and Definitions</h2>
        <div className="definitions-container">
          {definitions.map((item) => (
            <div key={item.id} className="definition-item">
              <dt 
                className="definition-term" 
                onClick={() => toggleTerm(item.id)}
                role="button"
                aria-expanded={expandedTerm === item.id}
              >
                {item.term}
                {expandedTerm === item.id ? 
                  <span className="toggle-icon" aria-hidden="true">−</span> : 
                  <span className="toggle-icon" aria-hidden="true">+</span>
                }
              </dt>
              <dd 
                className={`definition-description ${expandedTerm === item.id ? 'expanded' : ''}`}
                aria-hidden={expandedTerm !== item.id}
              >
                {item.definition}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ScoringMethodology;