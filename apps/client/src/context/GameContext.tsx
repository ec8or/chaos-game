import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type {
  ServerMsg,
  ClientMsg,
  PublicPlayer,
  PublicRoomState,
  RoomStatus,
  TeamId,
  GameSummary,
} from '@chaos-game/protocol';
import { useWebSocket } from '../hooks/useWebSocket';

interface ChatMessage {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  text: string;
  at: number;
  gotPointsFor?: string[];
}

interface GameState {
  // Connection
  connected: boolean;

  // Player
  you: PublicPlayer | null;
  playerName: string;

  // Room
  roomStatus: RoomStatus;
  players: PublicPlayer[];
  redTeam: PublicPlayer[];
  blueTeam: PublicPlayer[];
  redScore: number;
  blueScore: number;

  // Round
  currentRound?: {
    roundIndex: number;
    remainingWords: number;
    endsAt: number;
    startedAt: number;
    targetListId?: string;
    targetListName?: string;
  };
  countdown?: {
    roundIndex: number;
    endsAt: number;
  };

  // Chat
  messages: ChatMessage[];

  // Game summary
  gameSummary: GameSummary | null;
  clearGameSummary: () => void;

  // Actions
  setPlayerName: (name: string) => void;
  joinGame: () => void;
  sendGuess: (text: string) => void;
  send: (msg: ClientMsg) => void;
}

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { connected, lastMessage, send } = useWebSocket();

  const [playerName, setPlayerName] = useState('Guest');
  const [you, setYou] = useState<PublicPlayer | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('idle');
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [currentRound, setCurrentRound] = useState<GameState['currentRound']>();
  const [countdown, setCountdown] = useState<GameState['countdown']>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'joined':
        setYou(lastMessage.you);
        updateRoomState(lastMessage.room);
        break;

      case 'player_list':
        // Only show connected players
        setPlayers(lastMessage.players);
        break;

      case 'team_update':
        setRedScore(lastMessage.teams.red.score);
        setBlueScore(lastMessage.teams.blue.score);
        break;

      case 'countdown_started':
        setRoomStatus('countdown');
        setCountdown({
          roundIndex: lastMessage.roundIndex,
          endsAt: lastMessage.endsAt,
        });
        setCurrentRound(undefined);
        break;

      case 'round_started':
        setRoomStatus('in_round');
        setCountdown(undefined);
        setCurrentRound({
          roundIndex: lastMessage.roundIndex,
          remainingWords: 10, // Start with 10
          endsAt: lastMessage.endsAt,
          startedAt: lastMessage.now,
          targetListId: lastMessage.targetListId,
          targetListName: lastMessage.targetListName,
        });
        break;

      case 'word_claimed':
        // Update the player who claimed the word
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) =>
            p.id === lastMessage.byPlayerId ? { ...p, score: lastMessage.playerScore } : p
          )
        );

        // Update your own score if it was you
        if (you && lastMessage.byPlayerId === you.id) {
          setYou({ ...you, score: lastMessage.playerScore });
        }

        // Update team score based on the player's team
        const claimingPlayer = players.find((p) => p.id === lastMessage.byPlayerId);
        if (claimingPlayer?.team === 'red') {
          setRedScore(lastMessage.teamScore);
        } else if (claimingPlayer?.team === 'blue') {
          setBlueScore(lastMessage.teamScore);
        }

        // Decrement remaining words
        setCurrentRound((prev) =>
          prev ? { ...prev, remainingWords: prev.remainingWords - 1 } : undefined
        );
        break;

      case 'round_ended':
        setRoomStatus('intermission');
        setRedScore(lastMessage.summary.teamScores.find((t) => t.team === 'red')?.score || 0);
        setBlueScore(lastMessage.summary.teamScores.find((t) => t.team === 'blue')?.score || 0);
        break;

      case 'game_ended':
        setRoomStatus('finished_game');
        setGameSummary(lastMessage.summary);
        break;

      case 'chat':
        setMessages((prev) => [
          ...prev,
          {
            id: `${lastMessage.fromPlayerId}-${lastMessage.at}`,
            fromPlayerId: lastMessage.fromPlayerId,
            fromPlayerName: lastMessage.fromPlayerName,
            text: lastMessage.text,
            at: lastMessage.at,
            gotPointsFor: lastMessage.gotPointsFor,
          },
        ]);
        break;

      case 'score_update':
        // Update player scores
        lastMessage.playerScores.forEach((ps) => {
          if (you && ps.playerId === you.id) {
            setYou({ ...you, score: ps.score });
          }
        });
        setRedScore(lastMessage.teamScores.find((t) => t.team === 'red')?.score || 0);
        setBlueScore(lastMessage.teamScores.find((t) => t.team === 'blue')?.score || 0);
        break;

      case 'error':
        console.error('Server error:', lastMessage.message);
        break;
    }
  }, [lastMessage]);

  function updateRoomState(room: PublicRoomState) {
    setRoomStatus(room.status);
    setRedScore(room.teams.red.score);
    setBlueScore(room.teams.blue.score);

    if (room.currentRound) {
      setCurrentRound({
        roundIndex: room.currentRound.roundIndex,
        remainingWords: room.currentRound.remainingWords,
        endsAt: room.currentRound.endsAt,
        startedAt: room.currentRound.startedAt,
        targetListId: room.currentRound.targetListId,
        targetListName: room.currentRound.targetListName,
      });
    }
  }

  function joinGame() {
    send({ type: 'hello', name: playerName });
  }

  function sendGuess(text: string) {
    if (!text.trim()) return;
    send({ type: 'guess', text: text.trim() });
  }

  function clearGameSummary() {
    setGameSummary(null);
  }

  // Separate players by team
  const redTeam = players.filter((p) => p.team === 'red');
  const blueTeam = players.filter((p) => p.team === 'blue');

  const value: GameState = {
    connected,
    you,
    playerName,
    roomStatus,
    players,
    redTeam,
    blueTeam,
    redScore,
    blueScore,
    currentRound,
    countdown,
    messages,
    gameSummary,
    clearGameSummary,
    setPlayerName,
    joinGame,
    sendGuess,
    send,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
