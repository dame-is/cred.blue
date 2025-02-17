import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { AccountDataContext } from "../UserProfile";

const COLORS = ['#0056b3', '#003366'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white p-2 rounded shadow-lg border border-gray-200">
        <p className="font-semibold">{data.name}</p>
        {data.tooltipInfo && (
          <>
            <p className="text-sm">Score: {Math.round(data.size)}</p>
            <p className="text-sm">Weight: {data.weight}%</p>
            {data.description && (
              <p className="text-sm text-gray-600">{data.description}</p>
            )}
          </>
        )}
      </div>
    );
  }
  return null;
};

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
            cursor: 'pointer'
          }}
        />
        {depth === 1 && width > 50 && height > 30 && (
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

const getScoreDescriptions = (category) => {
  const descriptions = {
    Posts: "Score based on post frequency, quality, and engagement",
    Engagement: "Score based on likes, reposts, and replies",
    Profile: "Score based on profile completeness and activity",
    "Alt Text": "Score based on image accessibility",
    Collections: "Score based on custom feed curation",
    Security: "Score based on account security measures",
    Domain: "Score based on handle and domain setup",
    PDS: "Score based on server reliability and performance"
  };
  return descriptions[category] || "";
};

const ScoreBreakdownCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading score breakdown...</div>;
  }

  const blueskyPercent = (accountData.blueskyScore / accountData.combinedScore * 100).toFixed(1);
  const atprotoPercent = (accountData.atprotoScore / accountData.combinedScore * 100).toFixed(1);

  const data = [
    {
      name: 'Bluesky Score',
      children: [
        { 
          name: 'Posts',
          size: accountData.blueskyScore * 0.4,
          weight: 40,
          tooltipInfo: true,
          description: getScoreDescriptions('Posts')
        },
        { 
          name: 'Engagement',
          size: accountData.blueskyScore * 0.3,
          weight: 30,
          tooltipInfo: true,
          description: getScoreDescriptions('Engagement')
        },
        { 
          name: 'Profile',
          size: accountData.blueskyScore * 0.2,
          weight: 20,
          tooltipInfo: true,
          description: getScoreDescriptions('Profile')
        },
        { 
          name: 'Alt Text',
          size: accountData.blueskyScore * 0.1,
          weight: 10,
          tooltipInfo: true,
          description: getScoreDescriptions('Alt Text')
        },
      ],
    },
    {
      name: 'ATProto Score',
      children: [
        { 
          name: 'Collections',
          size: accountData.atprotoScore * 0.35,
          weight: 35,
          tooltipInfo: true,
          description: getScoreDescriptions('Collections')
        },
        { 
          name: 'Security',
          size: accountData.atprotoScore * 0.25,
          weight: 25,
          tooltipInfo: true,
          description: getScoreDescriptions('Security')
        },
        { 
          name: 'Domain',
          size: accountData.atprotoScore * 0.25,
          weight: 25,
          tooltipInfo: true,
          description: getScoreDescriptions('Domain')
        },
        { 
          name: 'PDS',
          size: accountData.atprotoScore * 0.15,
          weight: 15,
          tooltipInfo: true,
          description: getScoreDescriptions('PDS')
        },
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
            {blueskyPercent}%
          </div>
          <div>
            <span className="font-medium">ATProto: </span>
            {atprotoPercent}%
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
          >
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;