import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';
import { AccountDataContext } from "../UserProfile";

const COLORS = ['#0056b3', '#003366'];

class CustomizedContent extends PureComponent {
  render() {
    const { root, depth, x, y, width, height, index, name, value } = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? COLORS[Math.floor((index / root.children.length) * 2)] : '#ffffff20',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            style={{ pointerEvents: 'none' }}
          >
            {name}
            <tspan x={x + width / 2} y={y + height / 2 + 20}>
              {Math.round(value)}
            </tspan>
          </text>
        )}
      </g>
    );
  }
}

const ScoreBreakdownCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading score breakdown...</div>;
  }

  const data = [
    {
      name: 'Bluesky Score',
      children: [
        { name: 'Posts', size: accountData.blueskyScore * 0.4 },
        { name: 'Engagement', size: accountData.blueskyScore * 0.3 },
        { name: 'Profile', size: accountData.blueskyScore * 0.2 },
        { name: 'Alt Text', size: accountData.blueskyScore * 0.1 },
      ],
    },
    {
      name: 'ATProto Score',
      children: [
        { name: 'Collections', size: accountData.atprotoScore * 0.35 },
        { name: 'Security', size: accountData.atprotoScore * 0.25 },
        { name: 'Domain', size: accountData.atprotoScore * 0.25 },
        { name: 'PDS', size: accountData.atprotoScore * 0.15 },
      ],
    },
  ];

  return (
    <div className="w-full h-full min-h-[400px] p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">
          Total Score: {accountData.combinedScore}
        </div>
        <div className="flex space-x-4">
          <div>
            <span className="font-medium">Bluesky: </span>
            {accountData.blueskyScore}
          </div>
          <div>
            <span className="font-medium">ATProto: </span>
            {accountData.atprotoScore}
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <Treemap
            data={data}
            dataKey="size"
            aspectRatio={4/3}
            stroke="#fff"
            fill="#0056b3"
            content={<CustomizedContent />}
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;