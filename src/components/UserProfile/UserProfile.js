import React, { useEffect, useState, createContext, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData";
import { isDID, resolveDIDToHandle } from "../../utils/didUtils";
import Card from "../Card/Card";
import MatterLoadingAnimation from "../MatterLoadingAnimation";
import ScoreGauge from './ScoreGauge';
import CircularLogo from './CircularLogo';
import { Helmet } from 'react-helmet';
import ProfileCard from "./components/ProfileCard";
import NarrativeCard from "./components/NarrativeCard";
import PostTypeCard from "./components/PostTypeCard";
import AltTextCard from "./components/AltTextCard";
import ActivityCard from "./components/ActivityCard";
import ScoreBreakdownCard from "./components/ScoreBreakdownCard";
import ErrorPage from "../ErrorPage/ErrorPage";
import _ from 'lodash';

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./UserProfile.css";

// Memoized layouts configuration
const CARD_HEIGHT = 6;
const breakpoints = { lg: 850, md: 700, sm: 520, xs: 460, xxs: 0 };
const cols = { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 };

// Cache configuration
const userDataCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Move layouts outside component to prevent recreation
const createLayouts = () => ({
  lg: [
    { i: "ScoreBreakdownCard", x: 0, y: 0, w: 1, h: CARD_HEIGHT, static: false },
    { i: "NarrativeCard", x: 1, y: 0, w: 1, h: CARD_HEIGHT, static: false },
    { i: "ProfileCard", x: 0, y: CARD_HEIGHT, w: 1, h: CARD_HEIGHT, static: false },
    { i: "PostTypeCard", x: 1, y: CARD_HEIGHT, w: 1, h: CARD_HEIGHT, static: false },
    { i: "AltTextCard", x: 0, y: CARD_HEIGHT * 2, w: 1, h: CARD_HEIGHT, static: false },
    { i: "ActivityCard", x: 1, y: CARD_HEIGHT * 2, w: 1, h: CARD_HEIGHT, static: false }
  ],
  md: [
    { i: "ScoreBreakdownCard", x: 0, y: 0, w: 1, h: CARD_HEIGHT, static: false },
    { i: "NarrativeCard", x: 1, y: 0, w: 1, h: CARD_HEIGHT, static: false },
    { i: "ProfileCard", x: 0, y: CARD_HEIGHT, w: 1, h: CARD_HEIGHT, static: false },
    { i: "PostTypeCard", x: 1, y: CARD_HEIGHT, w: 1, h: CARD_HEIGHT, static: false },
    { i: "AltTextCard", x: 0, y: CARD_HEIGHT * 2, w: 1, h: CARD_HEIGHT, static: false },
    { i: "ActivityCard", x: 1, y: CARD_HEIGHT * 2, w: 1, h: CARD_HEIGHT, static: false }
  ],
  sm: [
    { i: "ScoreBreakdownCard", x: 0, y: 8, w: 1, h: 6, static: false },
    { i: "NarrativeCard", x: 0, y: 0, w: 1, h: 6, static: false },
    { i: "ProfileCard", x: 0, y: 14, w: 1, h: 6, static: false },
    { i: "PostTypeCard", x: 0, y: 22, w: 1, h: 6, static: false },
    { i: "AltTextCard", x: 0, y: 26, w: 1, h: 6, static: false },
    { i: "ActivityCard", x: 0, y: 30, w: 1, h: 6, static: false }
  ],
  xs: [
    { i: "ScoreBreakdownCard", x: 0, y: 8, w: 1, h: 6, static: false },
    { i: "NarrativeCard", x: 0, y: 0, w: 1, h: 6, static: false },
    { i: "ProfileCard", x: 0, y: 14, w: 1, h: 6, static: false },
    { i: "PostTypeCard", x: 0, y: 22, w: 1, h: 6, static: false },
    { i: "AltTextCard", x: 0, y: 26, w: 1, h: 6, static: false },
    { i: "ActivityCard", x: 0, y: 30, w: 1, h: 6, static: false }
  ],
  xxs: [
    { i: "ScoreBreakdownCard", x: 0, y: 8, w: 1, h: 6, static: false },
    { i: "NarrativeCard", x: 0, y: 0, w: 1, h: 8, static: false },
    { i: "ProfileCard", x: 0, y: 14, w: 1, h: 7, static: false },
    { i: "PostTypeCard", x: 0, y: 22, w: 1, h: 6, static: false },
    { i: "AltTextCard", x: 0, y: 26, w: 1, h: 6, static: false },
    { i: "ActivityCard", x: 0, y: 30, w: 1, h: 6, static: false }
  ]
});

// Memoized save function with debouncing
const createDebouncedSave = () => {
  let timeout;
  return async (userData) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        // Basic validation before sending
        if (!userData || !userData.did || !userData.handle) {
          console.error('Invalid user data format');
          return;
        }
        
        // Send to untrusted table
        const response = await fetch('https://api.cred.blue/api/save-user-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit user data');
        }
        
        console.log('User data submitted successfully for processing');
      } catch (error) {
        console.error('Error submitting user data:', error);
      }
    }, 1000);
  };
};

