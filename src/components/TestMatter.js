// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Create the engine and enable gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 1; // Non-zero gravity so squares fall

    // Create the renderer.
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 200,
        height: 200,
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
      // Ensure the square fits inside the 200px width; here, square width is 50.
      const square = Matter.Bodies.rectangle(
        Math.random() * (200 - 50) + 25,  // Random x from 25 to 175.
        -50,                            // Start above the canvas so it falls in.
        50,                             // width
        50,                             // height
        {
          render: { fillStyle: "#e74c3c" },
          restitution: 0.5,  // bounce factor, adjust as needed.
        }
      );
      Matter.World.add(engine.world, square);
    };

    // Set an interval to add one red square every second.
    const intervalId = setInterval(createSquare, 1000);

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

  // No additional container is needed; we simply return the canvas holder.
  return <div ref={sceneRef} style={{ width: 200, height: 200 }} />;
};

export default TestMatter;
