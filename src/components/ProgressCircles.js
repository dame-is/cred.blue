// src/components/ProgressCircles.jsx
import React, { useEffect, useState } from "react";
import "./ProgressCircles.css";

const MAX_CIRCLES = 90;

const ProgressCircles = ({ loading }) => {
  // Use secondsElapsed to represent progress (1 circle per second).
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!loading) return; // Do nothing if loading is finished

    const intervalId = setInterval(() => {
      setSecondsElapsed((prev) => {
        // Increase by one second until MAX_CIRCLES
        if (prev < MAX_CIRCLES) {
          return prev + 1;
        } else {
          return prev;
        }
      });
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [loading]);

  // Build an array with one element per circle
  const circles = Array.from({ length: secondsElapsed }, (_, i) => i);

  return (
    <div className="circle-container">
      {circles.map((i) => {
        // Randomize a horizontal starting position (in percent)
        // so that circles don’t appear in a grid; they “fall” and then settle.
        const randomLeft = Math.random() * 80 + 10; // between 10% and 90%
        return (
          <div
            key={i}
            className="circle"
            // The inline style randomly sets left and delays the drop
            style={{
              left: `${randomLeft}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export default ProgressCircles;
