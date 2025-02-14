import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RADIAN = Math.PI / 180;
const MAX_SCORE = 1000;

const ScoreGauge = ({ score }) => {
  // Create four equal sections
  const data = [
    { name: 'Q1', value: 25, color: '#0056b3' },
    { name: 'Q2', value: 25, color: '#0066cc' },
    { name: 'Q3', value: 25, color: '#3399ff' },
    { name: 'Q4', value: 25, color: '#66b2ff' },
  ];

  const cx = 200;
  const cy = 200;
  const iR = 50;
  const oR = 150;

  const needle = (value, data, cx, cy, iR, oR, color) => {
    const total = MAX_SCORE;
    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 2.5;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 8;
    const x0 = cx + 5;
    const y0 = cy + 5;
    const xba = x0 + r * sin;
    const yba = y0 - r * cos;
    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;
    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return (
      <g filter="url(#dropShadow)">
        <circle cx={x0} cy={y0} r={r} fill={color} stroke="none" />
        <path
          d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
          stroke="none"
          fill={color}
        />
      </g>
    );
  };

  return (
    <div className="score-gauge" style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <defs>
            <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="1" dy="1" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
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
      </ResponsiveContainer>
      <div className="text-center font-semibold mt-2">
        {score} / {MAX_SCORE}
      </div>
    </div>
  );
};

export default ScoreGauge;