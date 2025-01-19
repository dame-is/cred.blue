// src/components/ProgressCircles.jsx (updated)
import React from "react";
import "./ProgressCircles.css";

const ProgressCircles = ({ progress, totalPages = 45 }) => {
  const pagesCompleted = Math.floor(progress / (100 / totalPages));
  const circles = Array.from({ length: pagesCompleted }, (_, i) => i);

  return (
    <div className="circle-container">
      {circles.map((i) => {
        // Calculate vertical offset: 
        // For example, if you want the circles to stack in rows of 5 inside the container.
        // Adjust columnsPerRow to your preference.
        const columnsPerRow = 5;
        const row = Math.floor(i / columnsPerRow);
        const col = i % columnsPerRow;
        const cellSize = 30; // space per circle cell (adjust as necessary)

        // Compute left and bottom using cell index (so that circles appear in a grid)
        const left = col * cellSize + 10; // adjust offset as needed
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
