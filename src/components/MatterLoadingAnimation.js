// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Set the fixed (or responsive) dimensions for the canvas.
    const width = 250;
    const height = 250;

    // Create engine and set gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0.1; // A gentle gravity for testing

    // Create the renderer.
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        background: "rgb(222, 222, 222)",
        showIds: true,
        wireframes: false,
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Walls settings (left, right, bottom).
    const wallThickness = 6;
    const wallRenderOptions = {
      fillStyle: "#004f84", // Custom wall color (transparent fill if desired)
    };

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
    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: width, y: height },
    });

    // Settings for our blue circles.
    const minTargetRadius = 7;
    const maxTargetRadius = 16;
    const growthDuration = 500; // milliseconds over which the circle grows

    // Function to create a circle that "pops" from the center:
    const createGrowingCircle = () => {
      // Determine the final target radius.
      const targetRadius =
        Math.random() * (maxTargetRadius - minTargetRadius) + minTargetRadius;
      // We'll start with a radius of 1 (almost zero).
      const initialRadius = 1;
      // Create the circle at the center of the canvas.
      const circle = Matter.Bodies.circle(
        width / 2,
        height / 2,
        initialRadius,
        {
          render: {
            fillStyle: "#3498db",
            strokeStyle: "#3498db",
            lineWidth: 6,
          },
          restitution: 0.6,
        }
      );
      Matter.World.add(engine.world, circle);

      // Animate the growth.
      let currentScale = 1; // starts at a scale factor of 1
      const startTime = performance.now();

      const grow = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / growthDuration, 1); // progress in [0,1]
        // Compute the desired overall scale factor.
        // We want the circle's radius to be targetRadius.
        const desiredScale = targetRadius / initialRadius * progress + (1 - progress);
        // Determine the factor to scale by since the last frame.
        const scaleFactor = desiredScale / currentScale;
        Matter.Body.scale(circle, scaleFactor, scaleFactor);
        // Update our current scale.
        currentScale = desiredScale;
        if (progress < 1) {
          requestAnimationFrame(grow);
        }
      };
      requestAnimationFrame(grow);
    };

    // Add one growing blue circle per second indefinitely.
    const intervalId = setInterval(createGrowingCircle, 1000);

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

  // Center the canvas and loading text.
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        ref={sceneRef}
        style={{
          width: "250px",
          height: "250px",
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
