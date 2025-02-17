import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { AccountDataContext } from "../UserProfile";

const COLORS = {
  blueskyScore: '#66b2ff',
  atprotoScore: '#0056b3'
};

const formatScore = (score) => Math.round(score);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white p-4 rounded shadow-lg border border-gray-200 max-w-md">
        <p className="font-semibold text-lg mb-2">{data.name}</p>
        {data.tooltipInfo && (
          <>
            <p className="text-sm mb-1">Score: {formatScore(data.size)}</p>
            <p className="text-sm mb-2">Weight: {data.weight}%</p>
            {data.description && (
              <p className="text-sm text-gray-600 mb-2">{data.description}</p>
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
    const { root, depth, x, y, width, height, index, name, colors, totalValue } = this.props;
    const value = this.props.value;
    
    // Calculate percentage based on the total value of its parent
    const percentage = totalValue ? ((value / totalValue) * 100).toFixed(1) : 0;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[name.replace(/\s+/g, '')] : '#ffffff20',
            stroke: '#fff',
            strokeWidth: 1,
            strokeOpacity: 0.5,
            cursor: 'pointer',
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
            <tspan x={x + width / 2} y={y + height / 2 - 8}>
              {name}
            </tspan>
            <tspan x={x + width / 2} y={y + height / 2 + 12}>
              {percentage}%
            </tspan>
          </text>
        )}
      </g>
    );
  }
}

const getScoreDescriptions = (category) => {
  const descriptions = {
    'Profile Quality': 'Profile completeness, alt text usage, and custom domain (25% of Bluesky score)',
    'Community Engagement': 'Social graph metrics, engagement rates, and reply activity (35% of Bluesky score)',
    'Content & Activity': 'Posts, collections, and content quality including labels (25% of Bluesky score)',
    'Recognition & Status': 'Team membership, contributor status, and social standing (15% of Bluesky score)',
    'Decentralization': 'PDS choice, rotation keys, DID type, and domain customization (45% of Atproto score)',
    'Protocol Activity': 'Non-Bluesky collections and general protocol usage (35% of Atproto score)',
    'Account Maturity': 'Account age and ecosystem contributions (20% of Atproto score)'
  };
  return descriptions[category] || '';
};

const ScoreBreakdownCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData || !accountData.breakdown) {
    return <div>Loading score breakdown...</div>;
  }

  const { blueskyScore, atprotoScore, combinedScore, breakdown } = accountData;

  const buildTreemapData = () => {
    const data = [
      {
        name: 'Bluesky Score',
        colors: COLORS,
        size: blueskyScore,
        children: Object.entries(breakdown.blueskyCategories).map(([name, category]) => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          size: category.score,
          weight: category.weight * 100,
          tooltipInfo: true,
          description: getScoreDescriptions(name.replace(/([A-Z])/g, ' $1').trim()),
          details: {...category.details}
        }))
      },
      {
        name: 'ATProto Score',
        colors: COLORS,
        size: atprotoScore,
        children: Object.entries(breakdown.atprotoCategories).map(([name, category]) => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          size: category.score,
          weight: category.weight * 100,
          tooltipInfo: true,
          description: getScoreDescriptions(name.replace(/([A-Z])/g, ' $1').trim()),
          details: {...category.details}
        }))
      }
    ];
    return data;
  };

  return (
    <div className="w-full h-full min-h-[400px] p-4 bg-white rounded-lg shadow">
      <div className="rounded-lg overflow-hidden" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <Treemap
            data={buildTreemapData()}
            dataKey="size"
            aspectRatio={4/3}
            stroke="#fff"
            content={({ root, depth, x, y, width, height, index, name, value }) => (
              <CustomizedContent
                root={root}
                depth={depth}
                x={x}
                y={y}
                width={width}
                height={height}
                index={index}
                name={name}
                value={value}
                colors={COLORS}
                totalValue={combinedScore}
              />
            )}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Hover over sections to see detailed breakdowns
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;