// src/components/Resources/Resources.jsx
import React, { useState, useEffect, useMemo } from 'react';
import './Resources.css';
import ResourceLoader from './ResourceLoader';
import { supabase } from '../../lib/supabaseClient';

const Resources = () => {
  // State management
  const [resources, setResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState('All');
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Category emojis mapping
  const categoryEmojis = {
    'All': '🔍',
    'Analytics': '📊',
    'Services': '🛠️',
    'Data': '💾',
    'Network': '🔄',
    'Clients': '📱',
    'Moderation': '🛡️',
    'Feeds': '📰',
    'Visualizations': '🎨',
    'Development': '👨‍💻',
    'Guides': '📚',
    'Misc': '🔮'
  };

  // Load saved user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('resourcesPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setActiveCategory(preferences.activeCategory || 'All');
        setQualityFilter(preferences.qualityFilter || 'All');
        setShowNewOnly(preferences.showNewOnly || false);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  // Save user preferences to localStorage
  useEffect(() => {
    const preferences = {
      activeCategory,
      qualityFilter,
      showNewOnly
    };
    localStorage.setItem('resourcesPreferences', JSON.stringify(preferences));
  }, [activeCategory, qualityFilter, showNewOnly]);

  // Fetch resources from Supabase
  useEffect(() => {
    async function fetchResources() {
      setIsLoading(true);
      try {
        // Fetch all resources with category and subcategory data
        const { data, error } = await supabase
          .from('resources')
          .select(`
            *,
            category:categories(id, name, emoji),
            subcategory:subcategories(id, name)
          `)
          .order('position');

        if (error) {
          throw error;
        }

        // Transform data to match the expected format
        const formattedResources = data.map(resource => ({
          ...resource,
          category: resource.category.name,
          subcategory: resource.subcategory ? resource.subcategory.name : null,
          emoji: resource.category.emoji,
          url: addUTMParameters(resource.url)
        }));

        setResources(formattedResources);
      } catch (error) {
        console.error('Error fetching resources:', error);
        // In case of error, we could use local data as fallback
        // setResources(localResourcesWithUTM);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, []);

  // Check if a resource is new (added in the last 14 days)
  const isNewResource = (date) => {
    if (!date) return false;
    const resourceDate = new Date(date);
    const now = new Date();
    const daysDiff = Math.floor((now - resourceDate) / (1000 * 60 * 60 * 24));
    return daysDiff < 14;
  };

  // Add UTM parameters to URLs
  const addUTMParameters = (url) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}utm_source=cred.blue&utm_medium=resources&utm_campaign=tools_directory`;
  };

  // Function to share the resources page on Bluesky
  const shareOnBluesky = () => {
    const shareText = `Check out this collection of Bluesky tools and resources from cred.blue! 🔧🦋\n\nFind analytics, feeds, alternative clients, and much more to enhance your Bluesky experience.\n\nExplore the tools: https://cred.blue/resources`;
    
    window.open(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
  };

  // Get all categories from resources
  const categories = useMemo(() => {
    if (resources.length === 0) return ['All'];
    const categoryNames = [...new Set(resources.map(item => item.category))];
    return ['All', ...categoryNames];
  }, [resources]);
  
  // Count resources per category
  const categoryCounts = useMemo(() => {
    const counts = { 'All': resources.length };
    resources.forEach(resource => {
      counts[resource.category] = (counts[resource.category] || 0) + 1;
    });
    return counts;
  }, [resources]);

  // Filter resources based on active category, search query, quality filter, and new filter
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Filter by category
      const categoryMatch = activeCategory === 'All' || resource.category === activeCategory;
      
      // Filter by search query
      const searchMatch = 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.domain && resource.domain.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by quality
      const qualityMatch = 
        qualityFilter === 'All' || 
        (qualityFilter === 'High' && resource.quality >= 4) ||
        (qualityFilter === 'Medium' && resource.quality === 3) ||
        (qualityFilter === 'Low' && resource.quality <= 2);
      
      // Filter by "new" status if the toggle is active
      const newMatch = !showNewOnly || isNewResource(resource.created_at);
      
      return categoryMatch && searchMatch && qualityMatch && newMatch;
    });
  }, [resources, activeCategory, searchQuery, qualityFilter, showNewOnly]);

  // Get featured resources
  const featuredResources = useMemo(() => {
    return resources.filter(resource => resource.featured);
  }, [resources]);
  
  // Group resources by category when "All" is selected
  const resourcesByCategory = useMemo(() => {
    if (activeCategory !== 'All') return {};
    
    const grouped = {};
    filteredResources.forEach(resource => {
      if (!grouped[resource.category]) {
        grouped[resource.category] = [];
      }
      grouped[resource.category].push(resource);
    });
    return grouped;
  }, [filteredResources, activeCategory]);
  
  // Should show featured section only when All category is selected
  const shouldShowFeatured = activeCategory === 'All';

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
            <div className="filter-dropdowns">
              {/* Category filter dropdown */}
              <div className="category-filter-dropdown">
                <select 
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="filter-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {categoryEmojis[category] || '🔹'} {category} ({categoryCounts[category] || 0})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Quality filter dropdown */}
              <div className="quality-filter">
                <select 
                  value={qualityFilter}
                  onChange={(e) => setQualityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Quality Levels</option>
                  <option value="High">High Quality</option>
                  <option value="Medium">Medium Quality</option>
                  <option value="Low">Low Quality</option>
                </select>
              </div>
              
              {/* New resources toggle */}
              <div className="new-filter">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showNewOnly}
                    onChange={() => setShowNewOnly(!showNewOnly)}
                  />
                  <span className="toggle-text">Recently Added Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {shouldShowFeatured && featuredResources.length > 0 && (
          <div className="featured-section">
            <h2>Featured Resources</h2>
            <p className="featured-description">Hand-selected tools that we love and use regularly. These are not sponsored or paid placements.</p>
            <div className="resources-grid">
              {featuredResources.map((resource, index) => (
                <ResourceCard 
                  key={`featured-${index}`} 
                  resource={resource} 
                  isNew={isNewResource(resource.created_at)}
                />
              ))}
            </div>
          </div>
        )}
        
        {activeCategory === 'All' ? (
          // When "All" is selected, show resources by category
          <div className="all-resources-section">
            <h2>All Resources ({filteredResources.length})</h2>
            
            {Object.keys(resourcesByCategory).map(category => (
              <div key={category} className="category-section">
                <h3 className="category-header">
                  {categoryEmojis[category] || '🔹'} {category} ({resourcesByCategory[category].length})
                </h3>
                <div className="resources-grid">
                  {resourcesByCategory[category].map((resource, index) => (
                    <ResourceCard 
                      key={`${category}-${index}`} 
                      resource={resource} 
                      isNew={isNewResource(resource.created_at)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // When a specific category is selected
          <div className="all-resources-section">
            <h2>{categoryEmojis[activeCategory] || '🔹'} {activeCategory} Resources ({filteredResources.length})</h2>
            {filteredResources.length > 0 ? (
              <div className="resources-grid">
                {filteredResources.map((resource, index) => (
                  <ResourceCard 
                    key={index} 
                    resource={resource} 
                    isNew={isNewResource(resource.created_at)}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No resources found matching your filters.</p>
              </div>
            )}
          </div>
        )}
        </>
        )}
       </div>
      </main>
    </>
  );
};

// ResourceCard component for displaying individual resources
const ResourceCard = ({ resource, isNew }) => {
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
        <div className="resource-header">
          <h3 className="resource-name">{resource.name}</h3>
          {isNew && (
            <span className="new-badge">NEW</span>
          )}
        </div>
        <p className="resource-description">{resource.description}</p>
        <p className="resource-domain">{resource.domain}</p>
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