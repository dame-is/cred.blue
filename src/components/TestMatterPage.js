// src/pages/TestMatterPage.jsx
import React from "react";
import TestMatter from "../components/TestMatter"; // Adjust the path if needed

const TestMatterPage = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "85vh",
      background: "#fafafa",
    }}>
      <TestMatter />
    </div>
  );
};

export default TestMatterPage;
