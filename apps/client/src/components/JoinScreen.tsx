import { useState, type FormEvent } from 'react';
import { useGame } from '../context/GameContext';

export function JoinScreen() {
  const { setPlayerName, connected, send } = useGame();
  const [localName, setLocalName] = useState('Guest');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (localName.trim()) {
      const name = localName.trim();
      setPlayerName(name);
      // Send hello directly with the name instead of using joinGame
      send({ type: 'hello', name });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full border-2 border-gray-700">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          🎮 Chaos Game
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Fast-paced word claiming battle
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!connected || !localName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {!connected ? 'Connecting...' : 'Join Game'}
          </button>
        </form>

        <div className="mt-8 text-sm text-gray-400 space-y-2">
          <p>📝 <strong>How to play:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>You'll be assigned to Red or Blue team</li>
            <li>Type target words to claim them (+1 point)</li>
            <li>3 rounds, 60 seconds each</li>
            <li>Highest team score wins!</li>
          </ul>
        </div>

        {!connected && (
          <div className="mt-4 bg-yellow-900/30 border border-yellow-600 rounded p-3 text-yellow-400 text-sm">
            ⚠️ Connecting to server...
          </div>
        )}
      </div>
    </div>
  );
}
