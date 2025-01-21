// src/components/Card/Card.jsx
import React from "react";
import "./Card.css";

const Card = ({ title, children }) => {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <div className="drag-handle">
            <span className="drag-icon">≡</span>
          </div>
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
