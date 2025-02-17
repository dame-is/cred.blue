import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AccountDataContext } from "../UserProfile";

const COLORS = {
  'Bluesky Score': '#66b2ff',
  'ATProto Score': '#0056b3'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    console.log('Tooltip data:', data); // Debug log
    
    // Calculate percentage of the total parent score (Bluesky or ATProto)
    let percentage;
    if (data.parent) {
      percentage = ((data.size / data.parent.size) * 100).toFixed(1);
    }
    
    return (
      <div className="custom-tooltip bg-white p-4 rounded shadow-lg border border-gray-200 max-w-md">
        <p className="font-semibold text-lg mb-2">{data.name}</p>
        {percentage && (
          <p className="text-sm text-gray-700 mb-2">
            {percentage}% of {data.parent.name}
          </p>
        )}
        {data.description && (
          <p className="text-sm text-gray-600">{data.description}</p>
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

// Format legend value to include percentage
const formatLegendValue = (value, entry) => {
  const { payload } = entry;
  if (payload && payload.size && entry.color) {
    const percentage = ((payload.size / (payload.size + payload.parent?.size || 0)) * 100).toFixed(1);
    return `${value}: ${percentage}%`;
  }
  return value;
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
    const formatCategoryName = (name) => {
      // First, handle camelCase to space separation
      const spacedName = name.replace(/([A-Z])/g, ' $1').trim();
      // Then capitalize the first letter of each word
      const capitalizedName = spacedName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Handle special cases with &
      const specialCases = {
        'Content Activity': 'Content & Activity',
        'Recognition Status': 'Recognition & Status'
      };
      
      return specialCases[capitalizedName] || capitalizedName;
    };

    const buildCategoryChildren = (categories, parentScore) => {
      return Object.entries(categories).map(([name, categoryData]) => {
        const formattedName = formatCategoryName(name);
        const rawScore = categoryData.score || 0;
        
        // Calculate subcategory scores if they exist
        let subScores = [];
        if (categoryData.details) {
          Object.entries(categoryData.details).forEach(([subName, subValue]) => {
            let subScore;
            if (typeof subValue === 'number') {
              subScore = subValue;
            } else if (typeof subValue === 'object') {
              subScore = Object.values(subValue)
                .filter(val => typeof val === 'number')
                .reduce((sum, val) => sum + val, 0);
            }
            
            if (subScore && subScore > 0) {
              subScores.push({
                name: formatCategoryName(subName),
                size: subScore,
                tooltipInfo: true,
                parent: { 
                  name: formattedName, 
                  size: rawScore 
                }
              });
            }
          });
        }
        
        return {
          name: formattedName,
          size: rawScore,
          tooltipInfo: true,
          description: getScoreDescriptions(formattedName),
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
            <Legend
              verticalAlign="bottom"
              align="center"
              height={36}
              formatter={formatLegendValue}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
      
      <div className="text-sm text-gray-500 text-center mt-4">
        Hover over sections to see detailed breakdowns
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;