import logo from './logo.svg';
import './App.css';
import CardGame from './Game';
import Card from './Card';

function App() {
  return (
    <div className="App">
      <CardGame></CardGame>
      <Card
        name={"test"}
        manaCost={5}
        attack={3}
        health={2}
      />
    </div>
  );
}

export default App;
