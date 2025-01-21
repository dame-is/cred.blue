// frontend/src/components/UserProfile/components/ProfileCard.js
import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed

const ProfileCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading profile...</div>;
  }

  const {
    handle: resolvedHandle,
    did,
    createdAt,
    ageInDays,
    serviceEndpoint,
    pdsType,
    profileEditedDate,
    profileCompletion,
    agePercentage,
    era,
  } = accountData;

  return (
    <>
      <p>
        <strong>Domain:</strong> {resolvedHandle}
      </p>
      <p>
        <strong>DID:</strong> {did}
      </p>
      <p>
        <strong>Account Created:</strong>{" "}
        {new Date(createdAt).toLocaleDateString()}{" "}
        (<em>
          {Math.floor(ageInDays)} days old, {agePercentage} of Bluesky's history
        </em>)
      </p>
      <p>
        <strong>Service Endpoint:</strong> {serviceEndpoint}
      </p>
      <p>
        <strong>PDS Type:</strong> {pdsType}
      </p>
      <p>
        <strong>Last Edited:</strong> {profileEditedDate}
      </p>
      <p>
        <strong>Profile Completion:</strong> {profileCompletion}
      </p>
      <p>
        <strong>Era:</strong> {era}
      </p>
    </>
  );
};

export default ProfileCard;
