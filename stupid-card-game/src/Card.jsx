import React from "react";
import "./Card.css"; // Create a CSS file for styling

const Card = ({ name, manaCost, attack, health }) => {
  return (
    <div className="card-container">
      <div className="card-header">
        <span className="mana-cost">{manaCost}</span>
      </div>
      <div className="card-body">
        <h3 className="card-name">{name}</h3>
      </div>
      <div className="card-footer">
        <span className="card-attack">⚔️ {attack}</span>
        <span className="card-health">❤️ {health}</span>
      </div>
    </div>
  );
};

export default Card;
