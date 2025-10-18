import type { ServerWebSocket } from 'bun';
import { handleHTTPRequest } from './http';
import { handleWebSocket } from './websocket';
import { startGameSupervisor } from './gameloop';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// HTTP server
const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    // Handle WebSocket upgrade
    if (req.headers.get('upgrade') === 'websocket') {
      const upgraded = server.upgrade(req);
      if (upgraded) {
        return undefined;
      }
      return new Response('WebSocket upgrade failed', { status: 500 });
    }

    // Handle HTTP requests
    return handleHTTPRequest(req);
  },
  websocket: {
    open(ws) {
      handleWebSocket.onOpen(ws);
    },
    message(ws, message) {
      handleWebSocket.onMessage(ws, message);
    },
    close(ws) {
      handleWebSocket.onClose(ws);
    },
  },
});

console.log(`🎮 Chaos Game server running on http://localhost:${PORT}`);
console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);

// Start the game loop
startGameSupervisor();
