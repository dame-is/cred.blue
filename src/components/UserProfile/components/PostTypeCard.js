// frontend/src/components/UserProfile/components/PostTypeCard.js
import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed

const PostTypeCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading narrative...</div>;
  }

  return (
    <>
    <p>
        <strong>Posts:</strong> {accountData.postsCount}
    </p>
    <p>
       <strong>Replies:</strong> {(accountData.activityAll.replyPercentage * 100).toFixed(2)}%
    </p>
    <p>
       <strong>Quotes:</strong> {(accountData.activityAll.quotePercentage * 100).toFixed(2)}%
    </p>
    </>
  );
};

export default PostTypeCard;
