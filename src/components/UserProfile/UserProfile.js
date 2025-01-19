// src/components/UserProfile/UserProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData"; // Ensure the path is correct
import Card from "../Card/Card";
import "./UserProfile.css";
import "react-grid-layout/css/styles.css"; // Import default styles
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const UserProfile = () => {
  const { username } = useParams();
  const [accountData, setAccountData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize layout state
  const [layouts, setLayouts] = useState({});

  // Define breakpoints and columns
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const data = await loadAccountData(username, (prog) => {
          setProgress(prog);
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
      }
    };

    fetchAccountData();
  }, [username]);

  // Load saved layouts from localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem(`layout_${username}`);
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    } else {
      // Define default layouts if none are saved
      setLayouts({
        lg: [
          { i: "overview", x: 0, y: 0, w: 6, h: 4 },
          { i: "stats", x: 6, y: 0, w: 6, h: 4 },
          { i: "visualization1", x: 0, y: 4, w: 4, h: 4 },
          { i: "visualization2", x: 4, y: 4, w: 4, h: 4 },
          { i: "recentActivity", x: 8, y: 4, w: 4, h: 4 },
          { i: "connections", x: 0, y: 8, w: 4, h: 4 },
          { i: "settings", x: 4, y: 8, w: 4, h: 4 },
          { i: "extra", x: 8, y: 8, w: 4, h: 4 },
          { i: "additional", x: 0, y: 12, w: 4, h: 4 },
        ],
        md: [
          { i: "overview", x: 0, y: 0, w: 5, h: 4 },
          { i: "stats", x: 5, y: 0, w: 5, h: 4 },
          { i: "visualization1", x: 0, y: 4, w: 5, h: 4 },
          { i: "visualization2", x: 5, y: 4, w: 5, h: 4 },
          { i: "recentActivity", x: 0, y: 8, w: 10, h: 4 },
          { i: "connections", x: 0, y: 12, w: 5, h: 4 },
          { i: "settings", x: 5, y: 12, w: 5, h: 4 },
          { i: "extra", x: 0, y: 16, w: 5, h: 4 },
          { i: "additional", x: 5, y: 16, w: 5, h: 4 },
        ],
        // Define layouts for sm, xs, xxs as needed
      });
    }
  }, [username]);

  // Handle layout changes
  const handleLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(`layout_${username}`, JSON.stringify(allLayouts));
  };

  if (loading) {
    return (
      <div className="user-profile loading-container">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="loading-text">Loading account data... {Math.floor(progress)}%</p>
      </div>
    );
  }

  if (error) {
    return <div className="user-profile error">Error: {error}</div>;
  }

  if (!accountData) {
    return <div className="user-profile">No profile information available.</div>;
  }

  // Destructure accountData
  const {
    profile,
    displayName,
    handle: resolvedHandle,
    did,
    createdAt,
    ageInDays,
    agePercentage,
    serviceEndpoint,
    pdsType,
  } = accountData;

  return (
    <div className="user-profile">
      <h1>{displayName}</h1>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={30}
        draggableHandle=".drag-handle"
        margin={[20, 40]}
        onLayoutChange={handleLayoutChange}
      >
        <div key="overview" className="grid-item">
          <Card title="Profile Overview">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p><strong>Username:</strong> {resolvedHandle}</p>
            <p><strong>DID:</strong> {did}</p>
            <p>
              <strong>Account Created:</strong>{" "}
              {new Date(createdAt).toLocaleDateString()}{" "}
              (<em>{Math.floor(ageInDays)} days old | {Math.floor(agePercentage * 100)}%</em>)
            </p>
            <p><strong>Profile Completion:</strong> {profile.profileCompletion}</p>
            <p><strong>Service Endpoint:</strong> {serviceEndpoint}</p>
            <p><strong>PDS Type:</strong> {pdsType}</p>
          </Card>
        </div>

        <div key="stats" className="grid-item">
          <Card title="Stats">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert stats details here */}
            <p>Stats details go here...</p>
          </Card>
        </div>

        <div key="visualization1" className="grid-item">
          <Card title="Visualization 1">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert data visualization component here */}
            <p>Chart or graph 1...</p>
          </Card>
        </div>

        <div key="visualization2" className="grid-item">
          <Card title="Visualization 2">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert another data visualization component */}
            <p>Chart or graph 2...</p>
          </Card>
        </div>

        <div key="recentActivity" className="grid-item">
          <Card title="Recent Activity">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert recent activity details here */}
            <p>Recent user activities...</p>
          </Card>
        </div>

        <div key="connections" className="grid-item">
          <Card title="Connections">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert connections/followers information */}
            <p>Follower or connection info...</p>
          </Card>
        </div>

        <div key="settings" className="grid-item">
          <Card title="Settings">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* User settings or additional info */}
            <p>Settings details...</p>
          </Card>
        </div>

        <div key="extra" className="grid-item">
          <Card title="Extra">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Any extra data */}
            <p>Extra details...</p>
          </Card>
        </div>

        <div key="additional" className="grid-item">
          <Card title="Additional Info">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Additional optional card data */}
            <p>Additional information...</p>
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default UserProfile;
