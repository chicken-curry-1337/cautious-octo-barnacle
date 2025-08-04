import './App.css';
import { GameStore } from './features/Game/Game.store';
import { GamePage } from './pages/GamePage/GamePage';

const gameStore = new GameStore();

function App() {
  return <GamePage gameStore={gameStore} />;
}

export default App;
