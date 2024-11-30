import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';
import './Game.css'; // Import the new CSS file
import cards from './CardStats.json';

function createCard(nameOfCard) {
  const cardToReturn = cards.find(card => card.name === nameOfCard);

  if (cardToReturn) {
    // Create a new object based on the card, and add the id to it
    return {
      ...cardToReturn,
      id: String(Math.random())  // Add id to the new object
    };
  }

  return null;  // Returns null if the card was not found
}

const deck =
  [
    createCard("Vacume"),
    createCard("Vacume"),
    createCard("Mopp"),
    createCard("Mopp"),
    createCard("Mopp"),
    createCard("Frying-pan"),
    createCard("Frying-pan"),
    createCard("Hardhat"),
    createCard("Hardhat"),
    createCard("Hardhat")
  ]


const CardGame = () => {
  const [enemyCards, setEnemyCards] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [boardCards, setBoardCards] = useState([]);
  const enemyCardRefs = useRef([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [playerDeck, setPlayerDeck] = useState(deck);

  function fillHand() {
    const newHand = [...playerHand];  // Create a copy of the current playerHand
    const newDeck = [...playerDeck];  // Create a copy of the current playerDeck

    while (newHand.length < 5 && newDeck.length > 0) {  // Ensure we don't exceed 5 cards in hand
      const chosenNumber = Math.floor(Math.random() * newDeck.length);
      const chosenCard = newDeck[chosenNumber];

      newHand.push(chosenCard);  // Add chosen card to hand
      newDeck.splice(chosenNumber, 1);  // Remove the chosen card from the deck
    }

    setPlayerHand(newHand);  // Update the player hand state
    setPlayerDeck(newDeck);  // Update the player deck state
  }

  useEffect(() => {
    // Initialize data or perform any setup tasks here
    console.log('Component mounted');
    console.log('Player cards:', enemyCards);
    // Example: Fetch initial data from an API
    // fetchInitialData();
    fillHand();
  }, []);

  const calculateDamage = (playerCard, enemyCard) => {
    // Implement your damage calculation logic here
    const updatedEnemyCards = enemyCards.map(card => {
      if (card.id === enemyCard.id) {
        return { ...card, health: card.health - playerCard.attack };
      }
      return card;
    }).filter(card => card.health > 0);

    const updatedPlayerCards = playerHand.map(card => {
      if (card.id === playerCard.id) {
        return { ...card, health: card.health - enemyCard.attack };
      }
      return card;
    }).filter(card => card.health > 0);

    setEnemyCards(updatedEnemyCards);
    setPlayerHand(updatedPlayerCards);

    console.log(`Calculating damage between ${playerCard.name} and ${enemyCard.name}`);
    console.log(`Enemy card health: ${enemyCard.health}`);
    console.log(`Player card health: ${playerCard.health}`);
  };

  const onDragStart = (start) => {
    const { source } = start;
    const sourceList = source.droppableId === 'board' ? [...boardCards] : [...playerHand];
    const movedCard = sourceList[source.index];
    setDraggingCard(movedCard);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If there's no destination (dropped outside a list), do nothing
    if (!destination) return;

    // If the source and destination are the same, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Handle movement within the same list
    if (source.droppableId === destination.droppableId) {
      const list = source.droppableId === 'hand' ? [...playerHand] : [...boardCards];
      const setList = source.droppableId === 'hand' ? setPlayerHand : setBoardCards;
      const [movedCard] = list.splice(source.index, 1);
      list.splice(destination.index, 0, movedCard);
      setList(list);
    } else {
      // Handle movement between lists
      const sourceList = source.droppableId === 'hand' ? [...playerHand] : [...boardCards];
      const setSourceList = source.droppableId === 'hand' ? setPlayerHand : setBoardCards;
      const destinationList = destination.droppableId === 'board' ? [...boardCards] : [...playerHand];
      const setDestinationList = destination.droppableId === 'board' ? setBoardCards : setPlayerHand;
      const [movedCard] = sourceList.splice(source.index, 1);
      destinationList.splice(destination.index, 0, movedCard);
      setSourceList(sourceList);
      setDestinationList(destinationList);
    }

    setDraggingCard(null);
  };

  const onMouseUp = (event) => {
    if (draggingCard) {
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      console.log(`Mouse position: (${mouseX}, ${mouseY})`);

      // Check if the mouse is over any enemy card
      for (let i = 0; i < enemyCardRefs.current.length; i++) {
        const enemyCardRef = enemyCardRefs.current[i];
        if (enemyCardRef) {
          const rect = enemyCardRef.getBoundingClientRect();
          console.log(`Enemy card ${i} rect:`, rect);
          if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
            const enemyCard = enemyCards[i];
            console.log(`Dropping ${draggingCard.name} on ${enemyCard.name}`);
            calculateDamage(draggingCard, enemyCard);
            return;
          }
        }
      }
    }
  };

  return (
    <div onMouseUp={onMouseUp}>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/* Enemy's Cards */}
        <Droppable droppableId="enemy" direction="horizontal" isCombineEnabled isDropDisabled>
          {(provided) => (
            <div className="enemy-cards" ref={provided.innerRef} {...provided.droppableProps}>
              <h3>Enemy's Cards</h3>
              <div className="card-list">
                {enemyCards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled>
                    {(provided) => (
                      <div
                        ref={(el) => {
                          provided.innerRef(el);
                          enemyCardRefs.current[index] = el;
                        }}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...provided.draggableProps.style, margin: '0 10px' }}
                      >
                        <Card
                          name={card.name}
                          manaCost={card.manaCost}
                          attack={card.attack}
                          health={card.health}
                          imageSource={card.imageSource}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            </div>
          )}
        </Droppable>

        {/* Player's Game Board */}
        <Droppable key="playerboard" droppableId="board" direction="horizontal" isCombineEnabled>
          {(provided) => (
            <div className="board-cards" ref={provided.innerRef} {...provided.droppableProps}>
              <h3>Your Board</h3>
              <div className="card-list">
                {boardCards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...provided.draggableProps.style, margin: '0 10px' }}
                      >
                        <Card
                          name={card.name}
                          manaCost={card.manaCost}
                          attack={card.attack}
                          health={card.health}
                          imageSource={card.imageSource}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>

        {/* Player's Hand */}
        <Droppable key="playerhand" droppableId="hand" direction="horizontal">
          {(provided) => (
            <div className="player-hand" ref={provided.innerRef} {...provided.droppableProps}>
              <h3>Your Hand</h3>
              <div className="card-list">
                {playerHand.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...provided.draggableProps.style, margin: '0 10px' }}
                      >
                        <Card
                          name={card.name}
                          manaCost={card.manaCost}
                          attack={card.attack}
                          health={card.health}
                          imageSource={card.imageSource}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CardGame;