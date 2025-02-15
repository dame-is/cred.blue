import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PostTypeCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading post types...</div>;
  }

  // Prepare the data for the bar chart
  const data = [
    { 
      name: 'Posts', 
      value: accountData.activityAll["app.bsky.feed.post"].onlyPosts 
    },
    { 
      name: 'Replies', 
      value: accountData.activityAll["app.bsky.feed.post"].onlyReplies 
    },
    { 
      name: 'Quotes', 
      value: accountData.activityAll["app.bsky.feed.post"].onlyQuotes 
    },
    { 
      name: 'Reposts', 
      value: accountData.activityAll["app.bsky.feed.post"].onlyReposts 
    },
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} Records`, 'Count']}
          />
          <Bar 
            dataKey="value" 
            fill="#0056b3" 
            background={{ fill: '#eee' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PostTypeCard;