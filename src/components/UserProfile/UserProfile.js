// src/components/UserProfile/UserProfile.jsx
import React, { useEffect, useState, createContext } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData";
import Card from "../Card/Card";
import MatterLoadingAnimation from "../MatterLoadingAnimation";

import ProfileCard from "./components/ProfileCard";
import NarrativeCard from "./components/NarrativeCard";
import PostTypeCard from "./components/PostTypeCard";
import AltTextCard from "./components/AltTextCard";
import RawDataCard from "./components/RawDataCard";

import "react-grid-layout/css/styles.css"; // Import default grid-layout styles
import "react-resizable/css/styles.css";
import "./UserProfile.css";

// Create a new context for accountData
export const AccountDataContext = createContext(null);

const ResponsiveGridLayout = WidthProvider(Responsive);

const UserProfile = () => {
  const { username } = useParams();
  const [accountData, setAccountData] = useState(null);
  const [circleCount, setCircleCount] = useState(0); // count of completed API pages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layouts, setLayouts] = useState({});
  const [showContent, setShowContent] = useState(false); // Control fade-in for content

  // Define breakpoints and columns for the grid
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 6, md: 10, sm: 6, xs: 4, xxs: 2 };
  const minW = 2
  const maxW = 6
  const minH = 2
  const maxH = 8

  // Set the default layout (ignoring any previously saved layout)
  useEffect(() => {
    setLayouts({
      lg: [
        { i: "AccountData", x: 0, y: 0, w: 3, h: 6, minW, maxW, minH, maxH },
        { i: "NarrativeCard", x: 3, y: 0, w: 3, h: 6, minW, maxW, minH, maxH },
        { i: "PostTypeCard", x: 3, y: 7, w: 4, h: 6, minW, maxW, minH, maxH },
        { i: "RawDataCard", x: 0, y: 10, w: 4, h: 8, minW, maxW, minH, maxH },
        { i: "AltTextCard", x: 0, y: 7, w: 2, h: 6, minW, maxW, minH, maxH },
      ],
      // Define layouts for sm, xs, xxs if needed
    });
  }, [username]);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Update state only; no local storage saving
    setLayouts(allLayouts);
  };

  // Fetch account data using loadAccountData.
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const data = await loadAccountData(username, (increment) => {
          setCircleCount((prev) => prev + increment);
        });
        if (data.error) {
          throw new Error(data.error);
        }
        setAccountData(data.accountData);
      } catch (err) {
        console.error("Error fetching account data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => setShowContent(true), 500); // Delay content fade-in slightly
      }
    };

    fetchAccountData();
  }, [username]);

  // While loading, show our Matter.js visualization.
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

  if (!accountData) {
    return <div className="user-profile">No profile information available.</div>;
  }

  // Destructure accountData for the header.
  const { displayName, handle: resolvedHandle } = accountData;

  return (
    <AccountDataContext.Provider value={accountData}>
      <div className={`user-profile ${showContent ? "fade-in" : "hidden"}`}>
        <div className="user-profile-header">
          <h1>{displayName}</h1>
          <h2>@{resolvedHandle}</h2>
          <p><strong>Combined Score: {accountData.combinedScore}</strong></p>
          <p>Bluesky Score: {accountData.blueskyScore}</p>
          <p>Atproto Score: {accountData.atprotoScore}</p>
        </div>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={50}
          draggableHandle=".drag-handle"
          margin={[20, 20]}
          onLayoutChange={handleLayoutChange}
        >
          <div key="AccountData" className="grid-item">
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
