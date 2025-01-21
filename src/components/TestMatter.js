// src/components/TestMatter.jsx
import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

const TestMatter = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    // Create engine and set gravity to zero for testing.
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0; // no gravity so we can focus on visibility

    // Create the renderer. Force pixelRatio: 1 for simplicity.
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 200,
        height: 200,
        background: "#f0f0f0",
        wireframes: false, // try false; if nothing, then test true below
        pixelRatio: 1,
      },
    });
    Matter.Render.run(render);

    // Create a runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Create a single rectangle so we can see it.
    const rect = Matter.Bodies.rectangle(100, 100, 50, 50, {
      render: { fillStyle: "#e74c3c" },
    });
    Matter.World.add(engine.world, rect);

    // Log the bodies.
    console.log(Matter.Composite.allBodies(engine.world));

    // Cleanup on unmount.
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return <div ref={sceneRef} style={{ width: 200, height: 200 }} />;
};

export default TestMatter;
