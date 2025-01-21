// src/components/MatterLoadingAnimation.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

// Configuration variables for shapes
const CONFIG = {
  // Container dimensions (should match CSS too)
  containerWidth: 200,
  containerHeight: 200,
  // Gravity (vertical acceleration)
  gravity: 1,

  // Options for shapes:
  shapes: {
    square: {
      size: 20,           // width and height
      color: "#e74c3c",   // red-ish
      frequency: 1000,    // drop a square every 1 second
    },
    circle: {
      radius: 10,         // radius
      color: "#2ecc71",   // green-ish
      frequency: 1500,    // drop a circle every 1.5 second
    },
    triangle: {
      size: 25,           // side length (approximate bounding box)
      color: "#3498db",   // blue-ish
      frequency: 2000,    // drop a triangle every 2 seconds
    },
  },
};

const MatterLoadingAnimation = () => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    // create engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = CONFIG.gravity;
    engineRef.current = engine;

    // create renderer using our canvas element
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: CONFIG.containerWidth,
        height: CONFIG.containerHeight,
        background: "transparent",
        wireframes: false,
        pixelRatio: window.devicePixelRatio,
      },
    });
    Matter.Render.run(render);

    // create runner
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Create boundaries for the simulation (walls inside the rectangular canvas)
    const offset = 10;
    const walls = [
      // floor
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        CONFIG.containerHeight + offset,
        CONFIG.containerWidth,
        20,
        { isStatic: true }
      ),
      // ceiling
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        -offset,
        CONFIG.containerWidth,
        20,
        { isStatic: true }
      ),
      // left wall
      Matter.Bodies.rectangle(
        -offset,
        CONFIG.containerHeight / 2,
        20,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
      // right wall
      Matter.Bodies.rectangle(
        CONFIG.containerWidth + offset,
        CONFIG.containerHeight / 2,
        20,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
    ];
    Matter.World.add(engine.world, walls);

    // Utility: Random horizontal position within the container bounds
    const randomX = (size = 0) =>
      Math.random() * (CONFIG.containerWidth - size) + size / 2;

    // Shape creation functions
    const createSquare = () => {
      const size = CONFIG.shapes.square.size;
      const square = Matter.Bodies.rectangle(
        randomX(size),
        -size, // start above view
        size,
        size,
        {
          render: { fillStyle: CONFIG.shapes.square.color },
          restitution: 0.5,
        }
      );
      Matter.World.add(engine.world, square);
    };

    const createCircle = () => {
      const radius = CONFIG.shapes.circle.radius;
      const circle = Matter.Bodies.circle(
        randomX(radius * 2),
        -radius * 2,
        radius,
        {
          render: { fillStyle: CONFIG.shapes.circle.color },
          restitution: 0.5,
        }
      );
      Matter.World.add(engine.world, circle);
    };

    const createTriangle = () => {
      const size = CONFIG.shapes.triangle.size;
      // Define the three vertices of the triangle
      const halfSize = size / 2;
      const vertices = [
        { x: 0, y: -halfSize },
        { x: -halfSize, y: halfSize },
        { x: halfSize, y: halfSize },
      ];

      const triangle = Matter.Bodies.fromVertices(
        randomX(size),
        -size,
        [vertices],
        {
          render: { fillStyle: CONFIG.shapes.triangle.color },
          restitution: 0.5,
        },
        true
      );
      if (triangle) {
        Matter.World.add(engine.world, triangle);
      }
    };

    // Create intervals to drop shapes according to frequency settings.
    const squareInterval = setInterval(createSquare, CONFIG.shapes.square.frequency);
    const circleInterval = setInterval(createCircle, CONFIG.shapes.circle.frequency);
    const triangleInterval = setInterval(createTriangle, CONFIG.shapes.triangle.frequency);

    // Clean up on unmount
    return () => {
      clearInterval(squareInterval);
      clearInterval(circleInterval);
      clearInterval(triangleInterval);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return <div className="matter-container" ref={sceneRef} />;
};

export default MatterLoadingAnimation;
