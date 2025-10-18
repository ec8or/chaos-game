import type { ServerMsg } from '@chaos-game/protocol';
import { room } from './room';
import { sendToPlayer } from './player';

export function broadcast(msg: ServerMsg, excludeConnId?: string): void {
  Object.values(room.players).forEach(player => {
    if (player.connected && player.connId !== excludeConnId) {
      sendToPlayer(player.connId, msg);
    }
  });
}
