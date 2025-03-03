import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const RADIAN = Math.PI / 180;
const MAX_SCORE = 1000;

const ScoreGauge = ({ score, shadowColor = 'rgba(150,127,0,0.74)' }) => {
  const data = [
    { name: 'Q1', value: 15, color: '#004F84' },
    { name: 'Q2', value: 15, color: '#1368AA' },
    { name: 'Q3', value: 40, color: '#2881D2' },
    { name: 'Q4', value: 30, color: '#3B9AF8' },
  ];

  // Adjusted dimensions to match actual gauge size
  const width = 300;
  const height = 150;
  const cx = width / 2;
  const cy = height - 45; // Adjust center point to bottom half
  const iR = 50;
  const oR = 100;

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
        <path
          d={`
            M ${xba} ${yba}
            L ${xbb} ${ybb}
            L ${xp} ${yp}
            L ${xba} ${yba}
            Z
            M ${x0} ${y0}
            m -${r}, 0
            a ${r},${r} 0 1,0 ${r*2},0
            a ${r},${r} 0 1,0 -${r*2},0
          `}
          fill={color}
          stroke="none"
          pointerEvents="none"
          tabIndex="-1"
          aria-hidden="true"
        />
      </g>
    );
  };

  return (
    <div
      className="score-gauge"
      style={{
        width: '100%',
        maxWidth: '300px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
      role="img"
      aria-label={`Score gauge showing ${score} out of ${MAX_SCORE}`}
    >
      <PieChart 
        width={width} 
        height={height}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="dropShadow">
            <feDropShadow
              dx="1"
              dy="2"
              stdDeviation="0"
              floodColor={shadowColor}
              floodOpacity="1"
            />
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
          isAnimationActive={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
            />
          ))}
        </Pie>
        {needle(score, data, cx, cy, iR, oR, '#FFD700')}
      </PieChart>
      <div className="text-center font-semibold mt-2">
        <strong>{score}</strong> <div className="max-score">/ {MAX_SCORE}</div>
      </div>
    </div>
  );
};

export default ScoreGauge;