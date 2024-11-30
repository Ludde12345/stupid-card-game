import React from "react";
import "./Card.css"; // Create a CSS file for styling

const Card = ({ name, manaCost, attack, health, imageSource, readyToAttack }) => {
  //const imageUrl = imageSource ?  require(`${imageSource}`) : "";  // This requires the image dynamically
  return (
    <div className = {readyToAttack ? "card-container-ready-to-attack" : "card-container"}>
      <div className="card-header">
        <h3 className="card-name">{name}</h3>
        <span className="mana-cost">{manaCost}</span>
      </div>
      <div className="card-body">
        <img class="card-image" src={imageSource}  alt=""></img>

      </div>
      <div className="card-footer">
        <span className="card-attack">⚔️ {attack}</span>
        <span className="card-health">❤️ {health}</span>
      </div>
    </div>
  );
};

export default Card;
