// src/components/UserProfile/UserProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ScoreResult from "../ScoreResult"; // Import the ScoreResult component
import "./UserProfile.css"; // Ensure this CSS file exists and is styled appropriately

const UserProfile = () => {
  const { username } = useParams(); // Extract the username from the URL
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend URL from your environment
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchProfileAndScore = async () => {
      try {
        // Use the new publicdata endpoint instead of publicscore
        const response = await fetch(`${backendUrl}/api/publicdata`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identity: username }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch data for ${username}.`);
        }

        const data = await response.json();
        // In the new response, all computed values are under data.accountData.
        const accountData = data.accountData;

        // Extract and format profile data from the accountData object
        setProfile({
          displayName: (accountData.profile && accountData.profile.displayName) || accountData.handle,
          username: accountData.handle,
          description: (accountData.profile && accountData.profile.description) || "N/A",
          createdAt: new Date(accountData.createdAt).toLocaleDateString(), // Format as per locale
          ageInDays: Math.floor(accountData.ageInDays), // Ensure it's an integer
          generation: accountData.generation || 'Unknown',
        });

        setScore({
          handle: accountData.handle,
          did: accountData.did,
          blueskyScore: accountData.blueskyScore,
          atprotoScore: accountData.atprotoScore,
          combinedScore: accountData.combinedScore,
          generatedAt: accountData.scoreGeneratedAt,
          breakdown: accountData.breakdown,
          serviceEndpoint: accountData.serviceEndpoint,
        });

        // Debug log (optional)
        console.log("Fetched Account Data:", {
          profile: {
            displayName: (accountData.profile && accountData.profile.displayName) || accountData.handle,
            username: accountData.handle,
            description: (accountData.profile && accountData.profile.description) || "N/A",
            createdAt: new Date(accountData.createdAt).toLocaleDateString(),
            ageInDays: Math.floor(accountData.ageInDays),
            generation: accountData.generation || 'Unknown',
          },
          score: {
            handle: accountData.handle,
            did: accountData.did,
            blueskyScore: accountData.blueskyScore,
            atprotoScore: accountData.atprotoScore,
            combinedScore: accountData.combinedScore,
            generatedAt: accountData.scoreGeneratedAt,
            breakdown: accountData.breakdown,
            serviceEndpoint: accountData.serviceEndpoint,
          },
        });
      } catch (err) {
        console.error("Error fetching profile and score:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndScore();
  }, [username, backendUrl]);

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
      <h2>{profile.displayName || profile.username}</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p>
        <strong>Account Created:</strong> {profile.createdAt} ({profile.ageInDays} days old)
      </p>
      <p><strong>Generation:</strong> {profile.generation}</p>
      <p><strong>DID:</strong> {score.did}</p>
      <p><strong>Service Endpoint:</strong> {score.serviceEndpoint}</p>
      <p><strong>Description:</strong> {profile.description}</p>
      {/* Additional profile fields can be added here */}

      {score && (
        <div className="score-section">
          <h3>Score: {score.combinedScore}</h3>
          {/* Render detailed score breakdown using the ScoreResult component */}
          <ScoreResult result={score} loading={false} />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
