// src/components/UserProfile/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GridLayout from "react-grid-layout";
import { loadAccountData } from "../../accountData"; // Ensure the path is correct
import Card from "../Card/Card";
import "./UserProfile.css"; // Ensure this CSS file is styled appropriately

const UserProfile = () => {
  const { username } = useParams();
  const [accountData, setAccountData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Destructure the key sections from accountData
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

  // Define the layout for react-grid-layout
  const layout = [
    { i: "overview", x: 0, y: 0, w: 4, h: 4 },
    { i: "stats", x: 4, y: 0, w: 4, h: 4 },
    { i: "visualization1", x: 8, y: 0, w: 4, h: 4 },
    { i: "visualization2", x: 0, y: 4, w: 4, h: 4 },
    { i: "recentActivity", x: 4, y: 4, w: 4, h: 4 },
    { i: "connections", x: 8, y: 4, w: 4, h: 4 },
    { i: "settings", x: 0, y: 8, w: 4, h: 4 },
    { i: "extra", x: 4, y: 8, w: 4, h: 4 },
    // You can add one more card if you need a total of 9
    { i: "additional", x: 8, y: 8, w: 4, h: 4 },
  ];

  return (
    <div className="user-profile">
      <h1>{displayName}</h1>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1200}
        draggableHandle=".card-title"
      >
        <div key="overview" className="grid-item">
          <Card title="Profile Overview">
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
            {/* Insert stats details here */}
            <p>Stats details go here...</p>
          </Card>
        </div>

        <div key="visualization1" className="grid-item">
          <Card title="Visualization 1">
            {/* Insert data visualization component here */}
            <p>Chart or graph 1...</p>
          </Card>
        </div>

        <div key="visualization2" className="grid-item">
          <Card title="Visualization 2">
            {/* Insert another data visualization component */}
            <p>Chart or graph 2...</p>
          </Card>
        </div>

        <div key="recentActivity" className="grid-item">
          <Card title="Recent Activity">
            {/* Insert recent activity details here */}
            <p>Recent user activities...</p>
          </Card>
        </div>

        <div key="connections" className="grid-item">
          <Card title="Connections">
            {/* Insert connections/followers information */}
            <p>Follower or connection info...</p>
          </Card>
        </div>

        <div key="settings" className="grid-item">
          <Card title="Settings">
            {/* User settings or additional info */}
            <p>Settings details...</p>
          </Card>
        </div>

        <div key="extra" className="grid-item">
          <Card title="Extra">
            {/* Any extra data */}
            <p>Extra details...</p>
          </Card>
        </div>

        <div key="additional" className="grid-item">
          <Card title="Additional Info">
            {/* Additional optional card data */}
            <p>Additional information...</p>
          </Card>
        </div>
      </GridLayout>
    </div>
  );
};

export default UserProfile;
