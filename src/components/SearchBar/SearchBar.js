// src/components/SearchBar/SearchBar.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css"; // Create corresponding CSS for styling

const SearchBar = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() !== "") {
      // Encode the username to safely include in the URL
      const encodedUsername = encodeURIComponent(username.trim());
      navigate(`/${encodedUsername}`);
      setUsername("");
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="(e.g. dame.bsky.social)"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchBar;
