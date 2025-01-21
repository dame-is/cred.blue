// src/components/MatterLoadingAnimation.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const CONFIG = {
  containerWidth: 300,
  containerHeight: 300,
  gravity: 1,
  // For now, we use a red square for debugging
  square: {
    size: 50,
    color: "#e74c3c",
    frequency: 1000, // drop one every second
  },
};

const MatterLoadingAnimation = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Create the engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = CONFIG.gravity;

    // Create the renderer (force pixelRatio: 1 for clarity)
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: CONFIG.containerWidth,
        height: CONFIG.containerHeight,
        background: "#f0f0f0",
        wireframes: false,
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Create static boundaries (walls)
    const offset = 20;
    const walls = [
      // Floor
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        CONFIG.containerHeight + offset,
        CONFIG.containerWidth,
        40,
        { isStatic: true }
      ),
      // Ceiling
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        -offset,
        CONFIG.containerWidth,
        40,
        { isStatic: true }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        -offset,
        CONFIG.containerHeight / 2,
        40,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        CONFIG.containerWidth + offset,
        CONFIG.containerHeight / 2,
        40,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
    ];
    Matter.World.add(engine.world, walls);

    // Utility for a random X position (ensuring full square visibility)
    const randomX = (size) =>
      Math.random() * (CONFIG.containerWidth - size) + size / 2;

    // Create a red square.
    const createSquare = () => {
      const square = Matter.Bodies.rectangle(
        randomX(CONFIG.square.size),
        -CONFIG.square.size, // start above the container
        CONFIG.square.size,
        CONFIG.square.size,
        {
          render: { fillStyle: CONFIG.square.color },
          restitution: 0.5,
        }
      );
      Matter.World.add(engine.world, square);
    };

    // Set an interval to create one red square per second.
    const squareInterval = setInterval(createSquare, CONFIG.square.frequency);

    // Clean-up on unmount.
    return () => {
      clearInterval(squareInterval);
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
