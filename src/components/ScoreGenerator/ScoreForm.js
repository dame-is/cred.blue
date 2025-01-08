import React, { useState, useEffect } from "react";
import "./ScoreForm.css"; // Ensure you have appropriate styles

const ScoreForm = ({ onSubmit, comparisonMode }) => {
  const [identities, setIdentities] = useState(["", ""]);

  // Reset identities when comparison mode changes
  useEffect(() => {
    setIdentities(["", ""]);
  }, [comparisonMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedIdentities = identities.map((id) => id.trim()).filter(Boolean);

    if (
      (comparisonMode && trimmedIdentities.length === 2) ||
      (!comparisonMode && trimmedIdentities.length === 1)
    ) {
      onSubmit(trimmedIdentities);
    } else {
      alert(
        comparisonMode
          ? "Please enter two valid Bluesky identities."
          : "Please enter one valid Bluesky identity."
      );
    }
  };

  const handleChange = (index, value) => {
    setIdentities((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="identityInput1">Enter a Bluesky Identity:</label>
      <input
        type="text"
        id="identityInput1"
        placeholder="e.g., dame.bsky.social"
        value={identities[0]}
        onChange={(e) => handleChange(0, e.target.value)}
        required
      />
      {comparisonMode && (
        <>
          <label htmlFor="identityInput2">Enter another Bluesky Identity:</label>
          <input
            type="text"
            id="identityInput2"
            placeholder="e.g., juli.ee"
            value={identities[1]}
            onChange={(e) => handleChange(1, e.target.value)}
            required={comparisonMode}
          />
        </>
      )}
      <button type="submit">Get Score</button>
    </form>
  );
};

export default ScoreForm;
