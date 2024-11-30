import React, { useState, useRef, useEffect} from 'react';
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
  const enemyCardRefs = useRef([]);
  const [draggingCard, setDraggingCard] = useState(null);

  useEffect(() => {
    // Initialize data or perform any setup tasks here
    console.log('Component mounted');
    console.log('Player cards:', enemyCards);
    // Example: Fetch initial data from an API
    // fetchInitialData();
  }, []);

  const calculateDamage = (playerCard, enemyCard) => {
    // Implement your damage calculation logic here
    const updatedEnemyCards = enemyCards.map(card => {
      if (card.id === enemyCard.id) {
        return { ...card, health: card.health - playerCard.attack };
      }
      return card;
    }).filter(card => card.health > 0);

    const updatedPlayerCards = playerCards.map(card => {
      if (card.id === playerCard.id) {
        return { ...card, health: card.health - enemyCard.attack };
      }
      return card;
    }).filter(card => card.health > 0);

    setEnemyCards(updatedEnemyCards);
    setPlayerCards(updatedPlayerCards);

    console.log(`Calculating damage between ${playerCard.name} and ${enemyCard.name}`);
    console.log(`Enemy card health: ${enemyCard.health}`);
    console.log(`Player card health: ${playerCard.health}`);
  };

  const onDragStart = (start) => {
    const { source } = start;
    const sourceList = source.droppableId === 'board' ? [...boardCards] : [...playerCards];
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
                        style={{ ...provided.draggableProps.style, margin: '0 10px' }}
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
    </div>
  );
};

export default CardGame;