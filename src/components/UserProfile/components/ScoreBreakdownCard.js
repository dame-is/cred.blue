import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { AccountDataContext } from "../UserProfile";

// Updated color schemes
const COLORS = {
  bluesky: ['#66b2ff', '#85c2ff', '#a3d1ff', '#c2e0ff'],  // Base: #66b2ff with variations
  atproto: ['#0056b3', '#0066cc', '#0077e6', '#0088ff']   // Base: #0056b3 with variations
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
            {data.details && (
              <div className="mt-2 border-t pt-2">
                <p className="font-medium text-sm mb-1">Components:</p>
                {Object.entries(data.details).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    {key.replace(/([A-Z])/g, ' $1').trim()}: {formatScore(value)}
                  </p>
                ))}
              </div>
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
    const { root, depth, x, y, width, height, index, name, value, colors } = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[Math.floor((index / root.children.length) * colors.length)] : '#ffffff20',
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
              {formatScore(value)}
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
  const blueskyPercent = (blueskyScore / combinedScore * 100).toFixed(1);
  const atprotoPercent = (atprotoScore / combinedScore * 100).toFixed(1);

  const buildTreemapData = () => {
    const data = [
      {
        name: 'Bluesky Score',
        colors: COLORS.bluesky,
        children: Object.entries(breakdown.blueskyCategories).map(([name, category]) => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          size: category.score,
          weight: category.weight * 100,
          tooltipInfo: true,
          description: getScoreDescriptions(name.replace(/([A-Z])/g, ' $1').trim()),
          details: category.details
        }))
      },
      {
        name: 'ATProto Score',
        colors: COLORS.atproto,
        children: Object.entries(breakdown.atprotoCategories).map(([name, category]) => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          size: category.score,
          weight: category.weight * 100,
          tooltipInfo: true,
          description: getScoreDescriptions(name.replace(/([A-Z])/g, ' $1').trim()),
          details: category.details
        }))
      }
    ];
    return data;
  };

  return (
    <div className="w-full h-full min-h-[400px] p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-semibold">
          Combined Score: {formatScore(combinedScore)}
        </div>
        <div className="flex space-x-6">
          <div>
            <span className="font-medium" style={{ color: COLORS.bluesky[0] }}>Bluesky: </span>
            <span>{formatScore(blueskyScore)} ({blueskyPercent}%)</span>
          </div>
          <div>
            <span className="font-medium" style={{ color: COLORS.atproto[0] }}>ATProto: </span>
            <span>{formatScore(atprotoScore)} ({atprotoPercent}%)</span>
          </div>
        </div>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <Treemap
            data={buildTreemapData()}
            dataKey="size"
            aspectRatio={4/3}
            stroke="#fff"
            content={<CustomizedContent />}
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