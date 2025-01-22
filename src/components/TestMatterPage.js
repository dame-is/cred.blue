// src/pages/TestMatterPage.jsx
import React from "react";
import "./MatterLoadingAnimation.css";
import MatterLoadingAnimation from "../components/MatterLoadingAnimation";

const TestMatterPage = () => {
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

export default TestMatterPage;
