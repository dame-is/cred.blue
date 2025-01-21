// src/components/UserProfile/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData"; // Ensure the path is correct
import Card from "../Card/Card";
import ProgressCircles from "../ProgressCircles"; // Import our updated progress visualization
import ProfileCard from "./components/ProfileCard"; // Import the new component
import "./UserProfile.css";
import "react-grid-layout/css/styles.css"; // Import default grid-layout styles
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const UserProfile = () => {
  const { username } = useParams();
  const [accountData, setAccountData] = useState(null);
  const [circleCount, setCircleCount] = useState(0); // count of completed API pages
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layouts, setLayouts] = useState({});

  // Define breakpoints and columns for the grid
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  // Set the default layout (ignoring any previously saved layout)
  useEffect(() => {
    setLayouts({
      lg: [
        {
          i: "overview",
          x: 0,
          y: 0,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "stats",
          x: 6,
          y: 0,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "visualization1",
          x: 0,
          y: 4,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "visualization2",
          x: 4,
          y: 4,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "recentActivity",
          x: 8,
          y: 4,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "connections",
          x: 0,
          y: 8,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "settings",
          x: 4,
          y: 8,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "extra",
          x: 8,
          y: 8,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "additional",
          x: 0,
          y: 12,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
      ],
      md: [
        {
          i: "overview",
          x: 0,
          y: 0,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "stats",
          x: 5,
          y: 0,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "visualization1",
          x: 0,
          y: 4,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "visualization2",
          x: 5,
          y: 4,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "recentActivity",
          x: 0,
          y: 8,
          w: 10,
          h: 7,
          minW: 8,
          maxW: 10,
          minH: 4,
          maxH: 8,
        },
        {
          i: "connections",
          x: 0,
          y: 12,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "settings",
          x: 5,
          y: 12,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "extra",
          x: 0,
          y: 16,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "additional",
          x: 5,
          y: 16,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
      ],
      // Define layouts for sm, xs, xxs if needed
    });
  }, [username]);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    // Update state only; no local storage saving
    setLayouts(allLayouts);
  };

  // Fetch account data using our loadAccountData function.
  // Each time an API page completes, our callback increments the circle count by 1.
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
      }
    };

    fetchAccountData();
  }, [username]);

  // While loading, show our progress visualization which updates as each API call completes.
  if (loading) {
    return (
      <div className="user-profile loading-container">
        <ProgressCircles loading={loading} />
        <p className="loading-text">
          Loading account data... { /* display seconds elapsed as needed */ }
        </p>
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
        margin={[20, 20]}
        onLayoutChange={handleLayoutChange}
      >
        <ProfileCard
          key="overview" // Notice: The key can either be here or on the wrapping element.
          resolvedHandle={resolvedHandle}
          did={did}
          createdAt={createdAt}
          ageInDays={ageInDays}
          serviceEndpoint={serviceEndpoint}
          pdsType={pdsType}
        />
        <div key="stats" className="grid-item">
          <Card title="Stats">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Stats details go here...</p>
          </Card>
        </div>

        <div key="visualization1" className="grid-item">
          <Card title="Visualization 1">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Chart or graph 1...</p>
          </Card>
        </div>

        <div key="visualization2" className="grid-item">
          <Card title="Visualization 2">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Chart or graph 2...</p>
          </Card>
        </div>

        <div key="recentActivity" className="grid-item">
          <Card title="Recent Activity">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Recent user activities...</p>
          </Card>
        </div>

        <div key="connections" className="grid-item">
          <Card title="Connections">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Follower or connection info...</p>
          </Card>
        </div>

        <div key="settings" className="grid-item">
          <Card title="Settings">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Settings details...</p>
          </Card>
        </div>

        <div key="extra" className="grid-item">
          <Card title="Extra">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Extra details...</p>
          </Card>
        </div>

        <div key="additional" className="grid-item">
          <Card title="Additional Info">
            <div className="drag-handle">
              <span className="drag-icon">≡</span>
            </div>
            <p>Additional information...</p>
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default UserProfile;
