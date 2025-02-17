import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { AccountDataContext } from "../UserProfile";

const COLORS = {
  bluesky: ['#0066cc', '#0077ee', '#0088ff', '#0099ff'],
  atproto: ['#006633', '#007744', '#008855', '#009966']
};

const formatScore = (score) => Math.round(score);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Helper function to format object details
    const formatDetails = (details) => {
      if (!details) return null;
      return Object.entries(details).map(([key, value]) => {
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          return Object.entries(value).map(([subKey, subValue]) => (
            <p key={`${key}-${subKey}`} className="text-sm">
              {subKey.replace(/([A-Z])/g, ' $1').trim()}: {
                typeof subValue === 'number' ? 
                  subValue.toFixed(1) : 
                  subValue.toString()
              }
            </p>
          ));
        }
        return (
          <p key={key} className="text-sm">
            {key.replace(/([A-Z])/g, ' $1').trim()}: {
              typeof value === 'number' ? 
                value.toFixed(1) : 
                value.toString()
            }
          </p>
        );
      });
    };

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
                {formatDetails(data.details)}
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
            stroke: depth === 1 ? 'none' : '#fff',
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
    'Profile Quality': 'Score based on profile completeness, alt text usage, and custom domain (25% of Bluesky score)',
    'Community Engagement': 'Score based on social graph metrics and engagement rates (35% of Bluesky score)',
    'Content & Activity': 'Score based on posting frequency and content diversity (25% of Bluesky score)',
    'Recognition & Status': 'Score based on account age and social standing (15% of Bluesky score)',
    
    'Decentralization': 'Score based on PDS choice and identity management (45% of Atproto score)',
    'Protocol Activity': 'Score based on non-Bluesky protocol usage (35% of Atproto score)',
    'Account Maturity': 'Score based on account age and ecosystem contributions (20% of Atproto score)'
  };
  return descriptions[category] || '';
};

const ScoreBreakdownCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading score breakdown...</div>;
  }

  const { blueskyCategories, atprotoCategories, blueskyScore, atprotoScore, combinedScore } = accountData;
  const blueskyPercent = (blueskyScore / combinedScore * 100).toFixed(1);
  const atprotoPercent = (atprotoScore / combinedScore * 100).toFixed(1);

  const buildTreemapData = () => {
    const data = [
      {
        name: 'Bluesky Score',
        children: Object.entries(blueskyCategories || {}).map(([name, category]) => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          size: category.score || 0,
          weight: (category.weight || 0) * 100,
          tooltipInfo: true,
          description: getScoreDescriptions(name.replace(/([A-Z])/g, ' $1').trim()),
          details: category
        })),
        colors: COLORS.bluesky
      },
      {
        name: 'ATProto Score',
        children: Object.entries(atprotoCategories || {}).map(([name, category]) => ({
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          size: category.score || 0,
          weight: (category.weight || 0) * 100,
          tooltipInfo: true,
          description: getScoreDescriptions(name.replace(/([A-Z])/g, ' $1').trim()),
          details: category
        })),
        colors: COLORS.atproto
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
            <span className="font-medium text-blue-600">Bluesky: </span>
            <span>{formatScore(blueskyScore)} ({blueskyPercent}%)</span>
          </div>
          <div>
            <span className="font-medium text-green-600">ATProto: </span>
            <span>{formatScore(atprotoScore)} ({atprotoPercent}%)</span>
          </div>
        </div>
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <Treemap
            data={buildTreemapData()}
            dataKey="size"
            aspectRatio={4/3}
            stroke="#fff"
            content={<CustomizedContent colors={COLORS.bluesky} />}
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