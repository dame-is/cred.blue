// src/components/UserProfile/UserProfile.jsx
import React, { useEffect, useState, createContext } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData";
import Card from "../Card/Card";
import MatterLoadingAnimation from "../MatterLoadingAnimation";
import ScoreGauge from './ScoreGauge';

import ProfileCard from "./components/ProfileCard";
import NarrativeCard from "./components/NarrativeCard";
import PostTypeCard from "./components/PostTypeCard";
import AltTextCard from "./components/AltTextCard";
import RawDataCard from "./components/RawDataCard";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./UserProfile.css";

export const AccountDataContext = createContext(null);

const ResponsiveGridLayout = WidthProvider(Responsive);

const UserProfile = () => {
  const { username } = useParams();
  const [accountData30Days, setAccountData30Days] = useState(null);
  const [accountData90Days, setAccountData90Days] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [circleCount, setCircleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContent, setShowContent] = useState(false);

  // Simplified breakpoints - just desktop and mobile
  const breakpoints = { lg: 992, xs: 0 };
  const cols = { lg: 2, xs: 1 }; // 2 columns for desktop, 1 for mobile

  // Define static layouts for desktop and mobile
  const layouts = {
    lg: [
      { i: "ProfileCard", x: 0, y: 0, w: 1, h: 6, static: true },
      { i: "NarrativeCard", x: 1, y: 0, w: 1, h: 6, static: true },
      { i: "PostTypeCard", x: 0, y: 6, w: 1, h: 6, static: true },
      { i: "AltTextCard", x: 1, y: 6, w: 1, h: 6, static: true },
      { i: "RawDataCard", x: 0, y: 12, w: 2, h: 8, static: true },
    ],
    xs: [
      { i: "ProfileCard", x: 0, y: 0, w: 1, h: 6, static: true },
      { i: "NarrativeCard", x: 0, y: 6, w: 1, h: 6, static: true },
      { i: "PostTypeCard", x: 0, y: 12, w: 1, h: 6, static: true },
      { i: "AltTextCard", x: 0, y: 18, w: 1, h: 6, static: true },
      { i: "RawDataCard", x: 0, y: 24, w: 1, h: 8, static: true },
    ]
  };

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
        setTimeout(() => setShowContent(true), 500);
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
            <h1>{displayName}</h1>
            <h2>@{resolvedHandle}</h2>
            <p><strong>Combined Score: {selectedAccountData.combinedScore}</strong></p>
            <p><strong>Overall Status: {selectedAccountData.activityAll.activityStatus}</strong></p>
            <p>Bluesky Score: {selectedAccountData.blueskyScore}</p>
            <p>Bluesky Status: {selectedAccountData.activityAll.bskyActivityStatus}</p>
            <p>Atproto Score: {selectedAccountData.atprotoScore}</p>
            <p>Atproto Status: {selectedAccountData.activityAll.atprotoActivityStatus}</p>
          </div>

          <div className="user-profile-header-rechart">
            <ScoreGauge score={selectedAccountData.combinedScore} />
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
        >
          <div key="ProfileCard" className="grid-item">
            <Card title="Profile">
              <ProfileCard />
            </Card>
          </div>
          <div key="NarrativeCard" className="grid-item">
            <Card title="Summary">
              <NarrativeCard />
            </Card>
          </div>
          <div key="PostTypeCard" className="grid-item">
            <Card title="Post Type Breakdown">
              <PostTypeCard />
            </Card>
          </div>
          <div key="AltTextCard" className="grid-item">
            <Card title="Alt Text Rating">
              <AltTextCard />
            </Card>
          </div>
          <div key="RawDataCard" className="grid-item">
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