import React, { useEffect, useState, createContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData";
import Card from "../Card/Card";
import MatterLoadingAnimation from "../MatterLoadingAnimation";
import ScoreGauge from './ScoreGauge';
import CircularLogo from './CircularLogo';

import ProfileCard from "./components/ProfileCard";
import NarrativeCard from "./components/NarrativeCard";
import PostTypeCard from "./components/PostTypeCard";
import AltTextCard from "./components/AltTextCard";
import RawDataCard from "./components/RawDataCard";
import ActivityCard from "./components/ActivityCard";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./UserProfile.css";

export const AccountDataContext = createContext(null);

const ResponsiveGridLayout = WidthProvider(Responsive);

const UserProfile = () => {
  const { username } = useParams();
  const [accountData30Days, setAccountData30Days] = useState(null);
  const [accountData90Days, setAccountData90Days] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('90');
  const [circleCount, setCircleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [cardHeights, setCardHeights] = useState({});
  const cardRefs = useRef({});

  // Simplified breakpoints - just desktop and mobile
  const breakpoints = { lg: 850, xs: 0 };
  const cols = { lg: 2, xs: 1 }; // 2 columns for desktop, 1 for mobile

  // Base layouts without fixed heights
  const getLayouts = () => ({
    lg: [
      { i: "ProfileCard", x: 0, y: 0, w: 1, h: cardHeights.ProfileCard || 6, static: true },
      { i: "NarrativeCard", x: 1, y: 0, w: 1, h: cardHeights.NarrativeCard || 6, static: true },
      { i: "PostTypeCard", x: 0, y: 6, w: 1, h: cardHeights.PostTypeCard || 6, static: true },
      { i: "AltTextCard", x: 1, y: 6, w: 1, h: cardHeights.AltTextCard || 6, static: true },
      { i: "ActivityCard", x: 0, y: 12, w: 1, h: cardHeights.ActivityCard || 8, static: true },
      { i: "RawDataCard", x: 1, y: 12, w: 1, h: cardHeights.RawDataCard || 8, static: true },
    ],
    xs: [
      { i: "ProfileCard", x: 0, y: 0, w: 1, h: cardHeights.ProfileCard || 6, static: true },
      { i: "NarrativeCard", x: 0, y: 6, w: 1, h: cardHeights.NarrativeCard || 6, static: true },
      { i: "PostTypeCard", x: 0, y: 12, w: 1, h: cardHeights.PostTypeCard || 6, static: true },
      { i: "AltTextCard", x: 0, y: 18, w: 1, h: cardHeights.AltTextCard || 6, static: true },
      { i: "ActivityCard", x: 0, y: 24, w: 1, h: cardHeights.ActivityCard || 8, static: true },
      { i: "RawDataCard", x: 0, y: 32, w: 1, h: cardHeights.RawDataCard || 8, static: true },
    ]
  });

  // Function to update card heights
  const updateCardHeights = () => {
    const rowHeight = 50; // Your grid's row height
    const newHeights = {};
    
    Object.keys(cardRefs.current).forEach(key => {
      const element = cardRefs.current[key];
      if (element) {
        const contentHeight = element.scrollHeight;
        const gridHeight = Math.ceil(contentHeight / rowHeight);
        newHeights[key] = Math.max(gridHeight, 6); // Minimum height of 6 grid units
      }
    });
    
    setCardHeights(newHeights);
  };

  // Effect to handle initial load and updates
  useEffect(() => {
    const handleResize = () => {
      updateCardHeights();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update heights when content changes
  useEffect(() => {
    if (accountData30Days || accountData90Days) {
      setTimeout(updateCardHeights, 100); // Allow time for content to render
    }
  }, [accountData30Days, accountData90Days, selectedPeriod]);

  // Data fetching effect
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const data = await loadAccountData(username, (increment) => {
          setCircleCount((prev) => prev + increment);
        });
        if (data.error) {
          throw new Error(data.error);
        }
        setAccountData30Days(data.accountData30Days);
        setAccountData90Days(data.accountData90Days);
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
  }, [username]);

  if (loading) {
    return (
      <div className={`user-profile loading-container ${!loading && "fade-out"}`}>
        <MatterLoadingAnimation />
      </div>
    );
  }

  if (error) {
    return <div className="user-profile error">Error: {error}</div>;
  }

  if (!accountData30Days || !accountData90Days) {
    return <div className="user-profile">No profile information available.</div>;
  }

  const selectedAccountData = selectedPeriod === '90' ? accountData90Days : accountData30Days;
  const { displayName, handle: resolvedHandle } = selectedAccountData;

  return (
    <AccountDataContext.Provider value={selectedAccountData}>
      <div className={`user-profile ${showContent ? "fade-in" : "hidden"}`}>
        <div className="user-profile-header">
          <div className="user-profile-header-main">
            <CircularLogo 
              did={selectedAccountData.did}
              size={205}
              textColor="#004f84"
            />
            <div className="user-profile-name">
              <h1>{displayName}</h1>
              <h2>@{resolvedHandle}</h2>
            </div>
            <div className="user-profile-age">
              <h2>{Math.floor(selectedAccountData.ageInDays)} days old</h2>
            </div>
            <div className="user-profile-badges">
              <h3>{selectedAccountData.socialStatus}</h3>
              <h3>{selectedAccountData.postingStyle}</h3>
            </div>
          </div>

          <div className="user-profile-header-rechart">
            <ScoreGauge score={selectedAccountData.combinedScore} />
          </div>

          <div className="user-profile-data">
              <div className="user-profile-score">
                <p><strong>Combined Score: {selectedAccountData.combinedScore}</strong></p>
                <p>Bluesky Score: {selectedAccountData.blueskyScore}</p>
                <p>Atproto Score: {selectedAccountData.atprotoScore}</p>
              </div>
              <div className="user-profile-activity">
                <p><strong>Overall Status: {selectedAccountData.activityAll.activityStatus}</strong></p>
                <p>Bluesky Status: {selectedAccountData.activityAll.bskyActivityStatus}</p>
                <p>Atproto Status: {selectedAccountData.activityAll.atprotoActivityStatus}</p>
              </div>
            </div>

          <div className="toggle-switch">
            <button
              className={`toggle-button ${selectedPeriod === '30' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('30')}
            >
              Last 30 Days
            </button>
            <button
              className={`toggle-button ${selectedPeriod === '90' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('90')}
            >
              Last 90 Days
            </button>
          </div>
          <div className="share-button-container">
          <button
              className="share-button-profile"
              type="button"
              onClick={() => window.open(
                `https://bsky.app/intent/compose?text=${encodeURIComponent(
                  `My @cred.blue score is ${selectedAccountData.combinedScore}/1000, and my account is ${Math.floor(selectedAccountData.ageInDays)} days old\n\nOverall I'm ${selectedAccountData.activityAll.activityStatus} on the network\n\nMy social status is classified as a "${selectedAccountData.socialStatus}" with a posting style of "${selectedAccountData.postingStyle}"\n\nDiscover your score here: cred.blue`
                )}`, '_blank'
              )}
            >
              Share Results
            </button>
          </div>
        </div>

        <ResponsiveGridLayout
          className="layout"
          layouts={getLayouts()}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={50}
          margin={[20, 20]}
          isDraggable={false}
          isResizable={false}
          useCSSTransforms={true}
          onLayoutChange={() => updateCardHeights()}
        >
          <div key="ProfileCard" className="grid-item" ref={el => cardRefs.current.ProfileCard = el}>
            <Card title="Profile">
              <ProfileCard />
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
          <div key="RawDataCard" className="grid-item" ref={el => cardRefs.current.RawDataCard = el}>
            <Card title="Raw Data">
              <RawDataCard />
            </Card>
          </div>
        </ResponsiveGridLayout>
      </div>
    </AccountDataContext.Provider>
  );
};

export default UserProfile;