# Deployment Guide for Coolify

## Option 1: Separate Resources (Recommended)

Deploy the server and client as two separate Coolify resources.

### Server Deployment

1. **Create new resource in Coolify**
   - Type: Dockerfile
   - Repository: Your chaos-game repo
   - Branch: main (or your deployment branch)

2. **Configuration**
   - **Dockerfile Location**: `apps/server/Dockerfile`
   - **Build Context**: `.` (root of repo)
   - **Port**: `8080`
   - **Health Check Path**: `/healthz`

3. **Environment Variables**
   ```
   PORT=8080
   NODE_ENV=production
   ```

4. **Domain**
   - Set up your domain (e.g., `api.chaos-game.yourdomain.com`)
   - Enable WebSocket support in Coolify (important!)

### Client Deployment

1. **Create new resource in Coolify**
   - Type: Dockerfile
   - Repository: Your chaos-game repo
   - Branch: main (or your deployment branch)

2. **Configuration**
   - **Dockerfile Location**: `apps/client/Dockerfile`
   - **Build Context**: `.` (root of repo)
   - **Port**: `80`

3. **Environment Variables**
   ```
   VITE_WS_URL=wss://api.chaos-game.yourdomain.com
   ```

   Note: Use `wss://` for secure WebSocket and your actual server domain.

4. **Build Arguments** (if needed)
   ```
   VITE_WS_URL=wss://api.chaos-game.yourdomain.com
   ```

5. **Domain**
   - Set up your domain (e.g., `chaos-game.yourdomain.com`)

---

## Option 2: Docker Compose (Single Deployment)

If you prefer to deploy both in one go, use docker-compose.

### Setup

1. **Create new resource in Coolify**
   - Type: Docker Compose
   - Repository: Your chaos-game repo

2. **Configuration**
   - **Compose File**: `docker-compose.prod.yml`

3. **Environment Variables**
   ```
   SERVER_DOMAIN=api.chaos-game.yourdomain.com
   CLIENT_DOMAIN=chaos-game.yourdomain.com
   ```

4. **Domains**
   - Server: `api.chaos-game.yourdomain.com` → Port 8080
   - Client: `chaos-game.yourdomain.com` → Port 80

---

## Important Notes

### WebSocket Support
- Make sure to enable **WebSocket support** for the server in Coolify
- The server needs to handle WebSocket upgrade requests
- Use `wss://` (secure WebSocket) in production

### CORS (if needed)
If you get CORS errors, you may need to add CORS headers to the server. The WebSocket connection should work fine, but HTTP endpoints might need it.

### Health Checks
- Server health check: `GET /healthz`
- Returns: `{"status":"ok"}`

### Scaling Considerations
- This MVP uses in-memory storage (single room, single process)
- For multiple instances, you'd need Redis for shared state
- Current setup works great for one instance with many players

### Build Times
- Server build: ~2-3 minutes (includes Bun install + build)
- Client build: ~3-4 minutes (includes pnpm install + Vite build)

---

## Testing Deployment

After deployment:

1. **Test Server**
   ```bash
   curl https://api.chaos-game.yourdomain.com/healthz
   # Should return: {"status":"ok"}

   curl https://api.chaos-game.yourdomain.com/rooms
   # Should return: {"rooms":[{"id":"room-1","status":"idle","players":0}]}
   ```

2. **Test Client**
   - Visit: https://chaos-game.yourdomain.com
   - Should see the join screen
   - Enter name and join
   - Check browser console for WebSocket connection

3. **Test WebSocket**
   - Open browser DevTools → Network → WS tab
   - Should see WebSocket connection to your server
   - Try guessing words in a game

---

## Troubleshooting

### WebSocket Connection Failed
- Check that WebSocket is enabled in Coolify for the server
- Verify you're using `wss://` (not `ws://`) in production
- Check server logs for connection attempts

### Build Failures
- **Server**: Make sure Bun is available in the Docker image (we use `oven/bun:1`)
- **Client**: Check that all dependencies install correctly
- Look for pnpm workspace resolution issues

### Client Can't Connect to Server
- Verify `VITE_WS_URL` environment variable is set correctly
- Check that both domains are accessible
- Verify CORS settings if you get CORS errors

### 404 on Client Routes
- nginx.conf should handle SPA routing (try_files directive)
- Make sure nginx.conf is copied correctly in Dockerfile

---

## Environment Variables Reference

### Server
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 8080 | Server port |
| NODE_ENV | No | development | Environment mode |

### Client
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_WS_URL | Yes | ws://localhost:8080 | WebSocket server URL |

---

## Quick Deploy Checklist

- [ ] Push code to Git repository
- [ ] Create server resource in Coolify
  - [ ] Set Dockerfile location: `apps/server/Dockerfile`
  - [ ] Set port: 8080
  - [ ] Enable WebSocket support
  - [ ] Set domain
- [ ] Create client resource in Coolify
  - [ ] Set Dockerfile location: `apps/client/Dockerfile`
  - [ ] Set port: 80
  - [ ] Set VITE_WS_URL environment variable
  - [ ] Set domain
- [ ] Deploy both resources
- [ ] Test connections
- [ ] Play the game!

🎮 Have fun!
