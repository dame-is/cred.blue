// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const TestMatter = () => {
  const sceneRef = useRef(null);
  const timeoutRef = useRef(null); // Use a ref to store the timeout ID

  useEffect(() => {
    // Set the fixed dimensions for the canvas.
    const width = 250;
    const height = 250;

    // Create engine and set gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0.1;

    // Create the renderer with the fixed dimensions.
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        background: "rgb(222, 222, 222)",
        showIds: false,
        wireframes: false,
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Walls settings
    const wallThickness = 6;
    const wallRenderOptions = {
      fillStyle: "#f0f0f000", // Custom fill (transparent in this case)
    };

    // Create walls with custom styling.
    // In this example, we'll add four walls: top, bottom, left, and right.
    const walls = [
      // Top wall
      Matter.Bodies.rectangle(
        width / 2,
        0,
        width,
        wallThickness,
        { isStatic: true, render: wallRenderOptions }
      ),
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

    // Settings for our blue circles.
    const minRadius = 9;
    const maxRadius = 18;
    const growthDuration = 400; // milliseconds over which the circle grows

    // Get custom circle render styling from CSS variables.
    // You can set these in your CSS file.
    const rootStyles = getComputedStyle(document.documentElement);
    const circleFill = rootStyles.getPropertyValue("--circle-fill").trim() || "#004f84c2";
    const circleStroke = rootStyles.getPropertyValue("--circle-stroke").trim() || "#3498dbdc";
    const circleLineWidth = parseFloat(rootStyles.getPropertyValue("--circle-linewidth")) || 6;

    // Bounce easing function.
    function bounceEaseOut(t) {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        t -= 1.5 / d1;
        return n1 * t * t + 0.75;
      } else if (t < 2.5 / d1) {
        t -= 2.25 / d1;
        return n1 * t * t + 0.9375;
      } else {
        t -= 2.625 / d1;
        return n1 * t * t + 0.984375;
      }
    }

    // Create a blue circle that "pops" up with a bounce effect.
    // The circle will appear at a random position on the canvas.
    const createCircle = () => {
      // Determine the final target radius.
      const targetRadius = Math.random() * (maxRadius - minRadius) + minRadius;
      // Use a very small initial radius so we can "grow" it.
      const initialRadius = 0.1;
      // Randomly choose its starting position, ensuring it fits within the canvas.
      const xPos = Math.random() * (width - 2 * targetRadius) + targetRadius;
      const yPos = Math.random() * (height - 2 * targetRadius) + targetRadius;
      
      // Create the circle at the random position, with the tiny initial radius.
      const circle = Matter.Bodies.circle(
        xPos,
        yPos,
        initialRadius,
        {
          render: { 
            fillStyle: circleFill,
            strokeStyle: circleStroke,
            lineWidth: circleLineWidth
          },
          restitution: 0.6
        }
      );
      Matter.World.add(engine.world, circle);

      // Animate the growth of the circle.
      let currentScale = 1; // Body initially at scale factor 1
      const targetScale = targetRadius / initialRadius; // Scale factor needed to reach targetRadius
      const startTime = performance.now();

      const grow = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / growthDuration, 1);
        const easing = bounceEaseOut(progress);
        const desiredScale = 1 + (targetScale - 1) * easing;
        const scaleFactor = desiredScale / currentScale;
        Matter.Body.scale(circle, scaleFactor, scaleFactor);
        currentScale = desiredScale;
        if (progress < 1) {
          requestAnimationFrame(grow);
        }
      };
      requestAnimationFrame(grow);
    };

    // Instead of a fixed interval, schedule the next circle appearance randomly between 100 and 500 ms.
    const scheduleNextCircle = () => {
      const delay = Math.random() * (500 - 100) + 100; // Delay between 100 and 500 ms
      timeoutRef.current = setTimeout(() => {
        createCircle();
        scheduleNextCircle();
      }, delay);
    };
    scheduleNextCircle();

    // Cleanup on unmount.
    return () => {
      clearTimeout(timeoutRef.current);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  // Render the fixed-size 250x250 canvas and center it with some loading text.
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
