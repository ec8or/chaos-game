import type { GameSummary } from '@chaos-game/protocol';

interface GameFinishedModalProps {
  summary: GameSummary;
  onClose: () => void;
}

export function GameFinishedModal({ summary, onClose }: GameFinishedModalProps) {
  const winner = summary.winner;
  const topPlayers = summary.finalPlayerScores.slice(0, 5);

  const getWinnerEmoji = () => {
    if (winner === 'red') return '🔴';
    if (winner === 'blue') return '🔵';
    return '🤝';
  };

  const getWinnerText = () => {
    if (winner === 'red') return 'Red Team Wins!';
    if (winner === 'blue') return 'Blue Team Wins!';
    return "It's a Draw!";
  };

  const getWinnerColor = () => {
    if (winner === 'red') return 'text-red-400';
    if (winner === 'blue') return 'text-blue-400';
    return 'text-yellow-400';
  };

  const redScore = summary.finalTeamScores.find((t) => t.team === 'red')?.score || 0;
  const blueScore = summary.finalTeamScores.find((t) => t.team === 'blue')?.score || 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border-2 border-gray-700 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{getWinnerEmoji()} 🎉 {getWinnerEmoji()}</div>
          <h2 className={`text-3xl font-bold ${getWinnerColor()} mb-2`}>
            {getWinnerText()}
          </h2>
          <div className="text-2xl text-gray-300">
            <span className="text-red-400 font-bold">{redScore}</span>
            {' - '}
            <span className="text-blue-400 font-bold">{blueScore}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-3 text-center">
            🏆 Top Players
          </h3>
          <div className="space-y-2">
            {topPlayers.map((player, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              const medal = medals[index] || '🏅';

              return (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between bg-gray-700/50 rounded px-4 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{medal}</span>
                    <span className="text-white font-medium">{player.playerName}</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-lg">{player.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-lg"
        >
          Play Again
        </button>

        <p className="text-sm text-gray-400 text-center mt-4">
          New game starting soon...
        </p>
      </div>
    </div>
  );
}
