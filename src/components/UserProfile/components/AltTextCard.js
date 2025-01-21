import React from "react";
import "./AltTextCard.css"; // Optional: add specific styles for AltTextCard

const AltTextCard = ({
  postsWithImages = 0,
  imagePostsPerDay = 0,
  imagePostsAltText = 0,
  imagePostsNoAltText = 0,
  altTextPercentage = 0,
  imagePostsReplies = 0
}) => {
  return (
    <div className="alt-text-card">
      <h2>Alt Text Statistics</h2>
      <ul>
        <li>
          <strong>Posts with Images:</strong>{" "}
          {Number(postsWithImages).toFixed(2)}
        </li>
        <li>
          <strong>Image Posts per Day:</strong>{" "}
          {Number(imagePostsPerDay).toFixed(2)}
        </li>
        <li>
          <strong>Image Posts with Alt Text:</strong>{" "}
          {Number(imagePostsAltText).toFixed(2)}
        </li>
        <li>
          <strong>Image Posts without Alt Text:</strong>{" "}
          {Number(imagePostsNoAltText).toFixed(2)}
        </li>
        <li>
          <strong>Alt Text Percentage:</strong>{" "}
          {(Number(altTextPercentage) * 100).toFixed(2)}%
        </li>
        <li>
          <strong>Image Posts (Replies):</strong>{" "}
          {Number(imagePostsReplies).toFixed(2)}
        </li>
      </ul>
    </div>
  );
};

export default AltTextCard;
