// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Set maximum desired dimensions
    const maxSize = 500;

    // Calculate responsive dimensions:
    // If the viewport is smaller than maxSize, use the viewport dimensions.
    // Otherwise, use maxSize.
    const width = Math.min(window.innerWidth, maxSize);
    const height = Math.min(window.innerHeight, maxSize);

    // Create the Matter.js engine and set gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1;

    // Create the renderer using the responsive width and height.
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        background: "rgb(222, 222, 222)", // Use a light background
        showAngleIndicator: true,
        wireframes: false,
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Walls settings.
    const wallThickness = 10;
    const wallRenderOptions = {
      fillStyle: "#004f84", // Custom wall color
    };

    // Create walls with custom styling.
    // In this example, we'll add three walls: left, right, and bottom.
    // (The top wall is omitted so that new circles can fall in from above.)
    const walls = [
      // Bottom wall.
      Matter.Bodies.rectangle(
        width / 2,
        height,
        width,
        wallThickness,
        { isStatic: true, render: wallRenderOptions }
      ),
      // Left wall.
      Matter.Bodies.rectangle(
        0,
        height / 2,
        wallThickness,
        height,
        { isStatic: true, render: wallRenderOptions }
      ),
      // Right wall.
      Matter.Bodies.rectangle(
        width,
        height / 2,
        wallThickness,
        height,
        { isStatic: true, render: wallRenderOptions }
      ),
    ];
    Matter.World.add(engine.world, walls);

    // Enable mouse control.
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Fit the render viewport to the scene.
    // This makes sure the scene is scaled to appear within the defined bounds.
    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    });

    // Blue circles with random sizes.
    const minRadius = 10;
    const maxRadius = 20;

    const createCircle = () => {
      const radius = Math.random() * (maxRadius - minRadius) + minRadius;
      const xPos = Math.random() * (width - 2 * radius) + radius;
      const circle = Matter.Bodies.circle(
        xPos,
        -2 * radius, // start above the canvas
        radius,
        { render: { fillStyle: "#3498db" }, restitution: 0.6 }
      );
      Matter.World.add(engine.world, circle);
    };

    // Add one blue circle every second indefinitely.
    const intervalId = setInterval(createCircle, 1000);

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

  // Render a responsive container that centers the canvas and loading text.
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
          height: "auto",
          aspectRatio: "1 / 1",
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
