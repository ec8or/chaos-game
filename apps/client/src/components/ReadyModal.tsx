import { type PublicPlayer } from '@chaos-game/protocol';

interface ReadyModalProps {
  players: PublicPlayer[];
  you: PublicPlayer | null;
  onToggleReady: (ready: boolean) => void;
}

export function ReadyModal({ players, you, onToggleReady }: ReadyModalProps) {
  const readyCount = players.filter(p => p.ready).length;
  const totalPlayers = players.length;
  const minReady = 2;
  const canStart = readyCount >= minReady;

  const yourReady = you?.ready ?? false;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          Get Ready!
        </h2>

        <div className="mb-6">
          <p className="text-gray-300 text-center mb-4">
            {canStart
              ? `Ready to start! (${readyCount}/${totalPlayers})`
              : `Waiting for players... (${readyCount}/${minReady} minimum)`}
          </p>

          <div className="space-y-2 mb-6">
            {players.map(player => {
              const isYou = you && player.id === you.id;
              const teamColor = player.team === 'red' ? 'text-red-400' : 'text-blue-400';

              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-gray-700/50 rounded px-4 py-2"
                >
                  <span className={`${teamColor} font-semibold`}>
                    {player.name} {isYou && '(You)'}
                  </span>
                  {player.ready ? (
                    <span className="text-green-400 font-bold">✓ Ready</span>
                  ) : (
                    <span className="text-gray-500">Not ready</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onToggleReady(!yourReady)}
          className={`w-full py-4 rounded-lg font-bold text-xl transition-colors ${
            yourReady
              ? 'bg-gray-600 hover:bg-gray-700 text-gray-300'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {yourReady ? 'Not Ready' : 'Ready!'}
        </button>
      </div>
    </div>
  );
}
