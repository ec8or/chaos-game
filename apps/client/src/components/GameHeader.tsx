import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

export function GameHeader() {
  const { roomStatus, currentRound, countdown } = useGame();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!currentRound && !countdown) {
      setTimeLeft(0);
      return;
    }

    const endsAt = currentRound?.endsAt || countdown?.endsAt || 0;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentRound, countdown]);

  const getStatusText = () => {
    switch (roomStatus) {
      case 'idle':
        return 'Waiting for players...';
      case 'countdown':
        return `Round ${(countdown?.roundIndex ?? 0) + 1} starting in...`;
      case 'in_round':
        return `Round ${(currentRound?.roundIndex ?? 0) + 1} - ${currentRound?.targetListName || currentRound?.targetListId || 'Playing'}`;
      case 'intermission':
        return 'Round ended!';
      case 'finished_game':
        return 'Game finished!';
      default:
        return 'Loading...';
    }
  };

  const getTimerColor = () => {
    // Always yellow for any timer
    return 'text-yellow-400';
  };

  return (
    <div className="bg-gray-800 border-b-2 border-gray-700 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">Chaos Game</h1>
        </div>

        <div className="flex-1 text-center">
          <div className="text-gray-300 text-lg">{getStatusText()}</div>
          {(currentRound || countdown) && (
            <div className={`text-4xl font-bold ${getTimerColor()} mt-1`}>
              {timeLeft}s
            </div>
          )}
          {currentRound && (
            <div className="text-sm text-gray-400 mt-1">
              {currentRound.remainingWords} words remaining
            </div>
          )}
        </div>

        <div className="flex-1" />
      </div>
    </div>
  );
}
