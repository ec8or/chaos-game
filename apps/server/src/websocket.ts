import type { ServerWebSocket } from 'bun';
import type { ClientMsg } from '@chaos-game/protocol';
import { getOrCreatePlayer, handlePlayerMessage, handlePlayerDisconnect } from './player';

export const handleWebSocket = {
  onOpen(ws: ServerWebSocket) {
    console.log('WebSocket connection opened');
    // Player will be created on first message (hello)
  },

  onMessage(ws: ServerWebSocket, message: string | Buffer) {
    try {
      const msg = JSON.parse(message.toString()) as ClientMsg;
      handlePlayerMessage(ws, msg);
    } catch (error) {
      console.error('Failed to parse message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        code: 'INVALID_MESSAGE',
        message: 'Invalid message format'
      }));
    }
  },

  onClose(ws: ServerWebSocket) {
    handlePlayerDisconnect(ws);
    console.log('WebSocket connection closed');
  },
};
