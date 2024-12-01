// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cards = require('./CardStats.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:1337', // Allow requests from this origin
    methods: ['GET', 'POST'],
  },
});

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors()); // Use the cors middleware

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

const startingDeck = [
  "Vacume",
  "Vacume",
  "Mopp",
  "Mopp",
  "Mopp",
  "Pan",
  "Pan",
  "Hardhat",
  "Hardhat",
  "Hardhat",
  "Comb",
  "Comb",
  "Comb",
  "Comb",
  "Comb",
  "Tophat",
  "Tophat",
  "Tophat",
  "Roomba",
  "Bodyguard",
  "Bodyguard",
  "Bodyguard",
];

function initDeck(playerId) {
  const player = gameState.players[playerId];
  player.deck = startingDeck.map(cardName => createCard(cardName));
}

function fillHand(playerId) {
  const player = gameState.players[playerId];
  const newHand = [...player.hand];
  const newDeck = [...player.deck];

  while (newHand.length < 5 && newDeck.length > 0) {
    const chosenNumber = Math.floor(Math.random() * newDeck.length);
    const chosenCard = newDeck[chosenNumber];
    chosenCard.readyToAttack = false;

    newHand.push(chosenCard);
    newDeck.splice(chosenNumber, 1);
  }

  player.hand = newHand;
  player.deck = newDeck;
}

function newTurn() {
  console.log("new turn");
  const currentPlayer = gameState.turn;
  const nextPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';

  fillHand(nextPlayer);
  gameState.players[nextPlayer].manaAmount = 6;

  gameState.players[nextPlayer].board.forEach(card => {
    card.readyToAttack = true;
  });

  gameState.turn = nextPlayer;

  io.emit('gameUpdate', gameState);
}

let initialGameState = {
  players: {
    player1: { hand: [], board: [], deck: [], health: 20, initialized: false, manaAmount: 6 },
    player2: { hand: [], board: [], deck: [], health: 20, initialized: false, manaAmount: 6 },
  },
  turn: 'player1',
};

let gameState = JSON.parse(JSON.stringify(initialGameState));

// WebSocket connection for real-time actions
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinAsPlayer', (playerId) => {
    if (gameState.players[playerId]) {
      if (!gameState.players[playerId].initialized) {
        initDeck(playerId);
        fillHand(playerId);
        gameState.players[playerId].initialized = true;
      }
      console.log(`Player ${socket.id} joined as ${playerId}`);
      console.log('Game state:', gameState);
      socket.emit('gameUpdate', gameState);
    } else {
      socket.emit('error', { message: 'Invalid player ID' });
    }
  });

  socket.on('requestGameState', () => {
    socket.emit('gameUpdate', gameState);
  });

  socket.on('dealDamage', ({ playerId, playerCardId, enemyCardId }) => {
    const player = gameState.players[playerId];
    const enemy = gameState.players[playerId === 'player1' ? 'player2' : 'player1'];

    const playerCard = player.board.find(card => card.id === playerCardId);
    const enemyCard = enemy.board.find(card => card.id === enemyCardId);

    if (playerCard && enemyCard && playerCard.readyToAttack) {
      enemyCard.health -= playerCard.attack;
      playerCard.readyToAttack = false; // Set readyToAttack to false after attacking

      // Remove dead cards
      enemy.board = enemy.board.filter(card => card.health > 0);
      player.board = player.board.filter(card => card.health > 0);

      // Broadcast updated state
      io.emit('gameUpdate', gameState);
    }
  });

  socket.on('moveCard', ({ playerId, cardId, source, destination }) => {
    const player = gameState.players[playerId];

    // Check if it's the player's turn
    if (gameState.turn !== playerId) {
      return;
    }

    if (source === 'hand' && destination === 'board') {
      const cardIndex = player.hand.findIndex(card => card.id === cardId);
      if (cardIndex !== -1) {
        const [movedCard] = player.hand.splice(cardIndex, 1); // Remove the card from the hand
        if (player.manaAmount >= movedCard.manaCost) {
          player.manaAmount -= movedCard.manaCost; // Deduct mana cost
          player.board.push(movedCard); // Add the card to the board
        } else {
          // If not enough mana, return the card to the hand
          player.hand.splice(cardIndex, 0, movedCard);
        }
      }
    } else if (source === 'board' && destination === 'hand') {
      const cardIndex = player.board.findIndex(card => card.id === cardId && card.readyToAttack);
      if (cardIndex !== -1) {
        const [movedCard] = player.board.splice(cardIndex, 1); // Remove the card from the board
        player.hand.push(movedCard); // Add the card to the hand
      }
    }

    // Broadcast updated state
    io.emit('gameUpdate', gameState);
  });

  socket.on('resetGame', () => {
    gameState = JSON.parse(JSON.stringify(initialGameState));
    initDeck('player1');
    initDeck('player2');
    io.emit('gameUpdate', gameState);
  });

  socket.on('endTurn', () => {
    newTurn();
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

// Start server
server.listen(6969, () => {
  console.log('Server running on http://localhost:6969');
});