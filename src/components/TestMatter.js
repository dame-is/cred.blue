// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Set the fixed dimensions for the canvas.
    const width = 500;
    const height = 500;

    // Create engine and set gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1;

    // Create the renderer with a fixed 500x500 dimensions.
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        background: "#f0f0f0",
        wireframes: false,
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Walls settings
    const wallThickness = 50;
    const wallRenderOptions = {
      fillStyle: "#2c3e50",   // Custom fill
      strokeStyle: "#ecf0f1", // Custom border color
      lineWidth: 1,
    };

    // Create walls with custom styling.
    // In this example, we'll add three walls: left, right, and bottom.
    // (You can uncomment/add the top wall if needed.)
    const walls = [
      // Uncomment to add a top wall:
      // Matter.Bodies.rectangle(
      //   width / 2,
      //   0,
      //   width,
      //   wallThickness,
      //   { isStatic: true, render: wallRenderOptions }
      // ),
      // Bottom wall
      Matter.Bodies.rectangle(
        width / 2,
        height,
        width,
        wallThickness,
        { isStatic: true, render: wallRenderOptions }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        0,
        height / 2,
        wallThickness,
        height,
        { isStatic: true, render: wallRenderOptions }
      ),
      // Right wall
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
    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    });

    // Blue circles with random sizes.
    const minRadius = 5;
    const maxRadius = 30;

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

    // Add one blue circle per second indefinitely.
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

  // Render the fixed-size 500x500 canvas and center it with some loading text.
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
          width: "500px",
          height: "500px",
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
