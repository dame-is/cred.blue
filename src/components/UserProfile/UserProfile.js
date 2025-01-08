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

  // Backend URL
  const BACKEND_URL = 'http://localhost:5001'; // Adjust if different

  useEffect(() => {
    const fetchProfileAndScore = async () => {
      try {
        // Step 1: Fetch Score and Profile Information from Public Endpoint
        const response = await fetch(`${BACKEND_URL}/api/public/score`, {
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
        const { handle, did, blueskyScore, atprotoScore, combinedScore, generatedAt, breakdown, serviceEndpoint, createdAt, ageInDays } = data.data;

        setProfile({
          displayName: data.data.profile?.displayName || handle,
          username: handle,
          description: data.data.profile?.description || "N/A",
          createdAt: new Date(createdAt).toLocaleDateString(), // Format as per locale
          ageInDays: Math.floor(ageInDays), // Ensure it's an integer
          generation: data.data.generation || 'Unknown',
        });

        setScore({
          handle,
          did,
          blueskyScore,
          atprotoScore,
          combinedScore,
          generatedAt,
          breakdown,
          serviceEndpoint, // Include serviceEndpoint
        });

        // Debugging: Log the fetched data
        console.log("Fetched Profile Data:", {
          profile: {
            displayName: data.data.profile?.displayName || handle,
            username: handle,
            description: data.data.profile?.description || "N/A",
            createdAt: new Date(createdAt).toLocaleDateString(),
            ageInDays: Math.floor(ageInDays),
            generation: data.data.generation || 'Unknown',
          },
          score: {
            handle,
            did,
            blueskyScore,
            atprotoScore,
            combinedScore,
            generatedAt,
            breakdown,
            serviceEndpoint,
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
  }, [username, BACKEND_URL]);

  if (loading) {
    return <div className="user-profile">Loading...</div>; // You can replace this with a spinner or skeleton
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
      <p><strong>Account Created:</strong> {profile.createdAt} ({profile.ageInDays} days old)</p>
      <p><strong>Generation</strong> {profile.generation}</p>
      <p><strong>DID:</strong> {score.did}</p>
      <p><strong>Service Endpoint:</strong> {score.serviceEndpoint}</p>
      <p><strong>Description:</strong> {profile.description}</p>
      {/* Add more profile fields as needed */}

      {score && (
        <div className="score-section">
          <h3>Score: {score.combinedScore}</h3>
          {/* Display detailed score breakdown using ScoreResult */}
          <ScoreResult result={score} loading={false} />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
