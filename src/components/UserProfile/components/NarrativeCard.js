// frontend/src/components/UserProfile/components/NarrativeCard.js
import React, { useContext } from "react";
import { AccountDataContext } from "../UserProfile"; // Adjust the path if needed

const NarrativeCard = () => {
  const accountData = useContext(AccountDataContext);

  if (!accountData) {
    return <div>Loading narrative...</div>;
  }

  return (
    <>
    <p>
       {accountData.narrative}
    </p>
    </>
  );
};

export default NarrativeCard;
