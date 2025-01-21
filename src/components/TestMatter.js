// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Get dimensions to make the canvas full-page.
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create the engine and enable gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1; // Adjust gravity as needed

    // Create the renderer using the full-page dimensions.
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

    // Function to create and add a falling red square.
    const createSquare = () => {
      // Define square dimensions.
      const squareSize = 50;

      // Random X position from squareSize/2 to (width - squareSize/2)
      const randomX = Math.random() * (width - squareSize) + squareSize / 2;

      // Create a red square starting above the view.
      const square = Matter.Bodies.rectangle(
        randomX,
        -squareSize, // Start above the canvas
        squareSize,
        squareSize,
        {
          render: { fillStyle: "#e74c3c" },
          restitution: 0.5, // Bounce factor, adjust as needed
        }
      );
      Matter.World.add(engine.world, square);
    };

    // Set an interval to add one red square every second.
    const intervalId = setInterval(createSquare, 1000);

    // Optionally, create boundaries so objects don't fall forever.
    // For example, a floor just below the viewport:
    const floor = Matter.Bodies.rectangle(
      width / 2,
      height + 50, // 50px below the bottom edge
      width,
      100,
      { isStatic: true, render: { visible: false } }
    );
    Matter.World.add(engine.world, floor);

    // Cleanup on component unmount.
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

  // Make the container fill the whole page.
  return <div ref={sceneRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default TestMatter;
