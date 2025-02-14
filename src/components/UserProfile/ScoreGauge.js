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

  const needle = (value, cx, cy, iR, oR, color) => {
    const total = MAX_SCORE;
    const ang = 180.0 * (1 - value / total);
    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);
    const r = 5;
    const x0 = cx + 5;
    const y0 = cy + 5;
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

  // Custom rendering function for the pie chart that includes the needle
  const renderPieChart = ({ width, height }) => {
    const cx = width / 2;
    const cy = height / 2;
    const iR = Math.min(width, height) * 0.15; // 15% of minimum dimension
    const oR = Math.min(width, height) * 0.4;  // 40% of minimum dimension

    return (
      <PieChart width={width} height={height}>
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
        {needle(score, cx, cy, iR, oR, '#FFD700')}
      </PieChart>
    );
  };

  return (
    <div className="w-full">
      <div className="w-full" style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderPieChart}
        </ResponsiveContainer>
      </div>
      <div className="text-center font-semibold mt-2">
        Score: {score} / {MAX_SCORE}
      </div>
    </div>
  );
};

export default ScoreGauge;