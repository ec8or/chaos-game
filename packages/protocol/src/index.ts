// Core types
export type TeamId = 'red' | 'blue';

export type RoomStatus = 'idle' | 'countdown' | 'in_round' | 'intermission' | 'finished_game';

// Player types
export interface Player {
  id: string;
  name: string;
  team: TeamId;
  connected: boolean;
  connId: string;
  lastSeenTs: number;
  score: number;
  ready: boolean;
}

export interface PublicPlayer {
  id: string;
  name: string;
  team: TeamId;
  score: number;
  ready: boolean;
}

// Word and round types
export interface ClaimedWord {
  word: string;
  byPlayerId: string;
  atMs: number;
}

export interface RoundState {
  roundIndex: number;
  targetListId: string;
  targetWords: string[];
  claimed: ClaimedWord[];
  startedAt: number;
  endsAt: number;
}

export interface PublicRoundState {
  roundIndex: number;
  targetListId?: string;
  targetListName?: string;
  remainingWords: number;
  claimed: ClaimedWord[];
  startedAt: number;
  endsAt: number;
}

// Team types
export interface Team {
  playerIds: string[];
  score: number;
}

export interface PublicTeams {
  red: { score: number; playerIds: string[] };
  blue: { score: number; playerIds: string[] };
}

// Game state
export interface GameState {
  roomId: string;
  status: RoomStatus;
  players: Record<string, Player>;
  teams: Record<TeamId, Team>;
  currentRound?: RoundState;
  roundsCompleted: number;
  gameNumber: number;
}

export interface PublicRoomState {
  roomId: string;
  status: RoomStatus;
  teams: PublicTeams;
  currentRound?: PublicRoundState;
  roundsCompleted: number;
  gameNumber: number;
}

// Summary types
export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
  claimedAt?: number;
}

export interface TeamScore {
  team: TeamId;
  score: number;
}

export interface RoundSummary {
  roundIndex: number;
  targetListId: string;
  targetWords: string[];
  claimed: ClaimedWord[];
  playerScores: PlayerScore[];
  teamScores: TeamScore[];
}

export interface GameSummary {
  gameNumber: number;
  rounds: RoundSummary[];
  finalPlayerScores: PlayerScore[];
  finalTeamScores: TeamScore[];
  winner?: 'red' | 'blue' | 'draw';
}

// Client to Server messages
export type ClientMsg =
  | { type: 'hello'; name?: string }
  | { type: 'list_rooms' }
  | { type: 'join_room'; roomId: string }
  | { type: 'leave_room' }
  | { type: 'guess'; text: string }
  | { type: 'chat'; text: string }
  | { type: 'ready'; ready: boolean }
  | { type: 'heartbeat' };

// Server to Client messages
export interface RoomListItem {
  id: string;
  status: RoomStatus;
  players: number;
}

export type ServerMsg =
  | { type: 'rooms'; rooms: RoomListItem[] }
  | { type: 'joined'; room: PublicRoomState; you: PublicPlayer }
  | { type: 'left' }
  | { type: 'player_list'; players: PublicPlayer[] }
  | { type: 'team_update'; teams: PublicTeams }
  | { type: 'countdown_started'; roundIndex: number; endsAt: number; now: number }
  | { type: 'round_started'; roundIndex: number; endsAt: number; now: number; targetListId?: string; targetListName?: string }
  | { type: 'word_claimed'; word: string; byPlayerId: string; playerName: string; playerScore: number; teamScore: number }
  | { type: 'score_update'; playerScores: PlayerScore[]; teamScores: TeamScore[] }
  | { type: 'round_ended'; summary: RoundSummary }
  | { type: 'game_ended'; summary: GameSummary }
  | { type: 'chat'; fromPlayerId: string; fromPlayerName: string; text: string; at: number; gotPointsFor?: string[] }
  | { type: 'error'; code: string; message: string }
  | { type: 'ping'; now: number };
