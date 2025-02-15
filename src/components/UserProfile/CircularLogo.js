import React, { useEffect, useRef } from 'react';

const CircularLogo = ({
  did = "did:plc:gq4fo3u6tqzzdkjlwzpb23tj",
  logoSrc = "/credbluebadge.png",
  size = 250,
  textGap = 10,
  fontSize = 21,
  viewBoxPadding = 20,
  gapDegrees = 3 // Gap in degrees between text start/end
}) => {
  const text = `${did}`;
  const textGroupRef = useRef(null);

  // Calculate dimensions based on content
  const logoSize = size * 0.4;
  const textRadius = (logoSize / 2) + textGap;
  const contentSize = (textRadius + fontSize) * 2;
  const viewBoxSize = contentSize + (viewBoxPadding * 2);
  const center = viewBoxSize / 2;

  // Calculate circumference and text length
  const circumference = 2 * Math.PI * textRadius;
  const gapSize = (gapDegrees / 360) * circumference; // Size of gap in pixels
  const textLength = circumference - gapSize; // Available space for text

  useEffect(() => {
    if (textGroupRef.current) {
      let rotation = 0;
      let animationFrameId;

      const animate = () => {
        rotation = (rotation - 0.2) % 360;
        if (textGroupRef.current) {
          textGroupRef.current.style.transform = `rotate(${rotation}deg)`;
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, []);

  return (
    <div className="circular-badge">
      <svg
        width={viewBoxSize}
        height={viewBoxSize}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="relative"
      >
        {/* Group for rotating text */}
        <g ref={textGroupRef} style={{ transformOrigin: 'center' }}>
          <defs>
            <path
              id="circlePath"
              d={`
                M ${center}, ${center - textRadius}
                a ${textRadius},${textRadius} 0 1,1 0,${textRadius * 2}
                a ${textRadius},${textRadius} 0 1,1 0,-${textRadius * 2}
              `}
              fill="none"
            />
          </defs>
          <text className="circular-logo-text" fontSize={fontSize}>
            <textPath
              href="#circlePath"
              spacing="auto"
              startOffset={`${(gapDegrees / 2)}%`}
              textLength={textLength}
              lengthAdjust="spacing"
            >
              {text}
            </textPath>
          </text>
        </g>

        {/* Center circle for logo - outside the rotating group */}
        <image
          x={center - (logoSize / 2)}
          y={center - (logoSize / 2)}
          width={logoSize}
          height={logoSize}
          href={logoSrc}
          className="rounded-full"
        />
      </svg>
    </div>
  );
};

export default CircularLogo;