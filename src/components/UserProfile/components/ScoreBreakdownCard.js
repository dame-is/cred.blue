import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { AccountDataContext } from "../UserProfile";

const COLORS = {
  'Bluesky Score': '#66b2ff',
  'ATProto Score': '#0056b3'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const parentScore = data.parent?.size || 0;
    const percentage = parentScore > 0 ? ((data.size / parentScore) * 100).toFixed(1) : 0;
    
    return (
      <div className="custom-tooltip bg-white p-4 rounded shadow-lg border border-gray-200 max-w-md">
        <p className="font-semibold text-lg mb-2">{data.name}</p>
        {data.tooltipInfo && (
          <>
            <p className="text-sm mb-1">Percentage: {percentage}%</p>
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
    const { root, depth, x, y, width, height, name, colors } = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[name] || '#ffffff20' : '#ffffff20',
            stroke: '#fff',
            strokeWidth: 3,
            strokeOpacity: 1,
            cursor: 'pointer',
          }}
        />
        {/* Removed text overlay */}
      </g>
    );
  }
}

const ScoreLegend = ({ blueskyScore, atprotoScore, combinedScore }) => {
  const blueskyPercent = ((blueskyScore / combinedScore) * 100).toFixed(1);
  const atprotoPercent = ((atprotoScore / combinedScore) * 100).toFixed(1);

  return (
    <div className="flex justify-center items-center gap-8 mt-6 border-t pt-4">
      <div className="flex items-center">
        <div className="w-6 h-6 mr-3 rounded" style={{ backgroundColor: COLORS['Bluesky Score'] }}></div>
        <span className="text-sm font-medium">Bluesky Score: {blueskyPercent}%</span>
      </div>
      <div className="flex items-center">
        <div className="w-6 h-6 mr-3 rounded" style={{ backgroundColor: COLORS['ATProto Score'] }}></div>
        <span className="text-sm font-medium">ATProto Score: {atprotoPercent}%</span>
      </div>
    </div>
  );
};

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
          details: {...category.details},
          parent: { name: 'Bluesky Score', size: blueskyScore }
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
          details: {...category.details},
          parent: { name: 'ATProto Score', size: atprotoScore }
        }))
      }
    ];
    return data;
  };

  return (
    <div className="w-full h-full min-h-[400px] p-4 bg-white rounded-lg shadow">
      <div className="score-breakdown-card" style={{ width: '100%', height: 350 }}>
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
              />
            )}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      
      <ScoreLegend 
        blueskyScore={blueskyScore}
        atprotoScore={atprotoScore}
        combinedScore={combinedScore}
      />
      
      <div className="text-sm text-gray-500 text-center mt-4">
        Hover over sections to see detailed breakdowns
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;