// src/components/ProgressCircles.jsx
import React from "react";
import "./ProgressCircles.css";

const ProgressCircles = ({ circleCount }) => {
  // Create an array for the circles based on the current count.
  const circles = Array.from({ length: circleCount }, (_, i) => i);

  return (
    <div className="circle-container">
      {circles.map((i) => {
        // Position each circle in a grid for a stacking effect.
        const columnsPerRow = 5;
        const cellSize = 30; // adjust cell size as needed
        const row = Math.floor(i / columnsPerRow);
        const col = i % columnsPerRow;
        const left = col * cellSize + 10;
        const bottom = row * cellSize + 10;

        return (
          <div
            key={i}
            className="circle"
            style={{
              left: `${left}px`,
              bottom: `${bottom}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default ProgressCircles;
