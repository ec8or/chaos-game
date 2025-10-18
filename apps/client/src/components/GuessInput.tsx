import { useState, type FormEvent } from 'react';
import { useGame } from '../context/GameContext';

export function GuessInput() {
  const { sendGuess, roomStatus } = useGame();
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendGuess(input);
      setInput('');
    }
  };

  const isDisabled = roomStatus !== 'in_round';

  return (
    <div className="border-t-2 border-gray-700 bg-gray-800 p-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isDisabled ? 'Wait for round to start...' : 'Type your guess...'}
            disabled={isDisabled}
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            maxLength={200}
            autoFocus
          />
          <button
            type="submit"
            disabled={isDisabled || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 text-center">
          Press Enter to send • Max 200 characters
        </div>
      </form>
    </div>
  );
}