const processAccountData = (data) => {
  if (!data) return null;

  return {
    ...data,
    breakdown: {
      blueskyCategories: {
        profileQuality: {
          score: data.blueskyScore * 0.25,
          weight: 0.25,
          details: {
            profileCompleteness: data.profileCompleteness || 0,
            altTextConsistency: data.altTextConsistencyBonus || 0,
            customDomain: data.customDomainBonus || 0
          }
        },
        communityEngagement: {
          score: data.blueskyScore * 0.35,
          weight: 0.35,
          details: {
            socialGraph: data.socialGraphScore || 0,
            engagement: data.engagementScore || 0,
            replyActivity: data.activityScore || 0
          }
        },
        contentActivity: {
          score: data.blueskyScore * 0.25,
          weight: 0.25,
          details: {
            posts: data.activityDetails?.postsScore || 0,
            collections: data.collectionsScore?.bskyCollectionsScore || 0,
            labels: (data.labelBonus || 0) + (data.labelPenalty || 0)
          }
        },
        recognitionStatus: {
          score: data.blueskyScore * 0.15,
          weight: 0.15,
          details: {
            teamStatus: data.handleBonuses?.teamBonus || 0,
            contributorStatus: data.handleBonuses?.contributorBonus || 0,
            socialStatus: data.socialStatusBonus || 0
          }
        }
      },
      atprotoCategories: {
        decentralization: {
          score: data.atprotoScore * 0.45,
          weight: 0.45,
          details: {
            rotationKeys: data.rotationKeyBonus || 0,
            didWeb: data.didWebBonus || 0,
            thirdPartyPDS: data.thirdPartyPDSBonus || 0,
            customDomain: data.customDomainBonus || 0
          }
        },
        protocolActivity: {
          score: data.atprotoScore * 0.35,
          weight: 0.35,
          details: {
            nonBskyCollections: data.collectionsScore?.nonBskyCollectionsScore || 0,
            atprotoActivity: data.atprotoActivityBonus || 0
          }
        },
        accountMaturity: {
          score: data.atprotoScore * 0.20,
          weight: 0.20,
          details: {
            accountAge: data.accountAgeScore || 0,
            contributorStatus: data.handleBonuses?.contributorBonus || 0
          }
        }
      }
    }
  };
};

