import React, { useState } from 'react';
import './Definitions.css';
import { Link } from 'react-router-dom';

const Definitions = () => {
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

  // Helper function to add UTM parameters to links
  const addUtmParams = (url, source = "term_definition") => {
    // Check if URL already has parameters
    const hasParams = url.includes('?');
    const connector = hasParams ? '&' : '?';
    
    // Add UTM parameters
    return `${url}${connector}utm_source=cred.blue&utm_medium=definitions&utm_campaign=${source}`;
  };

  // Definitions data with added links
  const definitions = [
    {
      id: "pds",
      term: "Personal Data Server (PDS)",
      definition: "A server that hosts your AT Protocol data and content. You can use Bluesky's PDS hosting or choose a third-party PDS host for more control over your data. By default, new Bluesky accounts use Bluesky's PDS hosting, so the vast majority of accounts right now do not use a third-party PDS. Having a third-party PDS host contributes to the further decentralization of the network, but it is currently difficult to do.",
      learnMoreLink: "https://atproto.com/guides/self-hosting"
    },
    {
        id: "bsky-mushroom",
        term: "Bluesky Mushroom",
        definition: "All of Bluesky's PDS hosting servers are named after various types of mushrooms. If your account is on a Bluesky Mushroom, that means you are entrusting Bluesky with holding your data for you. To see a full list of the Bluesky Mushrooms, use the learn more link below.",
        learnMoreLink: "https://bsky-debug.app/"
    },
    {
      id: "did",
      term: "DID",
      definition: "The AT Protocol uses Decentralized Identifiers (DIDs) as persistent, long-term account identifiers. DID is a W3C standard, with many standardized and proposed DID method implementations. There are currently two methods supported by the protocol: did:plc and did:web. New Bluesky accounts use the did:plc method.",
      learnMoreLink: "https://atproto.com/specs/did"
    },
    {
      id: "lexicon",
      term: "Lexicon/Collection",
      definition: "The schema system used by the AT Protocol to define data structures. Lexicons are kind of like a file formats, and different AT Protocol apps can choose which of these file formats to support. Apps can have their own unique file formats as well. Third-party lexicons allow for custom features and extensions to the protocol. Lexicons are written in JSON and are sometimes referred to as collections.",
      learnMoreLink: "https://atproto.com/guides/lexicon"
    },
    {
      id: "rotation-key",
      term: "Rotation Key",
      definition: "A security key that allows you to recover your account if your primary credentials are compromised.",
      learnMoreLink: "https://atproto.com/guides/account-migration#updating-identity"
    },
    {
      id: "bluesky-eras",
      term: "Bluesky Eras",
      definition: "Ever since Bluesky was first incubated from within Twitter in 2019, it has been through numerous different defining eras. Each of these eras has had distinct qualities and even cultures. The main eras are as follows: 1. pre-history (staff, advisors, friends), 2. invite-only (the introduction of the invite system), 3. public release (anyone could create an account)",
      learnMoreLink: "https://atproto.com/guides/account-migration#updating-identity"
    },
    {
      id: "alt-text",
      term: "Alt Text",
      definition: "Text descriptions added to images that make content accessible to users with visual impairments or when images fail to load.",
      learnMoreLink: "https://accessibility.huit.harvard.edu/describe-content-images"
    },
    {
      id: "social-graph",
      term: "Social Graph",
      definition: "The network of connections between accounts, including followers, following, and engagement patterns.",
      learnMoreLink: "https://en.wikipedia.org/wiki/Social_graph"
    },
    {
      id: "labelers",
      term: "Labelers",
      definition: "Entities that can apply labels to content on Bluesky for moderation purposes. Users can choose which labelers they trust.",
      learnMoreLink: "https://docs.bsky.app/docs/advanced-guides/moderation"
    },
    {
      id: "engagement-rate",
      term: "Engagement Rate",
      definition: "A metric that measures how much interaction your content receives relative to your audience size.",
    }
  ];

  // Social status data with added links
  const socialStatuses = [
    {
      id: "newcomer",
      name: "Newcomer",
      description: "Accounts that are new to Bluesky or have minimal activity. These users are just getting started on the platform and beginning to build their presence. After 30 days, Newcomers become Explorers.",
    },
    {
      id: "explorer",
      name: "Explorer",
      description: "Users who are actively engaging with the platform, discovering features, and building their initial network. They have established a basic presence but are still growing their connections and potentially finding their community.",
    },
    {
      id: "pathfinder",
      name: "Pathfinder",
      description: "Established users who have developed a consistent presence and are actively contributing to conversations. These accounts have a growing influence (1,000+ followers) and solid engagement within their communities.",
    },
    {
      id: "guide",
      name: "Guide",
      description: "Well-established users who have significant influence within specific communities (10,000+ followers). They often create valuable content and maintain strong engagement with their followers.",
    },
    {
      id: "leader",
      name: "Leader",
      description: "Highly influential accounts with substantial followings (100,000+) and engagement. These users have a broad impact across multiple communities and consistently contribute high-value content to the platform.",
    }
  ];

  return (
    <>
      <main className="definitions-page">
        <div className="alt-card">
          <h1>Definitions | cred.blue</h1>
          
          <p className="intro-text">
            This page provides explanations for key terms related to Bluesky, the AT Protocol, and how the cred.blue scoring system works.
          </p>
          
          <div className="back-to-methodology">
            <Link to="/methodology">← Back to Scoring Methodology</Link>
          </div>
          
          <section className="definitions-section">
            <h2>Social Status Definitions</h2>
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
                    {status.learnMoreLink && (
                      <div className="learn-more-link">
                        <a 
                          href={addUtmParams(status.learnMoreLink, `social_status_${status.id}`)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Learn more about {status.name} status →
                        </a>
                      </div>
                    )}
                  </dd>
                </div>
              ))}
            </div>
          </section>
          
          <section className="definitions-section">
            <h2>AT Protocol & Bluesky Terms</h2>
            <p>
              Understanding these terms will help you better navigate the Bluesky ecosystem and interpret your cred.blue score.
            </p>
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
                    {item.learnMoreLink && (
                      <div className="learn-more-link">
                        <a 
                          href={addUtmParams(item.learnMoreLink, `term_${item.id}`)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Learn more about {item.term} →
                        </a>
                      </div>
                    )}
                  </dd>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Definitions;