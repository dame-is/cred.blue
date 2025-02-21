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
import { supabase } from '../../lib/supabase';
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
    { i: "NarrativeCard", x: 1, y: 0, w: 1, h: 6, static: false },
    { i: "ProfileCard", x: 0, y: 14, w: 1, h: 6, static: false },
    { i: "PostTypeCard", x: 1, y: 22, w: 1, h: 6, static: false },
    { i: "AltTextCard", x: 0, y: 26, w: 1, h: 6, static: false },
    { i: "ActivityCard", x: 1, y: 30, w: 1, h: 6, static: false }
  ],
  xxs: [
    { i: "ScoreBreakdownCard", x: 0, y: 8, w: 1, h: 6, static: false },
    { i: "NarrativeCard", x: 1, y: 0, w: 1, h: 8, static: false },
    { i: "ProfileCard", x: 0, y: 14, w: 1, h: 7, static: false },
    { i: "PostTypeCard", x: 1, y: 22, w: 1, h: 6, static: false },
    { i: "AltTextCard", x: 0, y: 26, w: 1, h: 6, static: false },
    { i: "ActivityCard", x: 1, y: 30, w: 1, h: 6, static: false }
  ]
});

const layouts = createLayouts();

// Memoized save function with debouncing
const createDebouncedSave = () => {
  let timeout;
  return async (userData) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('user_scores')
          .upsert({
            // Basic profile info
            handle: userData.handle,
            display_name: userData.displayName,
            did: userData.did,
            profile_edited_date: userData.profileEditedDate,
            profile_completion: userData.profileCompletion,
            
            // Score fields
            combined_score: userData.combinedScore,
            bluesky_score: userData.blueskyScore,
            atproto_score: userData.atprotoScore,
            
            // Activity metrics
            activity_status: userData.activityAll.activityStatus,
            bsky_activity_status: userData.activityAll.bskyActivityStatus,
            atproto_activity_status: userData.activityAll.atprotoActivityStatus,
            total_collections: userData.activityAll.totalCollections,
            total_bsky_collections: userData.activityAll.totalBskyCollections,
            total_non_bsky_collections: userData.activityAll.totalNonBskyCollections,
            total_records: userData.activityAll.totalRecords,
            total_bsky_records: userData.activityAll.totalBskyRecords,
            total_non_bsky_records: userData.activityAll.totalNonBskyRecords,
            plc_operations: userData.activityAll.plcOperations,
            blobs_count: userData.activityAll.blobsCount,
            
            // Store category data as JSONB
            blueskycategories: userData.blueskyCategories,
            atprotocategories: userData.atprotoCategories,
            
            // Metadata fields
            service_endpoint: userData.serviceEndpoint,
            pds_type: userData.pdsType,
            created_at: userData.createdAt,
            age_in_days: userData.ageInDays,
            age_percentage: userData.agePercentage,
            followers_count: userData.followersCount,
            follows_count: userData.followsCount,
            posts_count: userData.postsCount,
            rotation_keys: userData.rotationKeys,
            era: userData.era,
            posting_style: userData.postingStyle,
            social_status: userData.socialStatus,
            
            // Store complex metrics as JSONB
            engagement_metrics: userData.engagementMetrics,
            weekly_activity: userData.weeklyActivity,
            
            // Store full profile data
            profile_data: userData.profile,
            
            // Update timestamp
            last_checked_at: new Date()
          }, {
            onConflict: 'handle'
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }, 1000);
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

  // Memoize layout-related calculations
  const updateCardHeights = useMemo(() => {
    return () => {
      const rowHeight = 50;
      const newHeights = {};
      
      Object.keys(cardRefs.current).forEach(key => {
        const element = cardRefs.current[key];
        if (element) {
          const contentHeight = element.scrollHeight;
          const gridHeight = Math.ceil(contentHeight / rowHeight);
          newHeights[key] = Math.max(gridHeight, 6);
        }
      });
      
      setCardHeights(newHeights);
    };
  }, []);

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

        // Update cache
        userDataCache.set(handle, {
          data: data.accountData90Days,
          timestamp: Date.now()
        });

        setAccountData(data.accountData90Days);
        
        // Debounced save to database
        await debouncedSaveUserData(data.accountData90Days);

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

  // Memoized resize handler
  useEffect(() => {
    const handleResize = _.debounce(() => {
      updateCardHeights();
    }, 250);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, [updateCardHeights]);

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
        <meta name="description" content={`Check ${resolvedHandle}'s Bluesky credibility score and data footprint on cred.blue`} />
        <meta property="og:title" content={`${resolvedHandle} - cred.blue Score`} />
        <meta property="og:description" content={`Check ${resolvedHandle}'s Bluesky credibility score and data footprint on cred.blue`} />
        <meta property="og:url" content={`https://cred.blue/${resolvedHandle}`} />
        <meta name="twitter:title" content={`${resolvedHandle} - cred.blue Score`} />
        <meta name="twitter:description" content={`Check ${resolvedHandle}'s Bluesky credibility score and data footprint on cred.blue`} />
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
                    <p><strong>AT Proto Score:</strong> {accountData.atprotoScore}</p>
                  </div>
                  <div className="user-profile-activity">
                    <p><strong>Bluesky Status:</strong> {accountData.activityAll.bskyActivityStatus}</p>
                    <p><strong>AT Proto Status:</strong> {accountData.activityAll.atprotoActivityStatus}</p>
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
              </div>
            </div>

            {/* Middle Section */}
            <div className="profile-section middle-section">
              <div className="user-profile-header-rechart">
                <ScoreGauge score={accountData.combinedScore} />
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
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={50}
          margin={[20, 20]}
          isDraggable={false}
          isResizable={false}
          useCSSTransforms={true}
          onLayoutChange={() => updateCardHeights()}
          draggableHandle=".card-header"
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