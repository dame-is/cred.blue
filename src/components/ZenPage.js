// src/pages/ZenPage.jsx
import React from "react";
import "./MatterLoadingAnimation.css";
import "./ZenPage.css";
import MatterLoadingAnimation from "./MatterLoadingAnimation";

const ZenPage = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      background: "none"
    }}>
      <MatterLoadingAnimation />
    </div>
  );
};

export default ZenPage;
