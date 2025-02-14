import React, { useEffect, useRef } from 'react';

const CircularLogo = ({
  did = "did:plc:gq4fo3u6tqzzdkjlwzpb23tj",
  logoSrc = "/credbluebadge.png",
  size = 200,
  textColor = "#004f84",
  textGap = 2,
  fontSize = 16,
  viewBoxPadding = 20
}) => {
  const text = `${did} `;
  const textGroupRef = useRef(null);
  
  // Calculate dimensions based on content
  const logoSize = size * 0.4;
  // Simplified radius calculation - directly from logo edge plus gap
  const textRadius = (logoSize / 2) + textGap;
  
  // Calculate total size needed for content
  const contentSize = (textRadius + fontSize) * 2;
  
  // Add padding to viewBox
  const viewBoxSize = contentSize + (viewBoxPadding * 2);
  const center = viewBoxSize / 2;
  
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