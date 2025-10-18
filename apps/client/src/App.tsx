import { GameProvider, useGame } from './context/GameContext';
import { JoinScreen } from './components/JoinScreen';
import { GameRoom } from './components/GameRoom';

function GameContent() {
  const { you } = useGame();

  if (!you) {
    return <JoinScreen />;
  }

  return <GameRoom />;
}

export function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
