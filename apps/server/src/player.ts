import type { ServerWebSocket } from 'bun';
import type { ClientMsg, Player, ServerMsg, PublicPlayer, PublicRoomState } from '@chaos-game/protocol';
import { room, assignTeam } from './room';
import { broadcast } from './broadcast';
import {
  checkRateLimit,
  checkDuplicate,
  validateMessageLength,
  checkDictionarySpam,
  scoreGuess
} from './scoring';
import { getListById } from './wordlists';

// Track WebSocket connections
const connections = new Map<string, ServerWebSocket>();

function generateId(): string {
  return crypto.randomUUID();
}

export function getOrCreatePlayer(ws: ServerWebSocket, name?: string): Player {
  // For MVP, always create new player
  // TODO: Add cookie-based reconnection later
  const playerId = generateId();
  const connId = generateId();
  const team = assignTeam();

  const player: Player = {
    id: playerId,
    name: name || `Player${Object.keys(room.players).length + 1}`,
    team,
    connected: true,
    connId,
    lastSeenTs: Date.now(),
    score: 0,
  };

  room.players[playerId] = player;
  room.teams[team].playerIds.push(playerId);
  connections.set(connId, ws);

  // Store connection metadata
  (ws as any).__playerId = playerId;
  (ws as any).__connId = connId;

  return player;
}

export function handlePlayerMessage(ws: ServerWebSocket, msg: ClientMsg): void {
  const playerId = (ws as any).__playerId as string | undefined;

  switch (msg.type) {
    case 'hello': {
      if (playerId) {
        // Already registered
        return;
      }
      const player = getOrCreatePlayer(ws, msg.name);
      sendToPlayer(player.connId, {
        type: 'joined',
        room: getPublicRoomState(),
        you: playerToPublic(player),
      });
      broadcast({
        type: 'player_list',
        players: Object.values(room.players).map(playerToPublic),
      });
      break;
    }

    case 'list_rooms': {
      sendToPlayer((ws as any).__connId, {
        type: 'rooms',
        rooms: [
          {
            id: room.roomId,
            status: room.status,
            players: Object.keys(room.players).length,
          },
        ],
      });
      break;
    }

    case 'join_room': {
      // For MVP with single room, already joined on hello
      if (playerId) {
        const player = room.players[playerId];
        if (player) {
          sendToPlayer(player.connId, {
            type: 'joined',
            room: getPublicRoomState(),
            you: playerToPublic(player),
          });
        }
      }
      break;
    }

    case 'guess': {
      if (!playerId) return;
      // Will be implemented in scoring logic
      handleGuess(playerId, msg.text);
      break;
    }

    case 'chat': {
      if (!playerId) return;
      const player = room.players[playerId];
      if (!player) return;

      broadcast({
        type: 'chat',
        fromPlayerId: player.id,
        fromPlayerName: player.name,
        text: msg.text,
        at: Date.now(),
      });
      break;
    }

    case 'heartbeat': {
      if (playerId) {
        room.players[playerId]!.lastSeenTs = Date.now();
      }
      break;
    }

    default:
      console.warn('Unknown message type:', msg);
  }
}

export function handlePlayerDisconnect(ws: ServerWebSocket): void {
  const playerId = (ws as any).__playerId as string | undefined;
  const connId = (ws as any).__connId as string | undefined;

  if (connId) {
    connections.delete(connId);
  }

  if (playerId && room.players[playerId]) {
    room.players[playerId]!.connected = false;
    broadcast({
      type: 'player_list',
      players: Object.values(room.players).filter(p => p.connected).map(playerToPublic),
    });
  }
}

function handleGuess(playerId: string, text: string): void {
  const player = room.players[playerId];
  if (!player) return;

  // Rate limiting
  if (!checkRateLimit(playerId)) {
    sendToPlayer(player.connId, {
      type: 'error',
      code: 'RATE_LIMIT',
      message: 'Too many messages, slow down'
    });
    return;
  }

  // Check duplicate
  if (checkDuplicate(playerId, text)) {
    return; // Silently ignore
  }

  // Validate length
  if (!validateMessageLength(text)) {
    sendToPlayer(player.connId, {
      type: 'error',
      code: 'MESSAGE_TOO_LONG',
      message: 'Message too long (max 200 chars)'
    });
    return;
  }

  // Check dictionary spam
  if (checkDictionarySpam(text)) {
    sendToPlayer(player.connId, {
      type: 'error',
      code: 'DICTIONARY_SPAM',
      message: 'Too many words in one message'
    });
    return;
  }

  let gotPointsFor: string[] = [];

  // Score if in round
  if (room.status === 'in_round' && room.currentRound) {
    const now = Date.now();

    // Check if within time window (with grace period)
    if (now <= room.currentRound.endsAt + 150) {
      const hits = scoreGuess(text, room.currentRound);

      for (const word of hits) {
        // Mark as claimed
        room.currentRound.claimed.push({
          word,
          byPlayerId: playerId,
          atMs: now - room.currentRound.startedAt,
        });

        // Update scores
        player.score++;
        room.teams[player.team]!.score++;
        gotPointsFor.push(word);

        // Broadcast word claimed
        broadcast({
          type: 'word_claimed',
          word,
          byPlayerId: player.id,
          playerName: player.name,
          playerScore: player.score,
          teamScore: room.teams[player.team]!.score,
        });
      }
    }
  }

  // Broadcast chat message
  broadcast({
    type: 'chat',
    fromPlayerId: player.id,
    fromPlayerName: player.name,
    text,
    at: Date.now(),
    gotPointsFor: gotPointsFor.length > 0 ? gotPointsFor : undefined,
  });
}

export function sendToPlayer(connId: string, msg: ServerMsg): void {
  const ws = connections.get(connId);
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(msg));
  }
}

function playerToPublic(player: Player): PublicPlayer {
  return {
    id: player.id,
    name: player.name,
    team: player.team,
    score: player.score,
  };
}

function getPublicRoomState(): PublicRoomState {
  return {
    roomId: room.roomId,
    status: room.status,
    teams: {
      red: {
        score: room.teams.red.score,
        playerIds: room.teams.red.playerIds,
      },
      blue: {
        score: room.teams.blue.score,
        playerIds: room.teams.blue.playerIds,
      },
    },
    currentRound: room.currentRound ? {
      roundIndex: room.currentRound.roundIndex,
      targetListId: room.currentRound.targetListId,
      targetListName: getListById(room.currentRound.targetListId)?.name,
      remainingWords: room.currentRound.targetWords.length - room.currentRound.claimed.length,
      claimed: room.currentRound.claimed,
      startedAt: room.currentRound.startedAt,
      endsAt: room.currentRound.endsAt,
    } : undefined,
    roundsCompleted: room.roundsCompleted,
    gameNumber: room.gameNumber,
  };
}
