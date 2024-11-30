import React, { useState } from 'react';
import './App.css';
import CardGame from './Game';
import ConnectPage from './JoinGamePage';

function App() {
  const [playerId, setPlayerId] = useState(null);

  const handleConnect = (id) => {
    setPlayerId(id);
  };

  return (
    <div className="App">
      {!playerId ? (
        <ConnectPage onConnect={handleConnect} />
      ) : (
        <CardGame playerId={playerId} />
      )}
    </div>
  );
}

export default App;