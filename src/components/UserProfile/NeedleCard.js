// src/components/HealthScoreCard/HealthScoreCard.js
import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import './HealthScoreCard.css';

const RADIAN = Math.PI / 180;

// Define the zones with their corresponding colors and value ranges
const zones = [
  { name: 'Poor', value: 25, color: '#ff4d4f' },      // 0-25
  { name: 'Fair', value: 25, color: '#ffec3d' },      // 26-50
  { name: 'Good', value: 25, color: '#73d13d' },      // 51-75
  { name: 'Excellent', value: 25, color: '#40a9ff' }, // 76-100
];

// Function to calculate the needle position based on the score
const calculateNeedle = (score, cx, cy, innerRadius, outerRadius, color) => {
  const total = zones.reduce((acc, zone) => acc + zone.value, 0);
  const angle = 180 - (score / total) * 180; // Convert score to angle

  const length = innerRadius + (outerRadius - innerRadius) / 2;
  const sin = Math.sin(-RADIAN * angle);
  const cos = Math.cos(-RADIAN * angle);
  const r = 5; // Needle base radius

  const x0 = cx;
  const y0 = cy;
  const x1 = x0 + length * cos;
  const y1 = y0 + length * sin;
  const needleWidth = 4;

  // Calculate needle triangle points
  const xLeft = x0 - needleWidth * sin;
  const yLeft = y0 + needleWidth * cos;
  const xRight = x0 + needleWidth * sin;
  const yRight = y0 - needleWidth * cos;

  return (
    <g>
      <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />
      <path
        d={`M${xLeft} ${yLeft} L${xRight} ${yRight} L${x1} ${y1} Z`}
        fill={color}
      />
      {/* Optional: Add a center circle to cover the needle base */}
      <circle cx={x0} cy={y0} r={needleWidth} fill="#ffffff" stroke="none" />
    </g>
  );
};

const HealthScoreCard = ({ score }) => {
  // Ensure the score is within 0-100
  const validatedScore = Math.max(0, Math.min(score, 100));

  // Calculate total value for the pie chart
  const data = zones.map(zone => ({
    name: zone.name,
    value: zone.value,
    color: zone.color,
  }));

  const cx = 150;
  const cy = 200;
  const innerRadius = 50;
  const outerRadius = 100;

  return (
    <div className="health-score-card">
      <h2>Account Health Score</h2>
      <PieChart width={300} height={300}>
        <Pie
          data={data}
          dataKey="value"
          startAngle={180}
          endAngle={0}
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={0}
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {calculateNeedle(validatedScore, cx, cy, innerRadius, outerRadius, '#333')}
        {/* Optional: Add labels or additional decorations */}
      </PieChart>
      <div className="score-display">
        <span>{validatedScore}/100</span>
      </div>
    </div>
  );
};

export default HealthScoreCard;
