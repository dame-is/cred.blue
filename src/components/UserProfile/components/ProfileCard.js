// frontend/src/components/UserProfile/components/ProfileCard.js
import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed

const ProfileCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
    <p>
        <strong>Domain:</strong> {accountData.handle}
    </p>
    <p>
        <strong>DID:</strong> {accountData.did}
    </p>
    <p>
        <strong>Account Created:</strong> {new Date(accountData.createdAt).toLocaleDateString()}{" "}
        (<em>
        {Math.floor(accountData.ageInDays)} days old, {accountData.agePercentage} of Bluesky's history
        </em>)
    </p>
    <p>
        <strong>Service Endpoint:</strong> {accountData.serviceEndpoint}
    </p>
    <p>
        <strong>PDS Type:</strong> {accountData.pdsType}
    </p>
    <p>
        <strong>Last Edited:</strong> {accountData.profileEditedDate}
    </p>
    <p>
        <strong>Profile Completion:</strong> {accountData.profileCompletion}
    </p>
    <p>
        <strong>Era:</strong> {accountData.era}
    </p>
    </>
  );
};

export default ProfileCard;
