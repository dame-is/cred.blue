import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import "./AltTextCard.css";

const emojis = ["☹️", "😐", "🙂", "☺️"];

const AltTextCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData || !accountData.activityAll || !accountData.activityAll["app.bsky.feed.post"]) {
    return <div className="alt-text-card">Loading alt text statistics...</div>;
  }

  const postStats = accountData.activityAll["app.bsky.feed.post"];
  const {
    postsWithImages,
    postsCount,
    imagePostsAltText,
    altTextPercentage,
    imagePostsReplies,
  } = postStats;

  // Calculate emoji based on percentage
  let emoji = emojis[0];
  if (altTextPercentage >= 0.75) {
    emoji = emojis[3];
  } else if (altTextPercentage >= 0.50) {
    emoji = emojis[2];
  } else if (altTextPercentage >= 0.25) {
    emoji = emojis[1];
  }

  // Prepare data for RadialBarChart - ensure values are numbers
  const data = [
    {
      name: "Total Images",
      images: Number(postsWithImages) || 0,
      fill: '#FFD700', // Gold color for total images
    },
    {
      name: "With Alt Text",
      images: Number(imagePostsAltText) || 0,
      fill: '#3B9AF8', // Blue color for alt text images
    }
  ].filter(item => item.images > 0);
  
  return (
    <div className="alt-text-card">
      <ul>
        <li>
          <strong>{postsCount}</strong> posts analyzed
        </li>
        <li>
          <strong>{postsWithImages}</strong> contain images
        </li>
        <li>
          <strong>{imagePostsReplies}</strong> are replies
        </li>
        <li>
          <strong>{imagePostsAltText}</strong> posts have alt text
        </li>
        <h2>
        <strong>
          {(altTextPercentage * 100).toFixed(0)}% {emoji}
        </strong>
      </h2>
      <p className="disclaimer">Last 90 Days</p>
      </ul>
      <div style={{ width: '50%', height: 300 }}>
        <ResponsiveContainer>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="30%" 
            outerRadius="100%" 
            barSize={30} 
            data={data}
            startAngle={180}
            endAngle={-180}
          >
            <RadialBar
              minAngle={15}
              label={{
                position: 'insideStart',
                fill: '#fff',
                formatter: (value) => value ? `${value}` : ''
              }}
              background={{ fill: '#eee' }}
              clockWise
              dataKey="images"
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AltTextCard;