// src/components/Resources/Resources.jsx - Updated for multiple categories
import React, { useState, useEffect, useMemo } from 'react';
import './Resources.css';
import ResourceLoader from './ResourceLoader';
import { supabase } from '../../lib/supabase';

const Resources = () => {
  // State management
  const [resources, setResources] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [qualityFilter, setQualityFilter] = useState(0); // Changed to numeric value (0 = All)
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
        setQualityFilter(preferences.qualityFilter || 0);
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
        // First fetch all resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select(`
            *,
            subcategory:subcategories(id, name)
          `)
          .order('position');

        if (resourcesError) {
          throw resourcesError;
        }

        // Then fetch the categories for each resource using the junction table
        const { data: resourceCategories, error: categoriesError } = await supabase
          .from('resources_categories')
          .select(`
            resource_id,
            category:categories(id, name, emoji)
          `);

        if (categoriesError) {
          throw categoriesError;
        }

        // Group categories by resource_id
        const categoriesByResource = {};
        resourceCategories.forEach(item => {
          if (!categoriesByResource[item.resource_id]) {
            categoriesByResource[item.resource_id] = [];
          }
          categoriesByResource[item.resource_id].push({
            id: item.category.id,
            name: item.category.name,
            emoji: item.category.emoji
          });
        });

        // Transform data to match the expected format
        const formattedResources = resourcesData.map(resource => {
          // Get categories for this resource
          const resourceCategoryList = categoriesByResource[resource.id] || [];
          
          return {
            ...resource,
            // Primary category for backwards compatibility (use first category if available)
            category: resourceCategoryList.length > 0 ? resourceCategoryList[0].name : 'Misc',
            // Store all categories
            categories: resourceCategoryList,
            subcategory: resource.subcategory ? resource.subcategory.name : null,
            emoji: resourceCategoryList.length > 0 ? resourceCategoryList[0].emoji : '🔮',
            url: addUTMParameters(resource.url)
          };
        });

        setResources(formattedResources);
      } catch (error) {
        console.error('Error fetching resources:', error);
        // In case of error, we could use local data as fallback
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
    
    // Extract all unique categories from all resources
    const allCategories = new Set();
    resources.forEach(resource => {
      if (resource.categories && resource.categories.length > 0) {
        resource.categories.forEach(cat => allCategories.add(cat.name));
      }
    });
    
    return ['All', ...Array.from(allCategories).sort()];
  }, [resources]);
  
  // Count resources per category
  const categoryCounts = useMemo(() => {
    const counts = { 'All': resources.length };
    
    resources.forEach(resource => {
      if (resource.categories && resource.categories.length > 0) {
        resource.categories.forEach(category => {
          counts[category.name] = (counts[category.name] || 0) + 1;
        });
      }
    });
    
    return counts;
  }, [resources]);

  // Check if a resource belongs to a category
  const resourceHasCategory = (resource, categoryName) => {
    if (categoryName === 'All') return true;
    return resource.categories && resource.categories.some(cat => cat.name === categoryName);
  };

  // Filter resources based on active category, search query, quality filter, and new filter
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Filter by category
      const categoryMatch = resourceHasCategory(resource, activeCategory);
      
      // Filter by search query
      const searchMatch = 
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.domain && resource.domain.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Filter by quality (changed to numeric)
      const qualityMatch = 
        qualityFilter === 0 || 
        resource.quality >= qualityFilter;
      
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
    
    // First, initialize all category groups
    categories.forEach(category => {
      if (category !== 'All') {
        grouped[category] = [];
      }
    });
    
    // Then add resources to their respective categories
    filteredResources.forEach(resource => {
      if (resource.categories && resource.categories.length > 0) {
        // Add resource to each of its categories
        resource.categories.forEach(category => {
          if (!grouped[category.name]) {
            grouped[category.name] = [];
          }
          // Avoid duplicates (could happen if we process the same resource multiple times)
          if (!grouped[category.name].some(r => r.id === resource.id)) {
            grouped[category.name].push(resource);
          }
        });
      } else {
        // If no categories, add to Misc
        if (!grouped['Misc']) {
          grouped['Misc'] = [];
        }
        grouped['Misc'].push(resource);
      }
    });
    
    // Remove empty categories
    Object.keys(grouped).forEach(category => {
      if (grouped[category].length === 0) {
        delete grouped[category];
      }
    });
    
    return grouped;
  }, [filteredResources, activeCategory, categories]);
  
  // Should show featured section only when All category is selected, no quality filter is active, and search query is empty
  const shouldShowFeatured = activeCategory === 'All' && qualityFilter === 0 && searchQuery.trim() === '';

  // Handle star rating click for quality filter
  const handleStarClick = (rating) => {
    setQualityFilter(rating === qualityFilter ? 0 : rating);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <main className="resources-page">
      <div className="alt-card">
        {/* Redesigned Header Section */}
        <header className="resources-header">
          <div className="header-main">
            <h1>Bluesky & AT Protocol Resources</h1>
            <div className="header-tagline">
              <p>A curated collection of tools and services for the Bluesky ecosystem</p>
            </div>
          </div>
          
          <div className="search-filters-container">
            <div className="search-container">
              <span className="search-icon">🔎</span>
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
                aria-label="Search resources"
              />
            </div>
            
            <div className="quick-actions">
              <button
                className="share-button"
                type="button"
                onClick={shareOnBluesky}
                aria-label="Share this page on Bluesky"
              >
                <span className="share-icon">📤</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        </header>
        
        <div className="filter-disclaimer-container">

          {/* Improved Filter Bar */}
        <div className="resources-filters">
          <div className="filter-options">
            <div className="filter-dropdowns">
              {/* Category filter dropdown */}
              <div className="category-filter-dropdown">
                <label htmlFor="category-select" className="filter-label">Category:</label>
                <select 
                  id="category-select"
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
              
              {/* Quality Filter using Stars */}
              <div className="quality-filter">
                <span className="filter-label">Quality:</span>
                <div className="star-filter-container">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <span 
                      key={rating}
                      onClick={() => handleStarClick(rating)}
                      className={`quality-star ${rating <= qualityFilter ? 'filled' : 'empty'}`}
                      title={`${rating} stars or higher`}
                      role="button"
                      tabIndex="0"
                      aria-label={`Filter by ${rating} stars or higher`}
                      onKeyPress={(e) => e.key === 'Enter' && handleStarClick(rating)}
                    >
                      ★
                    </span>
                  ))}
                  {qualityFilter > 0 && (
                    <span 
                      className="quality-filter-clear"
                      onClick={() => setQualityFilter(0)}
                      title="Clear filter"
                      role="button"
                      tabIndex="0"
                      aria-label="Clear quality filter"
                      onKeyPress={(e) => e.key === 'Enter' && setQualityFilter(0)}
                    >
                      ✕
                    </span>
                  )}
                </div>
              </div>
              
              {/* New resources toggle */}
              <div className="new-filter">
                <label className="toggle-label" htmlFor="new-toggle">
                  <input
                    id="new-toggle"
                    type="checkbox"
                    checked={showNewOnly}
                    onChange={() => setShowNewOnly(!showNewOnly)}
                    aria-label="Show only recently added resources"
                  />
                  <span className="toggle-text">Recently Added</span>
                </label>
              </div>
            </div>
          </div>
        </div>

          <div className="resources-disclaimer">
            <div className="disclaimer-icon">⚠️</div>
            <p><strong>Disclaimer:</strong> These resources are not affiliated with cred.blue or Bluesky. Use them at your own risk and exercise caution when providing access to your data.</p>
          </div>

        </div>
        
        {/* Loading indication */}
        {isLoading ? (
          <ResourceLoader />
        ) : (
        <>
          {/* Featured Section - Hidden when quality filter is active or search query is not empty */}
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
              
              {Object.keys(resourcesByCategory).sort().map(category => (
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
          <div className="resource-categories">
            {resource.categories && resource.categories.length > 0 ? (
              resource.categories.map((cat, idx) => (
                <span key={idx} className="resource-category">
                  {cat.name}
                </span>
              ))
            ) : (
              <span className="resource-category">Misc</span>
            )}
          </div>
          <div className="resource-quality">
            {renderQualityStars(resource.quality)}
          </div>
        </div>
      </div>
    </a>
  );
};

export default Resources;