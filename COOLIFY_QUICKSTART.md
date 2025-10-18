# Coolify Quick Start

## Recommended: Two Separate Resources

### 1. Deploy Server

**Create Resource:**
- Type: `Dockerfile`
- Dockerfile: `apps/server/Dockerfile`
- Build Context: `.` (root)
- Port: `8080`

**Environment Variables:**
```
PORT=8080
NODE_ENV=production
```

**Settings:**
- ✅ Enable WebSocket Support
- Health Check: `/healthz`
- Domain: `api.chaos-game.yourdomain.com`

---

### 2. Deploy Client

**Create Resource:**
- Type: `Dockerfile`
- Dockerfile: `apps/client/Dockerfile`
- Build Context: `.` (root)
- Port: `80`

**Build Arguments:**
```
VITE_WS_URL=wss://api.chaos-game.yourdomain.com
```

**Settings:**
- Domain: `chaos-game.yourdomain.com`

---

## Test Deployment

```bash
# Test server
curl https://api.chaos-game.yourdomain.com/healthz

# Visit client
open https://chaos-game.yourdomain.com
```

---

## Key Points

- ⚠️ **Must enable WebSocket** for server in Coolify
- 🔒 Use `wss://` (not `ws://`) for production WebSocket URL
- 📦 Build time: ~5-7 minutes total
- 🎮 Game ready after both deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details.
