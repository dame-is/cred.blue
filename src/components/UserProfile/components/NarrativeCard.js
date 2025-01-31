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
       {accountData.analysis.narrative1}
    </p>
    <p>
       {accountData.analysis.narrative2}
    </p>
    <p>
       {accountData.analysis.narrative3}
    </p>
    </>
  );
};

export default NarrativeCard;
