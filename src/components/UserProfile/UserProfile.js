// src/components/UserProfile/UserProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ScoreResult from "../ScoreResult"; // Import the ScoreResult component
import { loadAccountData } from "../../accountData"; // Adjust the path as needed
import "./UserProfile.css"; // Ensure this CSS file exists and is styled appropriately

const UserProfile = () => {
  const { username } = useParams(); // Extract the username from the URL
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Call the loadAccountData function from your accountData module.
        const data = await loadAccountData(username);
        if (data.error) {
          throw new Error(data.error);
        }
        
        // For example, assume that your final accountData is stored in data.accountData.
        // You can then set state based on that.
        const accountData = data.accountData;
        const {
          profile: profileData,
          // You might have other fields like scores, narrative, etc.
          // In this example, we assume you want to use:
          createdAt,
          ageInDays,
          displayName,
        } = accountData;

        setProfile({
          displayName: profileData.displayName || profileData.handle,
          username: profileData.handle,
          description: profileData.description || "N/A",
          createdAt: new Date(profileData.createdAt).toLocaleDateString(), // Format as needed
          ageInDays: Math.floor(ageInDays),
          generation: accountData.generation || "Unknown",
        });

        // You can extract scoring fields from your accountData as appropriate.
        setScore({
          handle: profileData.handle,
          did: profileData.did,
          // Adjust these properties based on your accountData structure
          blueskyScore: accountData.blueskyScore,
          atprotoScore: accountData.atprotoScore,
          combinedScore: accountData.combinedScore,
          generatedAt: accountData.scoreGeneratedAt,
          breakdown: accountData.breakdown,
          serviceEndpoint: accountData.serviceEndpoint,
        });
      } catch (err) {
        console.error("Error fetching account data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return <div className="user-profile">Loading...</div>;
  }

  if (error) {
    return <div className="user-profile error">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="user-profile">No profile information available.</div>;
  }

  return (
    <div className="user-profile">
      <h2>{profile.displayName}</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Account Created:</strong> {profile.createdAt} ({profile.ageInDays} days old)</p>
      <p><strong>Generation:</strong> {profile.generation}</p>
      <p><strong>DID:</strong> {score && score.did}</p>
      <p><strong>Service Endpoint:</strong> {score && score.serviceEndpoint}</p>
      <p><strong>Description:</strong> {profile.description}</p>
      {/* Add more profile fields as needed */}
    </div>
  );
};

export default UserProfile;
