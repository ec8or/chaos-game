import type { GameState, RoomListItem, TeamId } from '@chaos-game/protocol';

// Single room for MVP
export const room: GameState = {
  roomId: 'room-1',
  status: 'idle',
  players: {},
  teams: {
    red: { playerIds: [], score: 0 },
    blue: { playerIds: [], score: 0 },
  },
  roundsCompleted: 0,
  gameNumber: 0,
};

export function getRoomList(): RoomListItem[] {
  return [
    {
      id: room.roomId,
      status: room.status,
      players: Object.keys(room.players).length,
    },
  ];
}

export function assignTeam(): TeamId {
  const redCount = room.teams.red.playerIds.length;
  const blueCount = room.teams.blue.playerIds.length;

  if (redCount < blueCount) return 'red';
  if (blueCount < redCount) return 'blue';

  // Tie, pick randomly
  return Math.random() < 0.5 ? 'red' : 'blue';
}

export function hasPlayers(): boolean {
  return Object.values(room.players).some(p => p.connected);
}

export function hasMinimumPlayers(minPlayers: number = 2): boolean {
  return Object.values(room.players).filter(p => p.connected).length >= minPlayers;
}

export function hasMinimumReadyPlayers(minPlayers: number = 2): boolean {
  return Object.values(room.players).filter(p => p.connected && p.ready).length >= minPlayers;
}

export function resetForNewGame(): void {
  room.gameNumber++;
  room.status = 'idle';
  room.roundsCompleted = 0;
  room.currentRound = undefined;

  // Remove disconnected players and reset ready state
  const connectedPlayers: typeof room.players = {};
  Object.values(room.players).forEach(player => {
    if (player.connected) {
      player.score = 0;
      player.ready = false; // Reset ready state for new game
      connectedPlayers[player.id] = player;
    }
  });
  room.players = connectedPlayers;

  // Rebuild team lists
  room.teams.red.playerIds = Object.values(room.players)
    .filter(p => p.team === 'red')
    .map(p => p.id);
  room.teams.blue.playerIds = Object.values(room.players)
    .filter(p => p.team === 'blue')
    .map(p => p.id);

  // Reset scores
  room.teams.red.score = 0;
  room.teams.blue.score = 0;
}
