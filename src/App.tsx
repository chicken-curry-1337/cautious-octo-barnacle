import './App.css';
import { GamePage } from './pages/GamePage/GamePage';
import { GameStore } from './features/Game/Game.store';

const gameStore = new GameStore();

function App() {
  return <GamePage gameStore={gameStore} />;
}

export default App;
