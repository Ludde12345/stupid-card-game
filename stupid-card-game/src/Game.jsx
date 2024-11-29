import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';
import './Game.css'; // Import the new CSS file

const initialEnemyCards = [
  { id: 'e1', name: 'Enemy Card 1', manaCost: 3, attack: 2, health: 5 },
  { id: 'e2', name: 'Enemy Card 2', manaCost: 4, attack: 3, health: 4 },
];

const initialPlayerCards = [
  { id: 'p1', name: 'Player Card 1', manaCost: 2, attack: 4, health: 3 },
  { id: 'p2', name: 'Player Card 2', manaCost: 1, attack: 1, health: 2 },
];

const initialBoardCards = [];

const CardGame = () => {
  const [enemyCards, setEnemyCards] = useState(initialEnemyCards);
  const [playerCards, setPlayerCards] = useState(initialPlayerCards);
  const [boardCards, setBoardCards] = useState(initialBoardCards);

  const calculateDamage = (playerCard, enemyCard) => {
    // Implement your damage calculation logic here
    enemyCard.health -= playerCard.attack;
    playerCard.health -= enemyCard.attack;

    console.log(`Calculating damage between ${playerCard.name} and ${enemyCard.name}`);
  };

  const onDragEnd = (result) => {
    const { source, destination, combine } = result;

    // If there's no destination (dropped outside a list) and no combine, do nothing
    if (!destination && !combine) return;

    // If the source and destination are the same, do nothing
    if (destination && source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Handle combining cards
    if (combine) {
      const sourceList = source.droppableId === 'board' ? [...boardCards] : [...playerCards];
      const destinationList = combine.droppableId === 'enemy' ? [...enemyCards] : [...boardCards];

      const movedCard = sourceList[source.index];
      const combinedCard = destinationList.find(card => card.id === combine.draggableId);

      if (source.droppableId === 'board' && combine.droppableId === 'enemy') {
        calculateDamage(movedCard, combinedCard);
      }

      return;
    }

    // Handle movement within the same list
    if (source.droppableId === destination.droppableId) {
      const list = source.droppableId === 'hand' ? [...playerCards] : [...boardCards];
      const setList = source.droppableId === 'hand' ? setPlayerCards : setBoardCards;
      const [movedCard] = list.splice(source.index, 1);
      list.splice(destination.index, 0, movedCard);
      setList(list);
    } else {
      // Handle movement between lists
      const sourceList = source.droppableId === 'hand' ? [...playerCards] : [...boardCards];
      const setSourceList = source.droppableId === 'hand' ? setPlayerCards : setBoardCards;
      const destinationList = destination.droppableId === 'board' ? [...boardCards] : [...playerCards];
      const setDestinationList = destination.droppableId === 'board' ? setBoardCards : setPlayerCards;
      const [movedCard] = sourceList.splice(source.index, 1);
      destinationList.splice(destination.index, 0, movedCard);
      setSourceList(sourceList);
      setDestinationList(destinationList);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Enemy's Cards */}
      <Droppable droppableId="enemy" direction="horizontal" isCombineEnabled>
        {(provided) => (
          <div className="enemy-cards" ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Enemy's Cards</h3>
            <div className="card-list">
              {enemyCards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card
                        name={card.name}
                        manaCost={card.manaCost}
                        attack={card.attack}
                        health={card.health}
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
                    >
                      <Card
                        name={card.name}
                        manaCost={card.manaCost}
                        attack={card.attack}
                        health={card.health}
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
              {playerCards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card
                        name={card.name}
                        manaCost={card.manaCost}
                        attack={card.attack}
                        health={card.health}
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
  );
};

export default CardGame;