// src/components/MatterLoadingAnimation.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const CONFIG = {
  containerWidth: 200,
  containerHeight: 200,
  gravity: 1,
  shapes: {
    square: {
      size: 20,
      color: "#e74c3c",
      frequency: 1000,
    },
    circle: {
      radius: 10,
      color: "#2ecc71",
      frequency: 1500,
    },
    triangle: {
      size: 25,
      color: "#3498db",
      frequency: 2000,
    },
  },
};

const MatterLoadingAnimation = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Create the engine and set gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = CONFIG.gravity;

    // Create the renderer.
    const render = Matter.Render.create({
        element: sceneRef.current,
        engine: engine,
        options: {
          width: CONFIG.containerWidth,
          height: CONFIG.containerHeight,
          background: "#f0f0f0", // temporary background for debugging
          wireframes: false,
          pixelRatio: window.devicePixelRatio,
        },
      });      
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Create boundaries.
    const offset = 10;
    const walls = [
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        CONFIG.containerHeight + offset,
        CONFIG.containerWidth,
        20,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        CONFIG.containerWidth / 2,
        -offset,
        CONFIG.containerWidth,
        20,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        -offset,
        CONFIG.containerHeight / 2,
        20,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        CONFIG.containerWidth + offset,
        CONFIG.containerHeight / 2,
        20,
        CONFIG.containerHeight,
        { isStatic: true }
      ),
    ];
    Matter.World.add(engine.world, walls);

    // Utility for random horizontal positions.
    const randomX = (size = 0) =>
      Math.random() * (CONFIG.containerWidth - size) + size / 2;

    // Shape creation functions.
    const createSquare = () => {
      const size = CONFIG.shapes.square.size;
      console.log("Creating square");
      const square = Matter.Bodies.rectangle(
        randomX(size),
        -size, // Try -size or 0 if you want them to start closer to view
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
      console.log("Creating circle");
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
      console.log("Creating triangle");
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

    // Setup intervals to drop shapes.
    const squareInterval = setInterval(createSquare, CONFIG.shapes.square.frequency);
    const circleInterval = setInterval(createCircle, CONFIG.shapes.circle.frequency);
    const triangleInterval = setInterval(createTriangle, CONFIG.shapes.triangle.frequency);

    // Cleanup on component unmount.
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

  return <div ref={sceneRef} className="matter-container" />;
};

export default MatterLoadingAnimation;
