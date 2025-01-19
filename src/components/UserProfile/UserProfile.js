// src/components/UserProfile/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData"; // Ensure the path is correct
import Card from "../Card/Card";
import ProgressCircles from "../ProgressCircles"; // Import our new progress visualization
import "./UserProfile.css";
import "react-grid-layout/css/styles.css"; // Import default grid-layout styles
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const UserProfile = () => {
  const { username } = useParams();
  const [accountData, setAccountData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layouts, setLayouts] = useState({});

  // Define breakpoints and columns for the grid
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  // Load saved layouts from localStorage (or set default layout)
  useEffect(() => {
    const savedLayouts = localStorage.getItem(`layout_${username}`);
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    } else {
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
        // Define layouts for sm, xs, xxs if needed
      });
    }
  }, [username]);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(`layout_${username}`, JSON.stringify(allLayouts));
  };

  // Fetch account data using our loadAccountData function
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

  // Render loading state with the progress visualization.
  if (loading) {
    return (
      <div className="user-profile loading-container">
        <ProgressCircles progress={progress} totalPages={45} />
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

  // Destructure some fields from accountData for display
  const {
    profile,
    displayName,
    handle: resolvedHandle,
    did,
    createdAt,
    ageInDays,
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
        rowHeight={50}
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
              (<em>{Math.floor(ageInDays)} days old</em>)
            </p>
            <p><strong>Service Endpoint:</strong> {serviceEndpoint}</p>
            <p><strong>PDS Type:</strong> {pdsType}</p>
          </Card>
        </div>

        <div key="stats" className="grid-item">
          <Card title="Stats">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Stats details go here */}
            <p>Stats details go here...</p>
          </Card>
        </div>

        <div key="visualization1" className="grid-item">
          <Card title="Visualization 1">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert first visualization component */}
            <p>Chart or graph 1...</p>
          </Card>
        </div>

        <div key="visualization2" className="grid-item">
          <Card title="Visualization 2">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert second visualization component */}
            <p>Chart or graph 2...</p>
          </Card>
        </div>

        <div key="recentActivity" className="grid-item">
          <Card title="Recent Activity">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert recent activity details */}
            <p>Recent user activities...</p>
          </Card>
        </div>

        <div key="connections" className="grid-item">
          <Card title="Connections">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert connections/followers info */}
            <p>Follower or connection info...</p>
          </Card>
        </div>

        <div key="settings" className="grid-item">
          <Card title="Settings">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert settings details */}
            <p>Settings details...</p>
          </Card>
        </div>

        <div key="extra" className="grid-item">
          <Card title="Extra">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert extra data */}
            <p>Extra details...</p>
          </Card>
        </div>

        <div key="additional" className="grid-item">
          <Card title="Additional Info">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            {/* Insert additional optional data */}
            <p>Additional information...</p>
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default UserProfile;
