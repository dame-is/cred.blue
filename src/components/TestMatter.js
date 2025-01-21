// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Set the canvas dimensions, but cap them with a max of 500.
    const canvasWidth = Math.min(window.innerWidth, 500);
    const canvasHeight = Math.min(window.innerHeight, 500);

    // Create the engine and enable gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1;

    // Create the renderer with our calculated dimensions.
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        background: "#f0f0f0",
        wireframes: false,
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // For variety, set a minimum and maximum radius for the circles.
    const minRadius = 5;
    const maxRadius = 30;

    // Function to create a blue circle with a random radius.
    const createCircle = () => {
      // Randomize radius.
      const radius =
        Math.random() * (maxRadius - minRadius) + minRadius;
      // Random X position ensuring the entire circle fits.
      const xPos =
        Math.random() * (canvasWidth - 2 * radius) + radius;
      
      // Create the circle starting above the canvas.
      const circle = Matter.Bodies.circle(
        xPos,
        -2 * radius,  // start off-screen above the canvas
        radius,
        {
          render: { fillStyle: "#3498db" },
          restitution: 0.6,
        }
      );
      Matter.World.add(engine.world, circle);
    };

    // Create a new blue circle every 1000 milliseconds.
    const intervalId = setInterval(createCircle, 1000);

    // Optional: Add a static floor below the canvas so circles don't fall forever.
    const floor = Matter.Bodies.rectangle(
      canvasWidth / 2,
      canvasHeight + 50, // 50px below the bottom
      canvasWidth,
      100,
      { isStatic: true, render: { visible: false } }
    );
    Matter.World.add(engine.world, floor);

    // Cleanup on unmount.
    return () => {
      clearInterval(intervalId);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <div
        ref={sceneRef}
        style={{
          width: "100%",
          maxWidth: "500px",
          height: "100%",
          maxHeight: "500px",
          border: "2px solid #ccc",
          boxSizing: "border-box",
        }}
      />
      <p style={{ marginTop: "20px", fontSize: "1.2em" }}>
        Loading account data...
      </p>
    </div>
  );
};

export default TestMatter;
