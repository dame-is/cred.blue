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
        <strong>DID:</strong> {accountData.did}
    </p>
    <p>
        <strong>Domain:</strong> {accountData.handle}
    </p>
    <p>
        <strong>Incept Date:</strong> {new Date(accountData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
    <p>
        <strong>Account Age:</strong> {Math.floor(accountData.ageInDays)} days old
    </p>
    <p>
        <strong>Contextual Age:</strong> {new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 0 }).format(accountData.agePercentage)} of Bluesky's history
    </p>
    <p>
        <strong>PDS Host:</strong> {accountData.serviceEndpoint}
    </p>
    <p>
        <strong>PDS Type:</strong> {accountData.pdsType} Server
    </p>
    <p>
        <strong>Profile Edited:</strong> {accountData.profileEditedDate}
    </p>
    <p>
        <strong>Profile State:</strong> {accountData.profileCompletion}
    </p>
    <p>
        <strong>Era:</strong> {accountData.era}
    </p>
    <p>
        <strong>Posting Style:</strong> {accountData.socialStatus}
    </p>
    <p>
        <strong>Social Status:</strong> {accountData.postingStyle}
    </p>
    </>
  );
};

export default ProfileCard;