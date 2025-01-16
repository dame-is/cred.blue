// src/components/UserProfile/UserProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { loadAccountData } from "../../accountData"; // Ensure the path is correct
import "./UserProfile.css"; // Ensure this CSS file is styled appropriately

const UserProfile = () => {
  const { username } = useParams(); // Extract the handle from the URL (e.g., "dame.bsky.social")
  const [accountData, setAccountData] = useState(null);
  const [progress, setProgress] = useState(0); // Track progress percentage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        // Pass both the input handle and the onProgress callback.
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

  // Destructure the key sections from the accountData object.
  const {
    profile,
    displayName,
    handle: resolvedHandle,
    did,
    createdAt,
    ageInDays,
    agePercentage,
    blobsCount,
    followersCount,
    followsCount,
    postsCount,
    rotationKeys,
    era,
    postingStyle,
    socialStatus,
    activityAll,
    activityLast30Days,
    alsoKnownAs,
    analysis,
    scoreGeneratedAt,
    serviceEndpoint,
    pdsType,
  } = accountData;

  return (
    <div className="user-profile">
      <h1>{displayName}</h1>

      {/* Profile Overview */}
      <section className="profile-overview">
        <h2>Profile Overview</h2>
        <p><strong>Username:</strong> {resolvedHandle}</p>
        <p><strong>DID:</strong> {did}</p>
        <p>
          <strong>Account Created:</strong> {new Date(createdAt).toLocaleDateString()} {" "}
          (<em>{Math.floor(ageInDays)} days old | {Math.floor(agePercentage * 100)}%</em>)
        </p>
        <p><strong>Profile Completion:</strong> {profile.profileCompletion}</p>
        <p><strong>Service Endpoint:</strong> {serviceEndpoint}</p>
        <p><strong>PDS Type:</strong> {pdsType}</p>
      </section>

      {/* Blobs & Posts Data */}
      <section className="blobs-posts">
        <h2>Blobs & Posts Data</h2>
        <p><strong>Blobs Count:</strong> {blobsCount}</p>
        <p>
          <strong>Blobs Per Day:</strong>{" "}
          {ageInDays ? (blobsCount / ageInDays).toFixed(2) : "0"}
        </p>
        <p>
          <strong>Blobs Per Post:</strong>{" "}
          {postsCount ? (blobsCount / postsCount).toFixed(2) : "0"}
        </p>
        <p><strong>Posts Count:</strong> {postsCount}</p>
      </section>

      {/* Overall Activity Overview */}
      <section className="activity-overview">
        <h2>Overall Activity</h2>
        <p><strong>Total Records:</strong> {activityAll.totalRecords}</p>
        <p><strong>Records Per Day:</strong> {activityAll.totalRecordsPerDay}</p>
        <p>
          <strong>Total Bluesky Records:</strong> {activityAll.totalBskyRecords} (
          {Math.floor(activityAll.totalBskyRecordsPercentage * 100)}%)
        </p>
        <p><strong>Rotation Keys:</strong> {rotationKeys}</p>
        <p>
          <strong>Followers:</strong> {followersCount} | <strong>Following:</strong> {followsCount} {" "}
          (<em>{followersCount ? (followsCount / followersCount).toFixed(2) : "0"}</em>)
        </p>
        <p><strong>Posting Style:</strong> {postingStyle}</p>
        <p><strong>Social Status:</strong> {socialStatus}</p>
        <p><strong>Era:</strong> {era}</p>
      </section>

      {/* Last 30 Days Activity */}
      <section className="activity-recent">
        <h2>Last 30 Days Activity</h2>
        <p><strong>Total Records:</strong> {activityLast30Days.totalRecords}</p>
        <p><strong>Records Per Day:</strong> {activityLast30Days.totalRecordsPerDay}</p>
        <p><strong>Total Bluesky Records:</strong> {activityLast30Days.totalBskyRecords}</p>
        <p><strong>Total Non-Bluesky Records:</strong> {activityLast30Days.totalNonBskyRecords}</p>
        {activityLast30Days.collections && (
          <div className="collection-stats">
            <h3>Per-Collection Stats (Last 30 Days):</h3>
            <p>{JSON.stringify(activityLast30Days.collections, null, 2)}</p>
          </div>
        )}
      </section>

      {/* Alias Information */}
      <section className="aliases">
        <h2>Alias Information</h2>
        <p><strong>Total AKAs:</strong> {alsoKnownAs.totalAkas}</p>
        <p><strong>Active AKAs:</strong> {alsoKnownAs.activeAkas}</p>
        <p><strong>Bsky AKAs:</strong> {alsoKnownAs.totalBskyAkas}</p>
        <p><strong>Custom AKAs:</strong> {alsoKnownAs.totalCustomAkas}</p>
        <p><strong>Domain Rarity:</strong> {alsoKnownAs.domainRarity}</p>
        <p><strong>Handle Type:</strong> {alsoKnownAs.handleType}</p>
      </section>

      {/* Analysis Narrative */}
      <section className="narrative">
        <h2>Analysis Narrative</h2>
        <p>{analysis.narrative}</p>
      </section>

      {/* Additional Data Dump */}
      <section className="data-dump">
        <h2>Full Account Data JSON</h2>
        <p>{JSON.stringify(accountData, null, 2)}</p>
      </section>

      {/* Generated At Footer */}
      <section className="generated-info">
        <p>
          <small>Score generated at: {new Date(scoreGeneratedAt).toLocaleString()}</small>
        </p>
      </section>
    </div>
  );
};

export default UserProfile;