export const AccountDataContext = createContext(null);
const ResponsiveGridLayout = WidthProvider(Responsive);
const debouncedSaveUserData = createDebouncedSave();

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const cardRefs = useRef({});
  const [cardHeights, setCardHeights] = useState({});
  
  // Add state for saving and restoring layouts
  const [currentLayouts, setCurrentLayouts] = useState(() => {
    // Try to load saved layouts from localStorage
    const savedLayouts = localStorage.getItem('userProfileLayouts');
    return savedLayouts ? JSON.parse(savedLayouts) : createLayouts();
  });

  // Function to handle layout changes
  const handleLayoutChange = (layout, allLayouts) => {
    if (allLayouts) {
      // Save to state
      setCurrentLayouts(allLayouts);
      
      // Save to localStorage
      localStorage.setItem('userProfileLayouts', JSON.stringify(allLayouts));
    }
    
    // Update card heights after layout changes
    setTimeout(updateCardHeights, 100);
  };

  // Improved card height calculation
  const updateCardHeights = useMemo(() => {
    return () => {
      const rowHeight = 50; // Same as your rowHeight prop
      const margin = 20; // Same as your margin prop
      const newHeights = {};
      const currentWidth = window.innerWidth;
      
      // Determine current breakpoint
      let currentBreakpoint = 'lg';
      for (const [bp, width] of Object.entries(breakpoints)) {
        if (currentWidth <= width) {
          currentBreakpoint = bp;
        }
      }
      
      // Get the number of columns for the current breakpoint
      const numCols = cols[currentBreakpoint];
      
      // Adjust calculations based on available width
      const containerWidth = document.querySelector('.user-profile')?.clientWidth || window.innerWidth;
      const availableWidth = (containerWidth - (margin * (numCols + 1))) / numCols;
      
      Object.keys(cardRefs.current).forEach(key => {
        const element = cardRefs.current[key];
        if (element) {
          // Get the content element (assuming each card has a .card-content)
          const contentElement = element.querySelector('.card-content') || element;
          
          // Clone the element to measure its natural height without constraints
          const clone = contentElement.cloneNode(true);
          clone.style.position = 'absolute';
          clone.style.visibility = 'hidden';
          clone.style.width = `${availableWidth}px`;
          clone.style.height = 'auto';
          document.body.appendChild(clone);
          
          // Measure natural height
          const contentHeight = clone.scrollHeight;
          
          // Remove the clone
          document.body.removeChild(clone);
          
          // Calculate grid height based on content
          const gridHeight = Math.max(Math.ceil(contentHeight / rowHeight), 6);
          
          // Store the new height
          newHeights[key] = gridHeight;
        }
      });
      
      // Update layout with new heights
      const updatedLayouts = {};
      
      for (const [bp, layout] of Object.entries(currentLayouts)) {
        updatedLayouts[bp] = layout.map(item => {
          if (newHeights[item.i]) {
            return { ...item, h: newHeights[item.i] };
          }
          return item;
        });
      }
      
      // Only update if there are actual changes
      if (!_.isEqual(updatedLayouts, currentLayouts)) {
        setCurrentLayouts(updatedLayouts);
        localStorage.setItem('userProfileLayouts', JSON.stringify(updatedLayouts));
      }
      
      // Update state with new heights
      setCardHeights(newHeights);
    };
  }, [currentLayouts]);

  // Add a function to handle window resize events more effectively
  const handleWindowResize = useMemo(() => {
    return _.debounce(() => {
      // Update card heights and force layout refresh
      updateCardHeights();
      
      // Force a layout recalculation
      const gridLayoutElement = document.querySelector('.react-grid-layout');
      if (gridLayoutElement) {
        // This forces a reflow
        const temp = gridLayoutElement.offsetHeight;
      }
    }, 200);
  }, [updateCardHeights]);

  // Optimized data fetching with DID support
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);
        let handle = username;
    
        // Handle DID resolution if necessary
        if (isDID(username)) {
          try {
            handle = await resolveDIDToHandle(username);
            // Redirect to the handle-based URL
            navigate(`/${handle}`, { replace: true });
            return; // The navigation will trigger a new effect
          } catch (didError) {
            console.error("Error resolving DID:", didError);
            setError(`Could not resolve DID: ${didError.message}`);
            setLoading(false);
            return;
          }
        }
    
        // Check cache first
        const cachedData = userDataCache.get(handle);
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
          setAccountData(cachedData.data);
          setLoading(false);
          setShowContent(true);
          return;
        }
    
        const data = await loadAccountData(handle);
        if (data.error) throw new Error(data.error);
    
        // Process the data to ensure correct structure for the treemap
        const processed90DaysData = processAccountData(data.accountData90Days);
        
        // Update cache
        userDataCache.set(handle, {
          data: processed90DaysData,
          timestamp: Date.now()
        });
    
        setAccountData(processed90DaysData);
        
        // Debounced save to database
        await debouncedSaveUserData(processed90DaysData);
    
      } catch (err) {
        console.error("Error fetching account data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setShowContent(true);
          updateCardHeights();
        }, 500);
      }
    };
    fetchAccountData();
  }, [username, navigate, updateCardHeights]);

  // Add effect to initialize the layout on first render
  useEffect(() => {
    // Small delay to ensure DOM is ready
    setTimeout(updateCardHeights, 300);
    
    // Add a resize observer to each card to handle content changes
    const resizeObserver = new ResizeObserver(_.debounce(() => {
      updateCardHeights();
    }, 300));
    
    Object.values(cardRefs.current).forEach(ref => {
      if (ref) {
        resizeObserver.observe(ref);
      }
    });
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [updateCardHeights]);

  // Memoized resize handler
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      handleWindowResize.cancel();
    };
  }, [handleWindowResize]);

  if (loading) {
    return (
      <div className={`user-profile loading-container ${!loading && "fade-out"}`}>
        <MatterLoadingAnimation />
      </div>
    );
  }

  if (error || !accountData) {
    return <ErrorPage username={username} onNavigate={navigate} />;
  }

  const { displayName, handle: resolvedHandle } = accountData;

  return (
    <AccountDataContext.Provider value={accountData}>
      <Helmet>
        <title>{`${resolvedHandle}'s cred.blue Score`}</title>
        <meta name="description" content={`Check ${resolvedHandle}'s Bluesky score and data footprint on cred.blue`} />
        <meta property="og:title" content={`${resolvedHandle} - cred.blue Score`} />
        <meta property="og:description" content={`Check ${resolvedHandle}'s Bluesky score and data footprint on cred.blue`} />
        <meta property="og:url" content={`https://cred.blue/${resolvedHandle}`} />
        <meta name="twitter:title" content={`${resolvedHandle} - cred.blue Score`} />
        <meta name="twitter:description" content={`Check ${resolvedHandle}'s Bluesky score and data footprint on cred.blue`} />
      </Helmet>
      <div className={`user-profile ${showContent ? "fade-in" : "hidden"}`}>
        <div className="user-profile-container">
          <div className="profile-sections-wrapper">
            {/* Right Section */}
            <div className="profile-section right-section">
              <div className="user-profile-main">
                <div className="user-profile-name">
                  <h1>{displayName}</h1>
                  <h2>@{resolvedHandle}</h2>
                </div>
                <div className="user-profile-data-group">
                  <div className="user-profile-score">
                    <p><strong>Bluesky Score:</strong> {accountData.blueskyScore}</p>
                    <p><strong>ATProto Score:</strong> {accountData.atprotoScore}</p>
                  </div>
                  <div className="user-profile-activity">
                    <p><strong>Bluesky Status:</strong> {accountData.activityAll.bskyActivityStatus}</p>
                    <p><strong>ATProto Status:</strong> {accountData.activityAll.atprotoActivityStatus}</p>
                    </div>
                </div>
                <div className="share-button-container">
                  <button
                    className="share-button-profile"
                    type="button"
                    onClick={() => window.open(
                      `https://bsky.app/intent/compose?text=${encodeURIComponent(
                        `My @cred.blue score is ${accountData.combinedScore}! 🦋\n\nI've been on Bluesky for ${accountData.ageInDays} days, joined during the "${accountData.era.toLowerCase()}" era, and have a social status of "${accountData.socialStatus}"\n\nGet your score: cred.blue`
                      )}`, '_blank'
                    )}
                  >
                    Share Results
                  </button>
                  <button
                    className="comparea-button-profile"
                    type="button"
                    onClick={() => window.open(`https://cred.blue/compare`, '_blank')}
                  >
                    Compare Scores
                  </button>
                </div>
                <a className="bluesky-link" href={`https://bsky.app/profile/${resolvedHandle}`} target="_blank" rel="noopener noreferrer">View {resolvedHandle} on Bluesky</a>
              </div>
            </div>

            {/* Middle Section */}
            <div className="profile-section middle-section">
              <div className="user-profile-header-rechart">
                <ScoreGauge score={accountData.combinedScore} />
              </div>
              <div className="context-line">
                <p>Average is ~325, highest is ~789</p>
              </div>
              <div className="user-profile-badges">
                <h3>{accountData.socialStatus}</h3>
                <h3>{accountData.postingStyle}</h3>
              </div>
              <div className="user-profile-age">
                <h2>{Math.floor(accountData.ageInDays)} days old</h2>
              </div>
            </div>

            {/* Left Section */}
            <div className="profile-section left-section">
              <CircularLogo
                did={accountData.did}
                size={370}
                fontSize={35}
                textColor="#004f84"
              />
            </div>
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={currentLayouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={50}
          margin={[20, 20]}
          isDraggable={true}
          isResizable={true}
          useCSSTransforms={true}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".card-header"
          resizeHandles={['se']}
          compactType="vertical"
          preventCollision={false}
          autoSize={true}
          onBreakpointChange={(newBreakpoint) => {
            // Recalculate heights when breakpoint changes
            setTimeout(updateCardHeights, 100);
          }}
          onWidthChange={(width, margin, cols) => {
            // Recalculate heights when width changes
            setTimeout(updateCardHeights, 100);
          }}
        >
          <div key="ScoreBreakdownCard" className="grid-item" ref={el => cardRefs.current.ScoreBreakdownCard = el}>
            <Card title="Score Breakdown">
              <ScoreBreakdownCard />
            </Card>
          </div>
          <div key="NarrativeCard" className="grid-item" ref={el => cardRefs.current.NarrativeCard = el}>
            <Card title="Summary">
              <NarrativeCard />
            </Card>
          </div>
          <div key="PostTypeCard" className="grid-item" ref={el => cardRefs.current.PostTypeCard = el}>
            <Card title="Post Type Breakdown">
              <PostTypeCard />
            </Card>
          </div>
          <div key="ProfileCard" className="grid-item" ref={el => cardRefs.current.ProfileCard = el}>
            <Card title="Profile Data">
              <ProfileCard />
            </Card>
          </div>
          <div key="AltTextCard" className="grid-item" ref={el => cardRefs.current.AltTextCard = el}>
            <Card title="Alt Text Consistency">
              <AltTextCard />
            </Card>
          </div>
          <div key="ActivityCard" className="grid-item" ref={el => cardRefs.current.ActivityCard = el}>
            <Card title="Activity Overview">
              <ActivityCard />
            </Card>
          </div>
        </ResponsiveGridLayout>
      </div>
    </AccountDataContext.Provider>
  );
};

export default React.memo(UserProfile);