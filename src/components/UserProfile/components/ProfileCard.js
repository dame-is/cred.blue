// frontend/src/components/UserProfile/components/ProfileCard.js
import React from "react";

const ProfileCard = ({
  resolvedHandle,
  did,
  createdAt,
  ageInDays,
  serviceEndpoint,
  pdsType,
}) => {
  return (
    <>
      <p>
        <strong>Username:</strong> {resolvedHandle}
      </p>
      <p>
        <strong>DID:</strong> {did}
      </p>
      <p>
        <strong>Account Created:</strong> {new Date(createdAt).toLocaleDateString()}{" "}
        (<em>{Math.floor(ageInDays)} days old</em>)
      </p>
      <p>
        <strong>Service Endpoint:</strong> {serviceEndpoint}
      </p>
      <p>
        <strong>PDS Type:</strong> {pdsType}
      </p>
    </>
  );
};

export default ProfileCard;
