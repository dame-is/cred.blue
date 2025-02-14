import React, { useRef, useEffect, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const RADIAN = Math.PI / 180;
const MAX_SCORE = 1000;

const ScoreGauge = ({ score }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });

  // Create four equal sections
  const data = [
    { name: 'Q1', value: 25, color: '#0056b3' },
    { name: 'Q2', value: 25, color: '#0066cc' },
    { name: 'Q3', value: 25, color: '#3399ff' },
    { name: 'Q4', value: 25, color: '#66b2ff' },
  ];

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Set the height to be proportional to the width
        const containerHeight = containerWidth * 0.6;
        setDimensions({
          width: containerWidth,
          height: containerHeight
        });
      }
    };

    // Initial update
    updateDimensions();

    // Add resize listener
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const calculateDimensions = () => {
    const cx = dimensions.width / 2;
    const cy = (dimensions.height * 0.8) / 2;
    const outerRadius = Math.min(cx, cy) * 0.8;
    const innerRadius = outerRadius * 0.4;

    return { cx, cy, innerRadius, outerRadius };
  };

  const { cx, cy, innerRadius: iR, outerRadius: oR } = calculateDimensions();

  const needle = (value, data, cx, cy, iR, oR, color) => {
    const total = MAX_SCORE;
    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = Math.max(3, dimensions.width / 60); // Responsive needle base size
    const x0 = cx;
    const y0 = cy;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return [
      <circle key="needle-circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
      <path
        key="needle-path"
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="none"
        fill={color}
      />,
    ];
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-lg mx-auto px-4"
    >
      <PieChart width={dimensions.width} height={dimensions.height}>
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={iR}
          outerRadius={oR}
          fill="#8884d8"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {needle(score, data, cx, cy, iR, oR, '#FFD700')}
      </PieChart>
      <div className="text-center font-semibold mt-2 text-base sm:text-lg">
        Score: {score} / {MAX_SCORE}
      </div>
    </div>
  );
};

export default ScoreGauge;