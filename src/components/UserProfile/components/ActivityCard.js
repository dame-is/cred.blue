import React, { useContext, useMemo } from "react";
import { AccountDataContext } from "../UserProfile";
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
    <div className="w-full space-y-6">
      {/* Area Chart */}
      <div style={{ width: '100%', height: '300px' }}>
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
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="bskyRecords"
              stackId="1"
              stroke="none"
              fill="#66b2ff"
              name="bsky records"
            />
            <Area
              type="monotone"
              dataKey="nonBskyRecords"
              stackId="1"
              stroke="none"
              fill="#0056b3"
              name="atproto records"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">bsky records per day</h3>
          <p className="text-xl font-bold text-blue-600">{perDayStats.bskyRecords}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">atproto records per day</h3>
          <p className="text-xl font-bold text-green-600">{perDayStats.nonBskyRecords}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">posts per day</h3>
          <p className="text-xl font-bold text-indigo-600">{perDayStats.posts}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">replies per day</h3>
          <p className="text-xl font-bold text-purple-600">{perDayStats.replies}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">likes per day</h3>
          <p className="text-xl font-bold text-pink-600">{perDayStats.likes}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;