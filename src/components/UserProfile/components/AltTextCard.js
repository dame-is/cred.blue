import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile";
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

  // Prepare data for RadialBarChart - using the same structure as the example
  const data = [
    {
      name: 'Total Images',
      images: Number(postsWithImages) || 0,
      fill: '#FFA500',
    },
    {
      name: 'With Alt Text',
      images: Number(imagePostsAltText) || 0,
      fill: '#FFD700',
    },
  ].filter(item => item.images > 0);

  const style = {
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    lineHeight: '24px',
  };

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
      </ul>
      <h2>
        <strong>
          {(altTextPercentage * 100).toFixed(0)}% {emoji}
        </strong>
      </h2>
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="10%" 
            outerRadius="60%" 
            barSize={40} 
            data={data}
          >
            <RadialBar
              minAngle={15}
              label={{ 
                position: 'insideStart',
                fill: '#fff',
              }}
              background
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