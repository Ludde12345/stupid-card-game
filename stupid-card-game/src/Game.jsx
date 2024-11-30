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
  const [currentTurn, setCurrentTurn] = useState('player1');
  const enemyCardRefs = useRef([]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [manaAmount, setManaAmount] = useState(6);

  useEffect(() => {
    socket.on('gameUpdate', (state) => {
      console.log('Received game state:', state);
      setEnemyBoard(state.players[playerId === 'player1' ? 'player2' : 'player1'].board);
      setPlayerHand(state.players[playerId].hand);
      setPlayerBoard(state.players[playerId].board);
      setCurrentTurn(state.turn);
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
  
    // Get a copy of the source list (either playerHand or playerBoard)
    const list = source.droppableId === 'hand' ? [...playerHand] : [...playerBoard];
    
    // Remove the moved card from the source list (mutate a copy of the list)
    const [movedCard] = list.splice(source.index, 1);
  
    // Handle movement within the same list
    if (source.droppableId === destination.droppableId) {
      const setList = source.droppableId === 'hand' ? setPlayerHand : setPlayerBoard;
  
      // Insert the moved card at the destination index (in the copied list)
      list.splice(destination.index, 0, movedCard);
  
      // Update the state with the new list
      setList(list);
    } else if (manaAmount >= movedCard.manaCost) {
      // Handle movement between lists, checking mana cost
      setManaAmount(manaAmount - movedCard.manaCost);  // Correct state update for mana
      console.log("mana cos t", movedCard);
      console.log(manaAmount)
  
      const setSourceList = source.droppableId === 'hand' ? setPlayerHand : setPlayerBoard;
  
      // Get a copy of the destination list (either playerHand or playerBoard)
      const destinationList = destination.droppableId === 'board' ? [...playerBoard] : [...playerHand];
  
      const setDestinationList = destination.droppableId === 'board' ? setPlayerBoard : setPlayerHand;
  
      // Insert the moved card at the destination index (in the copied destination list)
      destinationList.splice(destination.index, 0, movedCard);
  
      // Update both the source and destination lists
      setSourceList(list);
      setDestinationList(destinationList);

      
  
      // Emit an event to the server to update the game state
      socket.emit('moveCard', {
        playerId,
        cardId: movedCard.id,
        source: source.droppableId,
        destination: destination.droppableId,
      });
    }
  
    // Reset dragging state
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
    setManaAmount(6);
  };

  return (
    <div onMouseUp={onMouseUp}>
      <button className="reset-button" onClick={resetGame}>Reset Game</button>
      <button className="end-turn-button" onClick={endTurn} disabled={currentTurn !== playerId}>End Turn</button>
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
                  <Draggable key={card.id} draggableId={card.id} index={index} isDragDisabled={currentTurn !== playerId || !card.readyToAttack}>
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
        <h1 className="mana-amount">{manaAmount}</h1>
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