import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Responsive, WidthProvider } from "react-grid-layout";
import { loadAccountData } from "../../accountData"; // Ensure the path is correct
import Card from "../Card/Card";
import ProgressCircles from "../ProgressCircles"; // Import our updated progress visualization

// Import new card content components
import ActivityCard from "./components/ActivityCard";
import AltTextCard from "./components/AltTextCard";
import BadgesCard from "./components/BadgesCard";
import NarrativeCard from "./components/NarrativeCard";
import NeedleCard from "./components/NeedleCard";
import PostMediaCard from "./components/PostMediaCard";
import PostTypeCard from "./components/PostTypeCard";
import ProfileCard from "./components/ProfileCard";
import ScoreBreakdownCard from "./components/ScoreBreakdownCard";
import ScoresCard from "./components/ScoresCard";

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
        // Here you can order/position the cards as desired. The key "profilecard" corresponds to ProfileCard, etc.
        {
          i: "profilecard",
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
          i: "activitycard",
          x: 4,
          y: 0,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 6,
          minH: 3,
          maxH: 6,
        },
        {
          i: "alttextcard",
          x: 8,
          y: 0,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 4,
          minH: 3,
          maxH: 6,
        },
        {
          i: "badgescard",
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
          i: "narrativecard",
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
          i: "needlecard",
          x: 8,
          y: 4,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 4,
          minH: 3,
          maxH: 6,
        },
        {
          i: "postmediacard",
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
          i: "posttypecard",
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
          i: "scorebreakdowncard",
          x: 8,
          y: 8,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 4,
          minH: 3,
          maxH: 6,
        },
        {
          i: "scorescard",
          x: 0,
          y: 12,
          w: 4,
          h: 4,
          minW: 3,
          maxW: 4,
          minH: 3,
          maxH: 6,
        },
      ],
      md: [
        // You can define the md layout similarly if desired
        {
          i: "profilecard",
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
          i: "activitycard",
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
          i: "alttextcard",
          x: 0,
          y: 7,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "badgescard",
          x: 5,
          y: 7,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "narrativecard",
          x: 0,
          y: 14,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "needlecard",
          x: 5,
          y: 14,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "postmediacard",
          x: 0,
          y: 21,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "posttypecard",
          x: 5,
          y: 21,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 7,
          minH: 4,
          maxH: 8,
        },
        {
          i: "scorebreakdowncard",
          x: 0,
          y: 28,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 5,
          minH: 4,
          maxH: 8,
        },
        {
          i: "scorescard",
          x: 5,
          y: 28,
          w: 5,
          h: 7,
          minW: 4,
          maxW: 5,
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

  if (loading) {
    return (
      <div className="user-profile loading-container">
        <ProgressCircles loading={loading} />
        <p className="loading-text">
          Loading account data... {/* display seconds elapsed as needed */}
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

  // Destructure any fields you wish to pass as props from accountData
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
        <div key="profilecard" className="grid-item">
          <Card title="Profile">
            <ProfileCard
              resolvedHandle={resolvedHandle}
              did={did}
              createdAt={createdAt}
              ageInDays={ageInDays}
              serviceEndpoint={serviceEndpoint}
              pdsType={pdsType}
            />
          </Card>
        </div>

        <div key="activitycard" className="grid-item">
          <Card title="Activity">
            <ActivityCard profile={profile} />
          </Card>
        </div>

        <div key="alttextcard" className="grid-item">
          <Card title="Alt Text">
            <AltTextCard profile={profile} />
          </Card>
        </div>

        <div key="badgescard" className="grid-item">
          <Card title="Badges">
            <BadgesCard profile={profile} />
          </Card>
        </div>

        <div key="narrativecard" className="grid-item">
          <Card title="Narrative">
            <NarrativeCard profile={profile} />
          </Card>
        </div>

        <div key="needlecard" className="grid-item">
          <Card title="Needle">
            <NeedleCard profile={profile} />
          </Card>
        </div>

        <div key="postmediacard" className="grid-item">
          <Card title="Post Media">
            <PostMediaCard profile={profile} />
          </Card>
        </div>

        <div key="posttypecard" className="grid-item">
          <Card title="Post Type">
            <PostTypeCard profile={profile} />
          </Card>
        </div>

        <div key="scorebreakdowncard" className="grid-item">
          <Card title="Score Breakdown">
            <ScoreBreakdownCard profile={profile} />
          </Card>
        </div>

        <div key="scorescard" className="grid-item">
          <Card title="Scores">
            <ScoresCard profile={profile} />
          </Card>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default UserProfile;
