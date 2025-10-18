import { useGame } from '../context/GameContext';
import { GameHeader } from './GameHeader';
import { TeamPanel } from './TeamPanel';
import { ChatFeed } from './ChatFeed';
import { GuessInput } from './GuessInput';
import { GameFinishedModal } from './GameFinishedModal';

export function GameRoom() {
  const { redTeam, blueTeam, redScore, blueScore, gameSummary, clearGameSummary } = useGame();

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <GameHeader />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Team Panel */}
        <div className="w-64 p-4 border-r-2 border-gray-700">
          <TeamPanel team="red" players={redTeam} score={redScore} side="left" />
        </div>

        {/* Center Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-850">
          <ChatFeed />
          <GuessInput />
        </div>

        {/* Right Team Panel */}
        <div className="w-64 p-4 border-l-2 border-gray-700">
          <TeamPanel team="blue" players={blueTeam} score={blueScore} side="right" />
        </div>
      </div>

      {/* Game Finished Modal */}
      {gameSummary && (
        <GameFinishedModal summary={gameSummary} onClose={clearGameSummary} />
      )}
    </div>
  );
}
