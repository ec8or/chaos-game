import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';

export function ChatFeed() {
  const { messages, you, players } = useGame();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No messages yet. Start guessing words!
        </div>
      )}

      {messages.map((msg) => {
        const isYou = you && msg.fromPlayerId === you.id;
        const hasPoints = msg.gotPointsFor && msg.gotPointsFor.length > 0;
        const player = players.find((p) => p.id === msg.fromPlayerId);
        const teamColor = player?.team === 'red' ? 'text-red-400' : 'text-blue-400';

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${isYou ? 'bg-gray-700/50' : ''} rounded p-2`}
          >
            <div className="flex-shrink-0">
              <span className={`text-sm font-semibold ${teamColor}`}>
                {msg.fromPlayerName}:
              </span>
            </div>
            <div className="flex-1">
              <span className="text-gray-200">{msg.text}</span>
              {hasPoints && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {msg.gotPointsFor!.map((word) => (
                    <span
                      key={word}
                      className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded font-semibold animate-bounce"
                    >
                      +1 {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
