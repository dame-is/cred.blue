// frontend/src/components/UserProfile/components/ProfileCard.js
import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed

const ProfileCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading profile...</div>;
  }

  // Helper to capitalize a single-word string (e.g., "complete" -> "Complete")
  const capitalize = (word) => {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  // Helper to format the edited date
  const formatEditedDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
      .toLowerCase();
    return `${formattedDate} at ${formattedTime}`;
  };

  return (
    <>
      <p>
        <strong>DID:</strong> {accountData.did}
      </p>
      <p>
        <strong>Domain:</strong> {accountData.handle}
      </p>
      <p>
        <strong>Incept Date:</strong>{" "}
        {new Date(accountData.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p>
        <strong>Account Era:</strong> {accountData.era}
      </p>
      <p>
        <strong>Account Age:</strong> {Math.floor(accountData.ageInDays)} days old
      </p>
      <p>
        <strong>Contextual Age:</strong>{" "}
        {new Intl.NumberFormat("en-US", {
          style: "percent",
          minimumFractionDigits: 0,
        }).format(accountData.agePercentage)}{" "}
        of Bluesky's history
      </p>
      <p>
        <strong>Posting Style:</strong> {accountData.postingStyle}
      </p>
      <p>
        <strong>Social Status:</strong> {accountData.socialStatus}
      </p>
      <p>
        <strong>PDS Type:</strong> {accountData.pdsType} Server
      </p>
      <p>
        <strong>PDS Host:</strong> {accountData.serviceEndpoint}
      </p>
      <p>
        <strong>Profile State:</strong>{" "}
        {capitalize(accountData.profileCompletion)}
      </p>
      <p>
        <strong>Profile Last Edited:</strong>{" "}
        {formatEditedDate(accountData.profileEditedDate)}
      </p>
    </>
  );
};

export default ProfileCard;
