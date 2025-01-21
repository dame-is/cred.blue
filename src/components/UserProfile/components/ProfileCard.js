// frontend/src/components/UserProfile/components/ProfileCard.js
import React from "react";
import Card from "../../Card/Card"; // Adjust the path based on your project structure

const ProfileCard = ({
  resolvedHandle,
  did,
  createdAt,
  ageInDays,
  serviceEndpoint,
  pdsType,
}) => {
  return (
    <div className="grid-item">
      <Card title="Profile Overview">
        <div className="drag-handle">
          <span className="drag-icon">≡</span>
        </div>
        <p>
          <strong>Username:</strong> {resolvedHandle}
        </p>
        <p>
          <strong>DID:</strong> {did}
        </p>
        <p>
          <strong>Account Created:</strong>{" "}
          {new Date(createdAt).toLocaleDateString()}{" "}
          (<em>{Math.floor(ageInDays)} days old</em>)
        </p>
        <p>
          <strong>Service Endpoint:</strong> {serviceEndpoint}
        </p>
        <p>
          <strong>PDS Type:</strong> {pdsType}
        </p>
      </Card>
    </div>
  );
};

export default ProfileCard;
