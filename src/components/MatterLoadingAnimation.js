// src/components/MatterLoadingAnimation.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import Matter from "matter-js";
import "./MatterLoadingAnimation.css";

const MatterLoadingAnimation = () => {
  const sceneRef = useRef(null);
  const timeoutRef = useRef(null); // For circle appearance
  const gravityTimerRef = useRef(null); // For dynamic gravity
  const messageTimeoutRef = useRef(null); // For updating the message

// Wrap messages in useMemo so they don't change on every render.
const messages = useMemo(
    () => [
      "Counting total posts",
      "Calculating posts per day",
      "Measuring replies per day",
      "Estimating reply percentages",
      "Tracking repost activity",
      "Differentiating self-reposts from reposts of others",
      "Counting posts with images",
      "Measuring image posts per day",
      "Calculating posts with alt text",
      "Determining posts without alt text",
      "Highlighting text-only posts",
      "Comparing text posts to media posts",
      "Measuring posts containing mentions",
      "Tracking posts with links",
      "Assessing posts with video content",
      "Calculating engagement metrics",
      "Determining posting style",
      "Identifying social interactions",
      "Analyzing social status trends",
      "Calculating total collections",
      "Differentiating Bluesky and Atproto collections",
      "Comparing records per day",
      "Tracking Bluesky record percentages",
      "Calculating account age in days",
      "Measuring posts per account age",
      "Estimating blobs per post",
      "Evaluating profile completion",
      "Analyzing follower-to-following ratios",
      "Compiling narrative insights",
      "Detecting log operations",
      "Analyzing handle history",
      "Tracking recent profile edits",
      "Identifying active aliases",
      "Calculating domain uniqueness",
      "Generating Bluesky scores",
      "Calculating Atproto scores",
      "Evaluating combined credibility scores",
    ],
    []
  );
  

  // State to hold the current message.
  const [message, setMessage] = useState("Loading account data");
  // State to control the fade effect.
  const [fade, setFade] = useState(false);
  const [circleCount, setCircleCount] = useState(0); // Track circle count
  const [specialCircleCount, setSpecialCircleCount] = useState(0); // Special circle count


  // Update the message on a random interval between 4 and 10 seconds.
  useEffect(() => {
    const updateMessage = () => {
      // Random delay between 4000ms and 10000ms.
      const delay = Math.random() * (10000 - 1000) + 4000;
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

        // Determine if the circle will be special.
        const isSpecial = Math.random() < 0.05; // 1 in 100 chance
        const specialFill = "#FFD700"; // Gold color for special circles
        const specialStroke = "#FFA500"; // Orange stroke for special circles

              // Increment special circle count if the circle is special.
            if (isSpecial) {
                setSpecialCircleCount((prev) => prev + 1);
            }
      
      // Create the circle at the random position, with the tiny initial radius.
      const circle = Matter.Bodies.circle(
        xPos,
        yPos,
        initialRadius,
        {
          render: { 
            fillStyle: isSpecial ? specialFill : circleFill,
            strokeStyle: isSpecial ? specialStroke : circleStroke,
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
      className={
        'loading-container-1'
      }
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
    <div className="loading-text-container">
      <p className={`loading-text ${fade ? "fade" : ""}`} style={{ marginTop: "20px", fontSize: "1em" }}>
      {message}<span className="dots"></span>
      </p>
      <div className="circle-counters">
        <div className="counter-item">
          <div className="legend-circle regular-circle" />
          <p className="counter-item-regular">{circleCount}</p>
        </div>
        <div className="counter-item">
          <div className="legend-circle special-circle" />
          <p className="counter-item-special">{specialCircleCount}</p>
        </div>
      </div>
        <div className="version-number">
          <p>cred.blue v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default MatterLoadingAnimation;
