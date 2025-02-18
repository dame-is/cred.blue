import React, { useContext, PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AccountDataContext } from "../UserProfile";

const COLORS = {
  'Bluesky Score': '#66b2ff',
  'ATProto Score': '#004f84'
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
      const { root, depth, x, y, width, height, name = '', colors } = this.props;
  
      // Don't render anything for depth 1 (parent nodes)
      if (depth === 1) {
        return null;
      }
  
      // Calculate text metrics and determine if we should show text
      const shouldShowText = width > 40 && height > 25 && name;
      
      // Calculate font size based on container dimensions
      const calculateFontSize = () => {
        const baseSize = Math.min(width, height) / 8; // Adjust divisor to tune base font size
        return Math.min(Math.max(baseSize, 8), 14); // Clamp between 8px and 14px
      };
  
      // Function to split text into lines that fit
      const getWrappedText = () => {
        if (!name) return [];
        
        const words = name.split(' ');
        const fontSize = calculateFontSize();
        const maxWidth = width - 10; // Leave some padding
        const charWidth = fontSize * 0.6; // Approximate character width
        const maxCharsPerLine = Math.floor(maxWidth / charWidth);
        
        let lines = [];
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (testLine.length * charWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        });
        if (currentLine) lines.push(currentLine);
        
        // Limit to 2 lines maximum
        return lines.slice(0, 2);
      };
  
      return (
        <g>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: colors[root.name] || '#ffffff20',
              fillOpacity: 0.7,
              stroke: '#fff',
              strokeWidth: 6,
              strokeOpacity: 1,
              rx: 10,
              ry: 10,
              cursor: 'pointer',
            }}
          />
          {shouldShowText && (
            <g>
              {getWrappedText().map((line, index, array) => {
                const fontSize = calculateFontSize();
                const lineHeight = fontSize * 1.2;
                const totalHeight = array.length * lineHeight;
                const startY = y + (height - totalHeight) / 2 + lineHeight / 2;
                
                return (
                  <text
                    key={index}
                    x={x + width / 2}
                    y={startY + index * lineHeight}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fill: 'white',
                      fontSize: `${fontSize}px`,
                      strokeWidth: 0,
                      fontFamily: 'articulat-cf',
                      fontWeight: 600,
                      paddingLeft: 5,
                      paddingRight: 5,
                    }}
                  >
                    {line}
                  </text>
                );
              })}
            </g>
          )}
        </g>
      );
    }
  }

const getScoreDescriptions = (category) => {
  const descriptions = {
    'Profile Quality': 'Profile completeness, alt text usage, domain, etc',
    'Community Engagement': 'Social graph, engagement, reply activity, etc',
    'Content & Activity': 'Posts, collections, content quality, etc',
    'Recognition & Status': 'Team membership, contributor status, social standing, etc',
    'Decentralization': 'PDS, rotation keys, DID type, etc',
    'Protocol Activity': 'Collections and general protocol usage',
    'Account Maturity': 'Account age and ecosystem contributions'
  };
  return descriptions[category] || '';
};

const ScoreBreakdownCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData || !accountData.breakdown) {
    return <div>Loading score breakdown...</div>;
  }

  const { blueskyScore, atprotoScore, breakdown } = accountData;

  const buildTreemapData = () => {
    const formatCategoryName = (name) => {
      const spacedName = name.replace(/([A-Z])/g, ' $1').trim();
      const capitalizedName = spacedName.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
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
                fill: COLORS[parentScore.name],
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
          fill: COLORS[parentScore.name],
          description: getScoreDescriptions(formattedName),
          parent: { name: parentScore.name, size: parentScore.size },
          children: subScores.length > 0 ? subScores : undefined
        };
      });
    };

    return [
      {
        name: 'Bluesky Score',
        size: blueskyScore,
        fill: COLORS['Bluesky Score'],
        children: buildCategoryChildren(breakdown.blueskyCategories, { name: 'Bluesky Score', size: blueskyScore })
      },
      {
        name: 'ATProto Score',
        size: atprotoScore,
        fill: COLORS['ATProto Score'],
        children: buildCategoryChildren(breakdown.atprotoCategories, { name: 'ATProto Score', size: atprotoScore })
      }
    ];
  };

  return (
    <div className="w-full h-full min-h-[400px] p-4 bg-white rounded-lg shadow">
      <div className="score-breakdown-card" style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <Treemap
            data={buildTreemapData()}
            dataKey="size"
            aspectRatio={4/3}
            stroke="#fff"
            radius={20}
            isAnimationActive={false}  // Turn off animation
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
                iconType="rect"
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                    paddingTop: '20px'
                }}
                formatter={(value) => (
                    <span style={{ 
                    fill: 'white', 
                    fontSize: 12, 
                    strokeWidth: 0, 
                    fontFamily: 'articulat-cf', 
                    fontWeight: 600, 
                    wordWrap: 'anywhere' 
                    }}>
                    {value}
                    </span>
                )}
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