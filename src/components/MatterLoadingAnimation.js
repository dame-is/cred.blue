// src/components/TestMatter.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const TestMatter = () => {
  const sceneRef = useRef(null);
  const timeoutRef = useRef(null); // For circle appearance
  const gravityTimerRef = useRef(null); // For dynamic gravity
  const messageTimeoutRef = useRef(null); // For updating the message

  // Wrap messages in useMemo so they don't change on every render.
  const messages = useMemo(
    () => [
      "Loading account data",
      "Searching handle history",
      "Prepping analysis summary",
      "Constructing visualizations",
      "Gathering insights",
      "Analyzing post types and frequencies",
      "Fetching PLC logs",
      "Compiling engagement stats",
      "Detecting quote posts",
      "Calculating account age",
      "Generating Bluesky Score",
      "Creating Atproto Score",
      "Determining posting style",
      "Rewarding with badges"
    ],
    []
  );

  // State to hold the current message.
  const [message, setMessage] = useState("Loading account data");
  // State to control the fade effect.
  const [fade, setFade] = useState(false);
  const [circleCount, setCircleCount] = useState(0); // Track circle count


  // Update the message on a random interval between 4 and 10 seconds.
  useEffect(() => {
    const updateMessage = () => {
      // Random delay between 4000ms and 10000ms.
      const delay = Math.random() * (5000 - 2000) + 4000;
      messageTimeoutRef.current = setTimeout(() => {
        // Trigger fade-out.
        setFade(true);
        // After fade-out duration (300ms), update the message and fade back in.
        setTimeout(() => {
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setMessage(randomMessage);
          setFade(false);
        }, 300);
        updateMessage();
      }, delay);
    };
    updateMessage();
    return () => {
      clearTimeout(messageTimeoutRef.current);
    };
  }, [messages]);

  useEffect(() => {
    // Set the fixed dimensions for the canvas.
    const width = 250;
    const height = 250;

    // Create engine and set initial gravity.
    const engine = Matter.Engine.create();
    engine.world.gravity.scale = 0.001;
    // Start with base gravity values (we'll update these continuously).
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;

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
        pixelRatio: 'auto',
      },
    });
    Matter.Render.run(render);

    // Create and run the runner.
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Walls settings.
    const wallThickness = 6;
    const wallRenderOptions = {
      fillStyle: "#f0f0f000", // Custom fill (transparent in this case)
    };

    // Create walls with custom styling (top, bottom, left, and right).
    const walls = [
      // Top wall.
      Matter.Bodies.rectangle(
        width / 2,
        0,
        width,
        wallThickness,
        { isStatic: true, render: wallRenderOptions }
      ),
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

    // SETTINGS FOR OUR BLUE CIRCLES.
    const minRadius = 4;
    const maxRadius = 12;
    const growthDuration = 400; // milliseconds over which the circle grows

    // Get custom circle render styling from CSS variables.
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
      setCircleCount((prev) => prev + 1); // Increment circle count

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

    // Instead of a fixed interval, schedule the next circle appearance
    // randomly between 100 and 500 ms.
    const scheduleNextCircle = () => {
      const delay = Math.random() * (2500 - 500) + 100; // delay in ms between 100 and 500
      timeoutRef.current = setTimeout(() => {
        createCircle();
        scheduleNextCircle();
      }, delay);
    };
    scheduleNextCircle();

    // Now, update gravity dynamically to simulate water-like motion.
    // Define base values and amplitudes:
    const baseGravityX = 0;
    const amplitudeX = 0.008; // gravity.x will vary by ±0.008 around baseGravityX
    const baseGravityY = 0.001; // base vertical gravity
    const amplitudeY = 0.008;   // gravity.y will vary by ±0.008 around baseGravityY

    const updateGravity = () => {
      const t = performance.now() * 0.001; // convert time to seconds
      engine.world.gravity.x = baseGravityX + amplitudeX * Math.sin(t);
      engine.world.gravity.y = baseGravityY + amplitudeY * Math.cos(t);
    };

    // Update gravity approximately every 16 ms (~60fps).
    gravityTimerRef.current = setInterval(updateGravity, 16);

    // Cleanup on unmount.
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(gravityTimerRef.current);
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  // Render the fixed-size 250x250 canvas and center it with dynamic loading text.
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginLeft: "20px",
        marginRight: "20px",
        justifyContent: "center",
        minHeight: "80vh",
        background: "none"
      }}
    >
      <div
        ref={sceneRef}
        style={{
          boxSizing: "border-box",
        }}
      />
    <p className={`loading-text ${fade ? "fade" : ""}`} style={{ marginTop: "20px", fontSize: "1em" }}>
    {message}<span className="dots"></span>
    </p>
    <p style={{ fontSize: "1.2em", marginTop: "10px" }}>Circles Created: {circleCount}</p>
    </div>
  );
};

export default TestMatter;
