import { getRoomList } from './room';

export function handleHTTPRequest(req: Request): Response {
  const url = new URL(req.url);

  // Health check
  if (url.pathname === '/healthz' || url.pathname === '/health') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Rooms list
  if (url.pathname === '/rooms') {
    const rooms = getRoomList();
    return new Response(JSON.stringify({ rooms }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Not Found', { status: 404 });
}
