import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:6969');

const ConnectPage = ({ onConnect }) => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('gameUpdate', (state) => {
      setGameState(state);
    });
  }, []);

  const handleJoinAsPlayer = (playerId) => {
    socket.emit('joinAsPlayer', playerId);
    onConnect(playerId);
  };

  return (
    <div>
      <button onClick={() => handleJoinAsPlayer('player1')}>Join as Player 1</button>
      <button onClick={() => handleJoinAsPlayer('player2')}>Join as Player 2</button>
      {gameState && (
        <div>
          <h3>Game State</h3>
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ConnectPage;