import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import io from 'socket.io-client';
import Card from './Card';
import './Game.css'; // Import the new CSS file

const socket = io('http://localhost:6969');

const CardGame = ({ playerId }) => {
  const [enemyBoard, setEnemyBoard] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [playerBoard, setPlayerBoard] = useState([]);
  const enemyCardRefs = useRef([]);
  const [draggingCard, setDraggingCard] = useState(null);

  useEffect(() => {
    socket.on('gameUpdate', (state) => {
      console.log('Received game state:', state);
      setEnemyBoard(state.players[playerId === 'player1' ? 'player2' : 'player1'].board);
      setPlayerHand(state.players[playerId].hand);
      setPlayerBoard(state.players[playerId].board);
    });

    // Request the current game state when the component mounts
    socket.emit('requestGameState');

    return () => {
      socket.off('gameUpdate');
    };
  }, [playerId]);

  const calculateDamage = (playerCard, enemyCard) => {
    // Emit an event to the server to update the game state
    socket.emit('dealDamage', { playerId, playerCardId: playerCard.id, enemyCardId: enemyCard.id });
  };

  const onDragStart = (start) => {
    const { source } = start;
    const sourceList = source.droppableId === 'board' ? [...playerBoard] : [...playerHand];
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
      const list = source.droppableId === 'hand' ? [...playerHand] : [...playerBoard];
      const setList = source.droppableId === 'hand' ? setPlayerHand : setPlayerBoard;
      const [movedCard] = list.splice(source.index, 1);
      list.splice(destination.index, 0, movedCard);
      setList(list);
    } else {
      // Handle movement between lists
      const sourceList = source.droppableId === 'hand' ? [...playerHand] : [...playerBoard];
      const setSourceList = source.droppableId === 'hand' ? setPlayerHand : setPlayerBoard;
      const destinationList = destination.droppableId === 'board' ? [...playerBoard] : [...playerHand];
      const setDestinationList = destination.droppableId === 'board' ? setPlayerBoard : setPlayerHand;
      const [movedCard] = sourceList.splice(source.index, 1);
      destinationList.splice(destination.index, 0, movedCard);
      setSourceList(sourceList);
      setDestinationList(destinationList);

      // Emit an event to the server to update the game state
      socket.emit('moveCard', { playerId, cardId: movedCard.id, source: source.droppableId, destination: destination.droppableId });
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
            const enemyCard = enemyBoard[i];
            console.log(`Dropping ${draggingCard.name} on ${enemyCard.name}`);
            calculateDamage(draggingCard, enemyCard);
            return;
          }
        }
      }
    }
  };

  const resetGame = () => {
    socket.emit('resetGame');
  };

  const endTurn = () => {
    socket.emit('endTurn');
  };

  return (
    <div onMouseUp={onMouseUp}>
      <button className="reset-button" onClick={resetGame}>Reset Game</button>
      <button className="end-turn-button" onClick={endTurn}>End Turn</button>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        {/* Enemy's Board */}
        <Droppable droppableId="enemyBoard" direction="horizontal" isCombineEnabled isDropDisabled>
          {(provided) => (
            <div className="enemy-cards" ref={provided.innerRef} {...provided.droppableProps}>
              <h3>Enemy's Board</h3>
              <div className="card-list">
                {enemyBoard.map((card, index) => (
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
                          readyToAttack={card.readyToAttack}
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
        <Droppable key="playerBoard" droppableId="board" direction="horizontal" isCombineEnabled>
          {(provided) => (
            <div className="board-cards" ref={provided.innerRef} {...provided.droppableProps}>
              <h3>Your Board</h3>
              <div className="card-list">
                {playerBoard.map((card, index) => (
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
                          readyToAttack={card.readyToAttack}
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
        <Droppable key="playerHand" droppableId="hand" direction="horizontal">
          {(provided) => (
            <div className="player-hand fixed" ref={provided.innerRef} {...provided.droppableProps}>
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
                          readyToAttack={card.readyToAttack}
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