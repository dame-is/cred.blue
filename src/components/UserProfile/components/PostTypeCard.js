// frontend/src/components/UserProfile/components/PostTypeCard.js
import React, { useContext, useState } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed
import { PieChart, Pie, Sector, Cell, Legend, ResponsiveContainer } from 'recharts';

// Define the renderActiveShape function outside the component for clarity
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={fill}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >
        {`${value} Records`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const PostTypeCard = () => {
  const accountData = useContext(AccountDataContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const COLORS = ['#0056b3', '#0066cc', '#3399ff', '#66b2ff'];

  if (!accountData) {
    return <div>Loading post types...</div>;
  }

  // Prepare the data for the pie chart
  const data = [
    { name: 'Posts', value: accountData.activityAll["app.bsky.feed.post"].onlyPosts },
    { name: 'Replies', value: accountData.activityAll["app.bsky.feed.post"].onlyReplies },
    { name: 'Quotes', value: accountData.activityAll["app.bsky.feed.post"].onlyQuotes },
    { name: 'Reposts', value: accountData.activityAll["app.bsky.feed.post"].onlyReposts },
  ];

  // Handler for when a pie slice is hovered
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PostTypeCard;
