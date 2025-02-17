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
    
    // Calculate percentage of the total parent score (Bluesky or ATProto)
    let percentage;
    if (data.parent) {
      percentage = ((data.size / data.parent.size) * 100).toFixed(1);
    }
    
    return (
      <div className="custom-tooltip bg-white p-4 rounded shadow-lg border border-gray-200 max-w-md">
        <p className="font-semibold text-lg mb-2">{data.name}</p>
        {data.tooltipInfo && data.parent && (
          <>
            <p className="text-sm text-gray-700 mb-2">
              {percentage}% of {data.parent.name}
            </p>
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
    const { root, depth, x, y, width, height, name, colors } = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth === 1 ? colors[name] || '#ffffff20' : 
                  depth === 2 ? colors[root.name] || '#ffffff20' : '#ffffff20',
            fillOpacity: depth === 2 ? 0.7 : 1,
            stroke: '#fff',
            strokeWidth: 3,
            strokeOpacity: 1,
            cursor: 'pointer',
          }}
        />
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
    'Profile Quality': 'Profile completeness, alt text usage, and custom domain',
    'Community Engagement': 'Social graph metrics, engagement rates, and reply activity',
    'Content & Activity': 'Posts, collections, and content quality including labels',
    'Recognition & Status': 'Team membership, contributor status, and social standing',
    'Decentralization': 'PDS choice, rotation keys, DID type, and domain customization',
    'Protocol Activity': 'Non-Bluesky collections and general protocol usage',
    'Account Maturity': 'Account age and ecosystem contributions'
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
    const buildCategoryChildren = (categories, parentScore) => {
      return Object.entries(categories).map(([name, categoryData]) => {
        // Get the raw score from the category
        const rawScore = categoryData.score || 0;
        
        // Calculate subcategory scores if they exist
        let subScores = [];
        if (categoryData.details) {
          Object.entries(categoryData.details).forEach(([subName, subValue]) => {
            // Handle different types of subValues
            let subScore;
            if (typeof subValue === 'number') {
              subScore = subValue;
            } else if (typeof subValue === 'object') {
              // Sum up numeric values in the object
              subScore = Object.values(subValue)
                .filter(val => typeof val === 'number')
                .reduce((sum, val) => sum + val, 0);
            }
            
            if (subScore && subScore > 0) {
              subScores.push({
                name: subName.replace(/([A-Z])/g, ' $1').trim(),
                size: subScore,
                tooltipInfo: true,
                parent: { 
                  name: name.replace(/([A-Z])/g, ' $1').trim(), 
                  size: rawScore 
                }
              });
            }
          });
        }
        
        return {
          name: name.replace(/([A-Z])/g, ' $1').trim(),
          size: rawScore,
          tooltipInfo: true,
          description: getScoreDescriptions(name.replace(/([A-Z])/g, ' $1').trim()),
          parent: { name: parentScore.name, size: parentScore.size },
          children: subScores.length > 0 ? subScores : undefined
        };
      });
    };

    const data = [
      {
        name: 'Bluesky Score',
        size: blueskyScore,
        colors: COLORS,
        children: buildCategoryChildren(breakdown.blueskyCategories, { name: 'Bluesky Score', size: blueskyScore })
      },
      {
        name: 'ATProto Score',
        size: atprotoScore,
        colors: COLORS,
        children: buildCategoryChildren(breakdown.atprotoCategories, { name: 'ATProto Score', size: atprotoScore })
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