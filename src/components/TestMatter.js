// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Use full viewport dimensions (or adjust as needed)
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1; // Adjust gravity as needed

    // Create renderer with full viewport dimensions
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

    // Create runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Walls (top, bottom, left, right) – adjust thickness as needed
    const wallThickness = 50;
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(width / 2, 0, width, wallThickness, { isStatic: true }),
      // Bottom wall
      Matter.Bodies.rectangle(width / 2, height, width, wallThickness, { isStatic: true }),
      // Left wall
      Matter.Bodies.rectangle(0, height / 2, wallThickness, height, { isStatic: true }),
      // Right wall
      Matter.Bodies.rectangle(width, height / 2, wallThickness, height, { isStatic: true }),
    ];
    Matter.World.add(engine.world, walls);

    // Enable mouse control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Matter.World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Fit the render viewport to the scene
    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    });

    // For variety, add blue circles with random sizes.
    const minRadius = 5;
    const maxRadius = 30;

    const createCircle = () => {
      const radius = Math.random() * (maxRadius - minRadius) + minRadius;
      // Random x position ensuring the circle fits fully.
      const xPos = Math.random() * (width - 2 * radius) + radius;
      // Start well above the scene
      const circle = Matter.Bodies.circle(
        xPos,
        -2 * radius,
        radius,
        {
          render: { fillStyle: "#3498db" },
          restitution: 0.6,
        }
      );
      Matter.World.add(engine.world, circle);
    };

    // Add one blue circle per second indefinitely.
    const intervalId = setInterval(createCircle, 1000);

    // Cleanup on unmount
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

  // The container fills the viewport.
  return <div ref={sceneRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default TestMatter;
