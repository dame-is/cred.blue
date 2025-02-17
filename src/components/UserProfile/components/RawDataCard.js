// frontend/src/components/UserProfile/components/RawDataCard.js
import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Ensure the path is correct
import "./RawDataCard.css"; // Optional: For styling

// Recursive component to render nested objects and arrays
const RenderData = ({ data, indentLevel = 0 }) => {
  const indentStyle = {
    paddingLeft: `${indentLevel * 20}px`,
  };

  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      return (
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              <RenderData data={item} indentLevel={indentLevel + 1} />
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <div style={indentStyle}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="data-entry">
              <strong>{key}:</strong>{" "}
              {typeof value === "object" && value !== null ? (
                <RenderData data={value} indentLevel={indentLevel + 1} />
              ) : (
                value.toString()
              )}
            </div>
          ))}
        </div>
      );
    }
  } else {
    return <span>{data.toString()}</span>;
  }
};

const RawDataCard = () => {
  const accountData = useContext(AccountDataContext); // Directly access accountData

  if (!accountData) {
    return <div>Loading account data...</div>;
  }

  return (
    <div className="raw-data-card">
      <h1>Raw Account Data</h1>
      <RenderData data={accountData} />
    </div>
  );
};

export default RawDataCard;
