import React, { useEffect, useRef } from 'react';

const CircularLogo = ({
  did = "did:plc:gq4fo3u6tqzzdkjlwzpb23tj",
  logoSrc = "/credbluebadge.png",
  size = 200,
  textColor = "#004f84",
  textGap = 5,  // New prop to control space between logo and text
  fontSize = 16   // New prop to control text size
}) => {
  const text = `${did} `;
  const textGroupRef = useRef(null);
  
  // Adjust logo and text positioning calculations
  const logoSize = size * 0.4;
  const textRadius = (logoSize / 2) + textGap;  // Text radius is now based on logo size plus gap
  
  // Repeat text to ensure full coverage
  const repeatedText = text.repeat(2);

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
    <div className="relative w-full flex justify-center items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative"
      >
        {/* Group for rotating text */}
        <g ref={textGroupRef} style={{ transformOrigin: 'center' }}>
          <defs>
            <path
              id="circlePath"
              d={`
                M ${size/2}, ${(size/2) - textRadius}
                a ${textRadius},${textRadius} 0 1,1 0,${textRadius * 2}
                a ${textRadius},${textRadius} 0 1,1 0,-${textRadius * 2}
              `}
              fill="none"
            />
          </defs>
          
          <text fill={textColor} fontSize={fontSize}>
            <textPath
              href="#circlePath"
              spacing="auto"
              startOffset="0"
            >
              {repeatedText}
            </textPath>
          </text>
        </g>

        {/* Center circle for logo - outside the rotating group */}
        <image
          x={(size - logoSize) / 2}
          y={(size - logoSize) / 2}
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