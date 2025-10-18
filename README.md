# Chaos Game

A fast-paced multiplayer word-claim game where teams compete to find and claim target words in real-time.

## Project Structure

This is a monorepo using pnpm workspaces and Turborepo:

```
chaos-game/
├── apps/
│   ├── server/          # WebSocket game server (Bun + TypeScript)
│   └── client/          # React web client (Vite + React + TypeScript)
├── packages/
│   ├── protocol/        # Shared message types
│   ├── tsconfig/        # Shared TypeScript configs
│   └── eslint-config/   # Shared ESLint configs
```

## Prerequisites

- [Bun](https://bun.sh/) >= 1.1.0 (for server)
- [pnpm](https://pnpm.io/) >= 9.0.0 (for package management)
- Node.js >= 20.x (for build tools)

## Getting Started

### 1. Install Bun (Required for Server)

The server uses Bun for fast WebSocket performance.

**macOS/Linux (Homebrew - Recommended):**
```bash
brew install oven-sh/bun/bun
```

**macOS/Linux/WSL (Universal installer):**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Build Protocol Package

```bash
pnpm --filter @chaos-game/protocol build
```

This only needs to be done once, or when protocol types change.

### 4. Run Development Servers

#### Option A: Run everything with Turbo (recommended)

```bash
pnpm dev
```

This starts both the server (port 8080) and client (port 3000) in parallel.

#### Option B: Run individually

Terminal 1 - Server:
```bash
pnpm --filter @chaos-game/server dev
```

Terminal 2 - Client:
```bash
pnpm --filter @chaos-game/client dev
```

### 4. Access the Game

- **Client**: http://localhost:3000
- **Server**: http://localhost:8080
- **WebSocket**: ws://localhost:8080

## Game Rules

1. **Teams**: Players are automatically assigned to Red or Blue team
2. **Rounds**: Each game has 3 rounds of 60 seconds each
3. **Objective**: Type target words to claim them for your team
4. **Scoring**: First player to type a target word claims it (+1 point for player and team)
5. **Winner**: Team with the highest score after 3 rounds wins

## Development Commands

### Root Level

```bash
# Run all apps in development
pnpm dev

# Build all packages and apps
pnpm build

# Run type checking across all packages
pnpm typecheck

# Run linting across all packages
pnpm lint

# Run tests across all packages
pnpm test
```

### Server Specific

```bash
# Development mode with auto-reload
pnpm --filter @chaos-game/server dev

# Build for production
pnpm --filter @chaos-game/server build

# Start production server
pnpm --filter @chaos-game/server start

# Type check
pnpm --filter @chaos-game/server typecheck
```

### Client Specific

```bash
# Development mode with hot reload
pnpm --filter @chaos-game/client dev

# Build for production
pnpm --filter @chaos-game/client build

# Preview production build
pnpm --filter @chaos-game/client preview

# Type check
pnpm --filter @chaos-game/client typecheck
```

## Architecture

### Server (`apps/server`)

- **Runtime**: Bun (for fast WebSocket performance)
- **WebSocket Server**: Native Bun WebSocket API
- **Game Loop**: Single-process supervisor managing game state
- **Storage**: In-memory (JSON files for word lists)
- **Features**:
  - Real-time word matching and scoring
  - Rate limiting (8 messages per 5 seconds)
  - Anti-cheat measures (duplicate detection, length validation)
  - Seeded word shuffling for reproducibility

### Client (`apps/client`)

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Features** (to be implemented):
  - WebSocket connection manager
  - Real-time game state updates
  - Team-based UI
  - Chat and guess input
  - Timer and score display

### Protocol (`packages/protocol`)

Shared TypeScript types for client-server communication:
- Game state types
- Message schemas (ClientMsg, ServerMsg)
- Player and team types

## Environment Variables

### Server

Create `apps/server/.env`:

```env
PORT=8080
```

### Client

Create `apps/client/.env`:

```env
VITE_WS_URL=ws://localhost:8080
```

## Word Lists

Word lists are stored in `apps/server/src/lists/` as JSON files:

- `animals.json`
- `fruits.json`
- `cities.json`
- `colors.json`
- `verbs.json`

Each list contains 50-100+ words. The server randomly selects a list and picks 10 words per round.

## Next Steps

- [ ] Implement client WebSocket connection manager
- [ ] Build client UI components (Lobby, Room, Chat)
- [ ] Add visual feedback for word claims
- [ ] Implement reconnection logic
- [ ] Add sound effects and animations
- [ ] Deploy to production

## Tech Stack

- **Language**: TypeScript
- **Server**: Bun, WebSocket API
- **Client**: React, Vite
- **Build**: Turborepo, pnpm workspaces
- **Linting**: ESLint
- **Formatting**: Prettier

## License

MIT
