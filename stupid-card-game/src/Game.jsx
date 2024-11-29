import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const initialEnemyCards = [
  { id: 'e1', name: 'Enemy Card 1' },
  { id: 'e2', name: 'Enemy Card 2' },
];

const initialPlayerCards = [
  { id: 'p1', name: 'Player Card 1' },
  { id: 'p2', name: 'Player Card 2' },
];

const initialBoardCards = [];

const CardGame = () => {
  const [enemyCards, setEnemyCards] = useState(initialEnemyCards);
  const [playerCards, setPlayerCards] = useState(initialPlayerCards);
  const [boardCards, setBoardCards] = useState(initialBoardCards);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    // If there's no destination (dropped outside a list), do nothing
    if (!destination) return;

    // If the source and destination are the same, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Handle movement between lists
    const moveCard = (sourceList, setSourceList, destinationList, setDestinationList) => {
      const [movedCard] = sourceList.splice(source.index, 1);
      destinationList.splice(destination.index, 0, movedCard);
      setSourceList([...sourceList]);
      setDestinationList([...destinationList]);
    };

    // Logic for specific lists
    if (source.droppableId === 'hand' && destination.droppableId === 'board') {
      moveCard([...playerCards], setPlayerCards, [...boardCards], setBoardCards);
    } else if (source.droppableId === 'board' && destination.droppableId === 'enemy') {
      console.log('Attacking enemy card!');
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Enemy's Cards */}
      <Droppable droppableId="enemy" isDropDisabled={true}>
        {(provided) => (
          <div className="enemy-cards" ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Enemy's Cards</h3>
            {enemyCards.map((card, index) => (
              <div key={card.id} className="card">
                {card.name}
              </div>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Player's Game Board */}
      <Droppable droppableId="board">
        {(provided) => (
          <div className="board-cards" ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Your Board</h3>
            {boardCards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided) => (
                  <div
                    className="card"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {card.name}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Player's Hand */}
      <Droppable droppableId="hand">
        {(provided) => (
          <div className="player-hand" ref={provided.innerRef} {...provided.droppableProps}>
            <h3>Your Hand</h3>
            {playerCards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided) => (
                  <div
                    className="card"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {card.name}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CardGame;
