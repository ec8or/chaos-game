import type { PublicPlayer } from '@chaos-game/protocol';

interface TeamPanelProps {
  team: 'red' | 'blue';
  players: PublicPlayer[];
  score: number;
  side: 'left' | 'right';
}

export function TeamPanel({ team, players, score, side }: TeamPanelProps) {
  const bgColor = team === 'red' ? 'bg-red-900/30' : 'bg-blue-900/30';
  const borderColor = team === 'red' ? 'border-red-500' : 'border-blue-500';
  const textColor = team === 'red' ? 'text-red-400' : 'text-blue-400';

  return (
    <div className={`${bgColor} ${borderColor} border-2 rounded-lg p-4 h-full`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`${textColor} font-bold text-xl uppercase`}>{team} Team</h2>
        <div className={`${textColor} text-3xl font-bold`}>{score}</div>
      </div>

      <div className="space-y-2">
        {players.length === 0 && (
          <div className="text-gray-500 text-sm italic">Waiting for players...</div>
        )}
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2"
          >
            <span className="text-gray-200 truncate">{player.name}</span>
            <span className={`${textColor} font-semibold ml-2`}>{player.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
