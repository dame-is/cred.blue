import React, { useEffect, useRef } from 'react';

const CircularLogo = ({ 
  did = "did:plc:gq4fo3u6tqzzdkjlwzpb23tj",
  logoSrc = "/api/placeholder/100/100",
  size = 200,
  textColor = "#333333"
}) => {
  // Format the DID with bullet points for better spacing
  const text = `${did}  `;
  const textGroupRef = useRef(null);
  const logoSize = size * 0.4;
  const radius = (size / 2) - 20;
  
  // Repeat text to ensure full coverage
  const repeatedText = text.repeat(2);  // We need fewer repeats with this approach

  useEffect(() => {
    if (textGroupRef.current) {
      let rotation = 0;
      let animationFrameId;
      
      const animate = () => {
        rotation = (rotation - 0.2) % 360;  // Negative for clockwise rotation
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
              d={`M ${size/2}, ${size/2} m -${radius}, 0 a ${radius},${radius} 0 1,1 ${radius*2},0 a ${radius},${radius} 0 1,1 -${radius*2},0`}
              fill="none"
            />
          </defs>

          <text fill={textColor} fontSize="16">
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