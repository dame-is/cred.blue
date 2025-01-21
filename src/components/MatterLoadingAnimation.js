// src/components/MatterLoadingAnimation.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const CONFIG = {
  containerWidth: 300,
  containerHeight: 300,
  gravity: 1,
  square: {
    size: 50,
    color: "#e74c3c",
    // For this test, we won't use a repeating interval; just one square.
  },
};

const MatterLoadingAnimation = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Create the engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = CONFIG.gravity;

    // Create the renderer
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

    // Create and run the runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Create static boundaries so the square remains visible
    const offset = 20;
    const walls = [
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        CONFIG.containerHeight + offset,
        CONFIG.containerWidth,
        40,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        -offset,
        CONFIG.containerWidth,
        40,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        -offset,
        CONFIG.containerHeight / 2,
        40,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        CONFIG.containerWidth + offset,
        CONFIG.containerHeight / 2,
        40,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
    ];
    Matter.World.add(engine.world, walls);

    // Create one red square that falls into view
    const square = Matter.Bodies.rectangle(
      CONFIG.containerWidth / 2,  // center horizontally
      -CONFIG.square.size,        // starting above the container
      CONFIG.square.size,
      CONFIG.square.size,
      {
        render: { fillStyle: CONFIG.square.color },
        restitution: 0.5,
      }
    );
    Matter.World.add(engine.world, square);

    // Clean up on unmount
    return () => {
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
