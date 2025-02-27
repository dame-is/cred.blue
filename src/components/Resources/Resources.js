// src/components/Resources/Resources.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './Resources.css';
import { Link } from 'react-router-dom';
import ResourceLoader from './ResourceLoader';

const Resources = () => {
  // State management
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Resources data structure
  const resourcesData = [
    // Analytics & Metrics - Personal Stats
    { 
      name: "Alt Text Rating Tool", 
      url: "https://dame.is/ratingalttext", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Check how consistently you use alt text", 
      quality: 5,
      featured: true
    },
    { 
      name: "Skeet Reviewer", 
      url: "https://reviewer.skeet.tools", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Use the KonMari method to sort through your old posts", 
      quality: 5,
      featured: true
    },
    { 
      name: "Venn Diagram", 
      url: "https://venn.aviva.gay/dame.bsky.social", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Visualize your social graph", 
      quality: 4,
      featured: false
    },
    { 
      name: "SkyZoo", 
      url: "https://skyzoo.blue/", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Profile metrics and fun stats", 
      quality: 4,
      featured: false
    },
    { 
      name: "SkyKit", 
      url: "http://skykit.blue", 
      category: "Analytics",
      subcategory: "Personal Stats",
      description: "Bluesky analytics", 
      quality: 4,
      featured: true
    },
    
    // Analytics & Metrics - Platform Stats
    { 
      name: "Bcounter", 
      url: "http://bcounter.nat.vg", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Realtime user growth dashboard", 
      quality: 4,
      featured: false
    },
    { 
      name: "Emojistats", 
      url: "https://emojistats.bsky.sh", 
      category: "Analytics",
      subcategory: "Platform Stats",
      description: "Real-time emoji usage data", 
      quality: 3,
      featured: false
    },
    
    // Services & AppViews
    { 
      name: "Mutesky", 
      url: "https://mutesky.app/", 
      category: "Services",
      subcategory: "AppViews",
      description: "Manage your muted words in bulk", 
      quality: 4,
      featured: false
    },
    { 
      name: "Frontpage", 
      url: "https://frontpage.fyi", 
      category: "Services",
      subcategory: "AppViews",
      description: "Decentralized link aggregator", 
      quality: 5,
      featured: true
    },
    { 
      name: "Graze", 
      url: "https://www.graze.social/", 
      category: "Feeds",
      subcategory: "Feed Tools",
      description: "No-Code feed creator", 
      quality: 5,
      featured: true
    },
    
    // Data Management
    { 
      name: "Bulk Thread Gating", 
      url: "https://boat.kelinci.net/bsky-threadgate-applicator", 
      category: "Data",
      subcategory: "Management",
      description: "Bulk retroactive thread gating", 
      quality: 3,
      featured: false
    },
    { 
      name: "SkySweeper", 
      url: "https://skysweeper.p8.lu", 
      category: "Data",
      subcategory: "Management",
      description: "Auto-delete old skeets", 
      quality: 4,
      featured: false
    },
    
    // Network Management
    { 
      name: "Network Analyzer", 
      url: "http://bsky-follow-finder.theo.io", 
      category: "Network",
      subcategory: "Management",
      description: "Find and analyze your network connections", 
      quality: 4,
      featured: true
    },
    { 
      name: "Gentle Unfollow", 
      url: "https://bsky.cam.fyi/unfollow", 
      category: "Network",
      subcategory: "Management",
      description: "Track and manage who you're following", 
      quality: 4,
      featured: true
    },
    
    // Alternative Clients
    { 
      name: "deck.blue", 
      url: "http://deck.blue", 
      category: "Clients",
      subcategory: "Alternative",
      description: "TweetDeck for Bluesky", 
      quality: 4,
      featured: false
    },
    { 
      name: "Graysky", 
      url: "https://graysky.app", 
      category: "Clients",
      subcategory: "Alternative",
      description: "Alternative mobile client", 
      quality: 5,
      featured: false
    },
    
    // Labelers & Moderation
    { 
      name: "US Politics Labeler", 
      url: "https://bsky.app/profile/uspol.bluesky.bot", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Labels political content", 
      quality: 4,
      featured: true
    },
    { 
      name: "Pronouns Labeler", 
      url: "https://bsky.app/profile/pronouns.adorable.mom", 
      category: "Moderation",
      subcategory: "Labelers",
      description: "Adds pronoun information to profiles", 
      quality: 4,
      featured: true
    },
    
    // Feeds & Discovery
    { 
      name: "Quiet Posters", 
      url: "https://bsky.app/profile/did:plc:vpkhqolt662uhesyj6nxm7ys/feed/infreq", 
      category: "Feeds",
      subcategory: "Discovery",
      description: "Feed of less frequent posters", 
      quality: 3,
      featured: false
    },
    
    // Visualizations
    { 
      name: "Bluesky by the Second", 
      url: "https://sky.flikq.dev", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Live visualization of the firehose", 
      quality: 3,
      featured: false
    },
    { 
      name: "Final Words", 
      url: "https://deletions.bsky.bad-example.com", 
      category: "Visualizations",
      subcategory: "Firehose",
      description: "Glimpses of deleted posts", 
      quality: 3,
      featured: true
    },
    
    // Developer Tools
    { 
      name: "pdsls.dev", 
      url: "https://pdsls.dev/", 
      category: "Development",
      subcategory: "Tools",
      description: "Browse AtProto repositories", 
      quality: 5,
      featured: true
    },
    { 
      name: "sdk.blue", 
      url: "http://sdk.blue", 
      category: "Development",
      subcategory: "Tools",
      description: "Libraries & SDKs for the AT Protocol", 
      quality: 4,
      featured: false
    },
    
    // Guides & Documentation
    { 
      name: "Verify Your Account", 
      url: "https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial", 
      category: "Guides",
      subcategory: "Documentation",
      description: "How to verify your Bluesky account", 
      quality: 4,
      featured: false
    },
    { 
      name: "Complete Guide to Bluesky", 
      url: "https://mackuba.eu/2024/02/21/bluesky-guide/", 
      category: "Guides",
      subcategory: "Documentation",
      description: "Comprehensive Bluesky guide", 
      quality: 5,
      featured: false
    },
    
    // Miscellaneous
    { 
      name: "Thread Composer", 
      url: "https://bluesky-thread-composer.pages.dev", 
      category: "Misc",
      subcategory: "Tools",
      description: "Create and organize threads", 
      quality: 3,
      featured: false
    },
    { 
      name: "Skyview", 
      url: "https://skyview.social", 
      category: "Misc",
      subcategory: "Tools",
      description: "Share threads with people without an account", 
      quality: 4,
      featured: false
    },
    { 
      name: "down.blue", 
      url: "https://down.blue", 
      category: "Misc",
      subcategory: "Tools",
      description: "Video downloader", 
      quality: 3,
      featured: false
    }
  ];

  // Add UTM parameters to all URLs
  const resourcesWithUTM = resourcesData.map(resource => ({
    ...resource,
    url: `${resource.url}${resource.url.includes('?') ? '&' : '?'}utm_source=cred.blue&utm_medium=resources&utm_campaign=tools_directory`
  }));

  // Function to share the resources page on Bluesky
  const shareOnBluesky = () => {
    const shareText = `Check out this collection of Bluesky tools and resources from cred.blue! 🔧🦋\n\nFind analytics, feeds, alternative clients, and much more to enhance your Bluesky experience.\n\nExplore the tools: https://cred.blue/resources`;
    
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  // Get all categories
  const categories = ['All', ...new Set(resourcesWithUTM.map(item => item.category))];

  // Filter resources based on active category, search query, and quality filter
  const filteredResources = useMemo(() => {
    return resourcesWithUTM.filter(resource => {
      // Filter by category
      const categoryMatch = activeCategory === 'All' || resource.category === activeCategory;
      
      // Filter by search query
      const searchMatch = 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by quality
      const qualityMatch = 
        qualityFilter === 'All' || 
        (qualityFilter === 'High' && resource.quality >= 4) ||
        (qualityFilter === 'Medium' && resource.quality === 3) ||
        (qualityFilter === 'Low' && resource.quality <= 2);
      
      return categoryMatch && searchMatch && qualityMatch;
    });
  }, [resourcesWithUTM, activeCategory, searchQuery, qualityFilter]);

  // Get featured resources
  const featuredResources = useMemo(() => {
    return resourcesWithUTM.filter(resource => resource.featured);
  }, [resourcesWithUTM]);
  
  // Simulate loading data
  useEffect(() => {
    // Simulate API fetch with a timeout
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <>
      <main className="resources-page">
       <div className="alt-card">
        <div className="resources-header">
          <h1>Bluesky Resources</h1>
          <ul>
            <li>Find tools to enhance your Bluesky experience.</li>
            <li>Discover analytics, feeds, clients, and more.</li>
            <li>Explore community-built solutions.</li>
          </ul>
          <p className="resources-description">A curated collection of third-party tools, services, and guides for the Bluesky ecosystem</p>
          
          <div className="share-button-container">
            <button
              className="share-button"
              type="button"
              onClick={shareOnBluesky}
            >
              Share This Page
            </button>
          </div>
        </div>
        
        <div className="resources-disclaimer">
          <p><strong>Disclaimer:</strong> These resources are third-party tools and services not affiliated with cred.blue or Bluesky. 
          Use them at your own risk and exercise caution when providing access to your data.</p>
        </div>
        
        {isLoading ? (
          <ResourceLoader />
        ) : (
        <>
        <div className="resources-filters">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-options">
            <div className="category-filters">
              {categories.map(category => (
                <button 
                  key={category}
                  className={`category-filter ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="quality-filter">
              <select 
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className="quality-select"
              >
                <option value="All">All Quality Levels</option>
                <option value="High">High Quality</option>
                <option value="Medium">Medium Quality</option>
                <option value="Low">Low Quality</option>
              </select>
            </div>
          </div>
        </div>
        
        {featuredResources.length > 0 && (
          <div className="featured-section">
            <h2>Featured Resources</h2>
            <div className="resources-grid">
              {featuredResources.map((resource, index) => (
                <ResourceCard key={`featured-${index}`} resource={resource} />
              ))}
            </div>
          </div>
        )}
        
        <div className="all-resources-section">
          <h2>{activeCategory === 'All' ? 'All Resources' : activeCategory}</h2>
          {filteredResources.length > 0 ? (
            <div className="resources-grid">
              {filteredResources.map((resource, index) => (
                <ResourceCard key={index} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No resources found matching your filters.</p>
            </div>
          )}
        </div>
        </>
        )}
       </div>
      </main>
    </>
  );
};

// ResourceCard component for displaying individual resources
const ResourceCard = ({ resource }) => {
  // Function to render stars based on quality rating
  const renderQualityStars = (quality) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`quality-star ${i <= quality ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="resource-card"
    >
      <div className="resource-content">
        <h3 className="resource-name">{resource.name}</h3>
        <p className="resource-description">{resource.description}</p>
        <div className="resource-meta">
          <span className="resource-category">{resource.category}</span>
          <div className="resource-quality">
            {renderQualityStars(resource.quality)}
          </div>
        </div>
      </div>
    </a>
  );
};

export default Resources;