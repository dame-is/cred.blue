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
import ActivityCard from "./components/ActivityCard";
import ScoreBreakdownCard from "./components/ScoreBreakdownCard";

import useDocumentMeta from '../../hooks/useDocumentMeta';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [cardHeights, setCardHeights] = useState({});
  const cardRefs = useRef({});

  const breakpoints = { lg: 850, md: 640, sm: 450, xs: 390, xxs: 0 };
  const cols = { lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 };

  const CARD_HEIGHT = 6;

  useDocumentMeta({
    title: `${username}'s cred.blue analysis`,
    description: `View ${username}'s credibility score and Bluesky activity analysis on cred.blue`,
  });
  
  const getLayouts = () => ({
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
      { i: "NarrativeCard", x: 0, y: 0, w: 1, h: 5, static: false },
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
      { i: "ActivityCard", x: 1, y: 30, w: 1, h: 7, static: false }
    ],
    xxs: [
      { i: "ScoreBreakdownCard", x: 0, y: 8, w: 1, h: 6, static: false },
      { i: "NarrativeCard", x: 1, y: 0, w: 1, h: 7, static: false },
      { i: "ProfileCard", x: 0, y: 14, w: 1, h: 7, static: false },
      { i: "PostTypeCard", x: 1, y: 22, w: 1, h: 6, static: false },
      { i: "AltTextCard", x: 0, y: 26, w: 1, h: 5, static: false },
      { i: "ActivityCard", x: 1, y: 30, w: 1, h: 6, static: false }
    ]
  });

  const updateCardHeights = () => {
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

  useEffect(() => {
    const handleResize = () => {
      updateCardHeights();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (accountData30Days || accountData90Days) {
      setTimeout(updateCardHeights, 100);
    }
  }, [accountData30Days, accountData90Days, selectedPeriod]);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const data = await loadAccountData(username);
        if (data.error) {
          throw new Error(data.error);
        }

        // Transform function to process account data
        const processAccountData = (data) => {
          if (!data) return null;

          // Create the new categorical breakdown structure
          const breakdown = {
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
          };

          // Return combined data structure
          return {
            ...data,
            breakdown
          };
        };

        setAccountData30Days(processAccountData(data.accountData30Days));
        setAccountData90Days(processAccountData(data.accountData90Days));
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
        <div className="user-profile-container">
          <div className="user-profile-header">
              <CircularLogo 
                did={selectedAccountData.did}
                size={205}
                textColor="#004f84"
              />
              <div className="user-profile-main">
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
              <div className="user-profile-emoji-group">
                <p className="emoji-1">🐛</p>
                <p className="emoji-2">🦋</p>
                <p className="emoji-3">🪼</p>
                <p className="emoji-4">🔥</p>
              </div>
              <div className="user-profile-data-group">
                <div className="user-profile-score">
                  <p><strong>Bluesky Score:</strong> {selectedAccountData.blueskyScore}</p>
                  <p><strong>Atproto Score:</strong> {selectedAccountData.atprotoScore}</p>
                </div>
                <div className="user-profile-activity">
                  <p><strong>Bluesky Status:</strong> {selectedAccountData.activityAll.bskyActivityStatus}</p>
                  <p><strong>Atproto Status:</strong> {selectedAccountData.activityAll.atprotoActivityStatus}</p>
                </div>
              </div>
              <div className="share-button-container">
              <button
                className="share-button-profile"
                type="button"
                onClick={() => window.open(
                  `https://bsky.app/intent/compose?text=${encodeURIComponent(
                    `My @cred.blue score is ${selectedAccountData.combinedScore}/1000! 🦋\n\nI've been on Bluesky for ${Math.floor(selectedAccountData.ageInDays)} days, and I'm ${selectedAccountData.activityAll.activityStatus} on the network.\n\n👤 Social Status: "${selectedAccountData.socialStatus}"\n✍️ Posting Style: "${selectedAccountData.postingStyle}".\n\nCheck your score: cred.blue 🍥`
                  )}`, '_blank'
                )}
              >
                Share Results
              </button>
              <button
                className="comparea-button-profile"
                type="button"
                onClick={() => window.open(
                  `https://cred.blue/compare`, '_blank'
                )}
              >
                Compare Scores
              </button>
              </div>

            {/* <div className="toggle-switch">
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
            </div> */}
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
          draggableHandle=".card-header" // Add this line to enable drag by header only
        >
          {/* Update your grid items to include a drag handle class in the Card component */}
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
            <Card title="Profile">
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

export default UserProfile;