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

  const needle = (value, data, cx, cy, iR, oR, color) => {
    const total = MAX_SCORE;
    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx;  // Removed +5 offset
    const y0 = cy;  // Removed +5 offset
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
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
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
          {needle(score, data, '50%', '50%', '25%', '80%', '#FFD700')}
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center font-semibold mt-2">
        Score: {score} / {MAX_SCORE}
      </div>
    </div>
  );
};

export default ScoreGauge;