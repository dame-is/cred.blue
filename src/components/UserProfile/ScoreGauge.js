import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RADIAN = Math.PI / 180;
const MAX_SCORE = 1000;

const ScoreGauge = ({ score }) => {
  const data = [
    { name: 'Q1', value: 25, color: '#0056b3' },
    { name: 'Q2', value: 25, color: '#0066cc' },
    { name: 'Q3', value: 25, color: '#3399ff' },
    { name: 'Q4', value: 25, color: '#66b2ff' },
  ];

  // Custom component to render the needle with proper pixel values
  const GaugeNeedle = ({ cx, cy, value }) => {
    if (typeof cx !== 'number' || typeof cy !== 'number') return null;

    const total = MAX_SCORE;
    const ang = 180.0 * (1 - value / total);
    const iR = Math.min(cx, cy) * 0.25;  // 25% of minimum dimension
    const oR = Math.min(cx, cy) * 0.8;   // 80% of minimum dimension
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx;
    const y0 = cy;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return [
      <circle key="needle-circle" cx={x0} cy={y0} r={r} fill="#FFD700" stroke="none" />,
      <path
        key="needle-path"
        d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
        stroke="none"
        fill="#FFD700"
      />,
    ];
  };

  return (
    <div className="flex flex-col items-center" style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="25%"
            outerRadius="80%"
            fill="#8884d8"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          {({ width, height }) => (
            <GaugeNeedle 
              cx={width / 2} 
              cy={height / 2} 
              value={score}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center font-semibold">
        Score: {score} / {MAX_SCORE}
      </div>
    </div>
  );
};

export default ScoreGauge;