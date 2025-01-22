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
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
  const minW = 2
  const maxW = 6
  const minH = 2
  const maxH = 6

  // Set the default layout (ignoring any previously saved layout)
  useEffect(() => {
    setLayouts({
      lg: [
        { i: "AccountData", x: 0, y: 0, w: 3, h: 6, minW, maxW, minH, maxH },
        { i: "NarrativeCard", x: 3, y: 0, w: 3, h: 6, minW, maxW, minH, maxH },
        { i: "PostTypeCard", x: 6, y: 0, w: 4, h: 6, minW, maxW, minH, maxH },
        { i: "visualization2", x: 5, y: 5, w: 4, h: 4, minW, maxW, minH, maxH },
        { i: "recentActivity", x: 8, y: 4, w: 4, h: 4, minW, maxW, minH, maxH },
        { i: "connections", x: 0, y: 8, w: 4, h: 4, minW, maxW, minH, maxH },
        { i: "settings", x: 4, y: 8, w: 4, h: 4, minW, maxW, minH, maxH },
        { i: "extra", x: 8, y: 8, w: 4, h: 4, minW, maxW, minH, maxH },
        { i: "additional", x: 0, y: 12, w: 4, h: 4, minW, maxW, minH, maxH },
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
            <Card title="Account Data">
              <ProfileCard />
            </Card>
          </div>
          <div key="NarrativeCard" className="grid-item">
            <Card title="NarrativeCard">
              <NarrativeCard />
            </Card>
          </div>
          <div key="PostTypeCard" className="grid-item">
            <Card title="Post Types">
              <PostTypeCard />
            </Card>
          </div>
          <div key="visualization2" className="grid-item">
            <Card title="Visualization 2">
              <p>Chart or graph 2...</p>
            </Card>
          </div>
          <div key="recentActivity" className="grid-item">
            <Card title="Recent Activity">
              <p>Recent user activities...</p>
            </Card>
          </div>
          <div key="connections" className="grid-item">
            <Card title="Connections">
              <p>Follower or connection info...</p>
            </Card>
          </div>
          <div key="settings" className="grid-item">
            <Card title="Settings">
              <p>Settings details...</p>
            </Card>
          </div>
          <div key="extra" className="grid-item">
            <Card title="Extra">
              <p>Extra details...</p>
            </Card>
          </div>
          <div key="additional" className="grid-item">
            <Card title="Additional Info">
              <p>Additional information...</p>
            </Card>
          </div>
        </ResponsiveGridLayout>
      </div>
    </AccountDataContext.Provider>
  );
};

export default UserProfile;
