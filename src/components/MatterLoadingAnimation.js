// src/components/MatterLoadingAnimation.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const CONFIG = {
  containerWidth: 200,
  containerHeight: 200,
  gravity: 1,
  circle: {
    radius: 10,
    color: "#3498db", // blue circle
    frequency: 1000,  // one circle per second
  },
};

const MatterLoadingAnimation = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Create the engine and set gravity
    const engine = Matter.Engine.create();
    engine.world.gravity.y = CONFIG.gravity;

    // Create the renderer; force pixelRatio to 1 for clarity
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: CONFIG.containerWidth,
        height: CONFIG.containerHeight,
        background: "#f0f0f0", // light background to contrast the circles
        wireframes: false,
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create and run the runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Create static boundaries (walls) so that circles remain within the container
    const offset = 10;
    const walls = [
      // Floor
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        CONFIG.containerHeight + offset,
        CONFIG.containerWidth,
        20,
        { isStatic: true }
      ),
      // Ceiling
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        -offset,
        CONFIG.containerWidth,
        20,
        { isStatic: true }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        -offset,
        CONFIG.containerHeight / 2,
        20,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        CONFIG.containerWidth + offset,
        CONFIG.containerHeight / 2,
        20,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
    ];
    Matter.World.add(engine.world, walls);

    // Utility for generating a random X position ensuring the entire circle fits
    const randomX = (diameter) =>
      Math.random() * (CONFIG.containerWidth - diameter) + diameter / 2;

    // Function to create a blue circle
    const createCircle = () => {
      const diameter = CONFIG.circle.radius * 2;
      const circle = Matter.Bodies.circle(
        randomX(diameter),
        -diameter, // Start offscreen above the container
        CONFIG.circle.radius,
        {
          render: { fillStyle: CONFIG.circle.color },
          restitution: 0.6, // Adjust bounce if desired
        }
      );
      Matter.World.add(engine.world, circle);
    };

    // Set an interval to drop one circle per second
    const circleInterval = setInterval(createCircle, CONFIG.circle.frequency);

    // Cleanup on component unmount
    return () => {
      clearInterval(circleInterval);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return <div ref={sceneRef} className="matter-container" />;
};

export default MatterLoadingAnimation;
