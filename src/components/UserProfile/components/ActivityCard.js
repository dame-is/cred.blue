import React, { useContext, useMemo } from "react";
import { AccountDataContext } from "../UserProfile";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`;

const getPercent = (value, total) => {
  const ratio = total > 0 ? value / total : 0;
  return toPercent(ratio, 2);
};

const renderTooltipContent = (o) => {
  const { payload, label } = o;
  if (!payload || !payload.length) return null;
  
  const total = payload.reduce((result, entry) => result + entry.value, 0);

  return (
    <div className="bg-white p-4 border rounded shadow-lg">
      <p className="font-bold">{`${label} (Total: ${total})`}</p>
      <ul className="list-none p-0">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value} (${getPercent(entry.value, total)})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ActivityCard = () => {
  const accountData = useContext(AccountDataContext);

  // Always call useMemo, but handle null data inside
  const weeklyData = useMemo(() => {
    if (!accountData?.weeklyActivity) {
      return [];
    }
    
    return accountData.weeklyActivity.map((week, index) => ({
      week: `Week ${index + 1}`,
      bskyRecords: week.totalBskyRecords || 0,
      nonBskyRecords: week.totalNonBskyRecords || 0
    }));
  }, [accountData]);

  // Calculate per day statistics, safely handling null values
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

  return (
    <div className="w-full space-y-6">
      {/* Area Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={weeklyData}
            stackOffset="expand"
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis tickFormatter={toPercent} />
            <Tooltip content={renderTooltipContent} />
            <Area 
              type="monotone" 
              dataKey="bskyRecords" 
              stackId="1" 
              stroke="#8884d8" 
              fill="#8884d8" 
              name="Bluesky Records"
            />
            <Area 
              type="monotone" 
              dataKey="nonBskyRecords" 
              stackId="1" 
              stroke="#82ca9d" 
              fill="#82ca9d" 
              name="Non-Bluesky Records"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Display */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">Bluesky Records/Day</h3>
          <p className="text-xl font-bold text-blue-600">{perDayStats.bskyRecords}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">Non-Bluesky/Day</h3>
          <p className="text-xl font-bold text-green-600">{perDayStats.nonBskyRecords}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">Posts/Day</h3>
          <p className="text-xl font-bold text-indigo-600">{perDayStats.posts}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">Replies/Day</h3>
          <p className="text-xl font-bold text-purple-600">{perDayStats.replies}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-semibold text-gray-600">Likes/Day</h3>
          <p className="text-xl font-bold text-pink-600">{perDayStats.likes}</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;