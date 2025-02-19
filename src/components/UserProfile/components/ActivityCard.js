import React, { useContext, useMemo } from "react";
import { AccountDataContext } from "../UserProfile";
import "./ActivityCard.css"; // Optional: For styling
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ActivityCard = () => {
  const accountData = useContext(AccountDataContext);

  const weeklyData = useMemo(() => {
    if (!accountData?.weeklyActivity) return [];
    
    return accountData.weeklyActivity.map((week, index) => ({
      name: `Week ${index + 1}`,
      bskyRecords: week.bskyRecords,
      nonBskyRecords: week.nonBskyRecords,
      total: week.bskyRecords + week.nonBskyRecords
    }));
  }, [accountData]);

  const perDayStats = useMemo(() => {
    if (!accountData) {
      return {
        bskyRecords: 0,
        nonBskyRecords: 0,
        posts: 0,
        replies: 0,
        likes: 0,
      };
    }

    return {
      bskyRecords: accountData.activityAll?.totalBskyRecordsPerDay || 0,
      nonBskyRecords: accountData.activityAll?.totalNonBskyRecordsPerDay || 0,
      posts: accountData.activityAll?.["app.bsky.feed.post"]?.onlyPostsPerDay || 0,
      replies: accountData.activityAll?.["app.bsky.feed.post"]?.onlyRepliesPerDay || 0,
      likes: accountData.activityAll?.["app.bsky.feed.like"]?.perDay || 0,
    };
  }, [accountData]);

  if (!accountData) {
    return <div>Loading activity data...</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
        <p className="font-semibold mt-1">
          Total: {payload[0].payload.total}
        </p>
      </div>
    );
  };

  return (
    <div className="activity-card">
      {/* Area Chart */}
      <div style={{ width: '100%', height: '200px' }}>
        <ResponsiveContainer>
          <AreaChart
            data={weeklyData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              yAxisId="right"
              dataKey="nonBskyRecords"
              stackId="1"
              stroke="none"
              fill="#004F84"
              fillOpacity={1}
              name="atproto records"
            />
            <Area
              type="monotone"
              yAxisId="left"
              dataKey="bskyRecords"
              stackId="1"
              stroke="none"
              fill="#3b9af8"
              fillOpacity={1}
              name="bsky records"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Display */}
      <div className="activity-stat-container">
        <div className="activity-stat">
        <p className="activity-data">{perDayStats.bskyRecords}</p>
          <h3 className="activity-header">bsky records per day</h3>
        </div>
        <div className="activity-stat">
        <p className="activity-data">{perDayStats.nonBskyRecords}</p>
          <h3 className="activity-header">atproto records per day</h3>
        </div>
        <div className="activity-stat">
        <p className="activity-data">{perDayStats.posts}</p>
          <h3 className="activity-header">posts per day</h3>
        </div>
        <div className="activity-stat">
        <p className="activity-data">{perDayStats.replies}</p>
          <h3 className="activity-header">replies per day</h3>
        </div>
        <div className="activity-stat">
        <p className="activity-data">{perDayStats.likes}</p>
          <h3 className="activity-header">likes per day</h3>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;