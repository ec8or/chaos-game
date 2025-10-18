# Game summary

Fast word-claim game in timed rounds. Server chooses a list, trims to 10 target words, runs a countdown, then a 60 second round. First player to say a target word claims it and earns 1 point. Three rounds per game. Highest team score wins. Also track top players.

# Tech choice

WebSockets for realtime. HTTP for discovery and health. Node or Bun with TypeScript. In-memory store for MVP. Optional Redis later.

---

# Server

## Process model

Single process for MVP:

1. Create one room on boot: `room-1`
2. If at least one player is connected and no round running, start a game loop
3. Loop runs forever

Later: one room per process, or shared Redis with multiple stateless workers.

## Data model

```ts
type TeamId = "red" | "blue";

type RoomStatus = "idle" | "countdown" | "in_round" | "intermission" | "finished_game";

interface Player {
  id: string;               // UUID
  name: string;             // simple display name
  team: TeamId;
  connected: boolean;
  connId: string;           // websocket id
  lastSeenTs: number;
  score: number;            // per game
}

interface ClaimedWord {
  word: string;
  byPlayerId: string;
  atMs: number;             // ms since round start
}

interface RoundState {
  roundIndex: number;       // 0..2
  targetListId: string;     // source list id
  targetWords: string[];    // length 10
  claimed: ClaimedWord[];   // claimed words this round
  startedAt: number;        // epoch ms
  endsAt: number;           // epoch ms
}

interface GameState {
  roomId: string;
  status: RoomStatus;
  players: Record<string, Player>;
  teams: Record<TeamId, { playerIds: string[]; score: number }>;
  currentRound?: RoundState;
  roundsCompleted: number;
  gameNumber: number;
}
```

## Timers

* Idle tick: check every 2 seconds if players are present, then start a game
* Countdown: 10 seconds
* Round: 60 seconds
* Intermission between rounds: 5 seconds
* Three rounds per game

All timing uses server time. Clients receive `now` and `endsAt` to render their own countdown.

## Team assignment

On join, put the player on the team with fewer players. Break ties randomly.

## Word selection

* `pickRandomList()`: choose a list id from your catalog
* Load full list, shuffle with seed, trim to 10 unique words
* Seed the shuffle with `gameNumber:roundIndex` for reproducibility

Normalization for matching:

* Lowercase
* Strip punctuation
* Collapse whitespace
* Simple stemming optional, but not required for MVP

A word can be claimed once per round. First match wins.

## Scoring

* Player who first includes a target word in a message earns 1 point
* Their team earns 1 point
* If a message includes several unclaimed target words, award one point per unique word
* No points after `endsAt`

## Anti-cheat and fairness

* Rate limit guesses to 8 messages per 5 seconds per player. If exceeded, ignore until back under limit
* Ignore exact repeats from same player within one second
* Ignore messages longer than 200 chars
* Profanity filter on chat echo, but do not filter for matching logic except to strip punctuation
* Late delivery window: accept messages that reach server up to 150 ms after `endsAt` and were stamped by server before the grace cutoff. Keeps it fair with small jitter

## Game loop pseudocode

```ts
while (true) {
  if (room.hasPlayers() && room.status === "idle") {
    room.resetForNewGame();
    broadcast("game_started", payload);
    for (roundIndex of [0,1,2]) {
      room.status = "countdown";
      broadcast("countdown_started", { roundIndex, durationMs: 10_000 });
      await sleep(10_000);

      const round = initRound(roundIndex); // picks list, targetWords, sets timers
      room.currentRound = round;
      room.status = "in_round";
      broadcast("round_started", publicRoundState(round));

      await waitUntil(round.endsAt + 150); // grace period

      room.status = "intermission";
      const roundSummary = computeRoundSummary(room);
      broadcast("round_ended", roundSummary);

      room.roundsCompleted++;
      await sleep(5_000);
    }

    room.status = "finished_game";
    const gameSummary = computeGameSummary(room);
    broadcast("game_ended", gameSummary);

    // Auto reset to idle. Scores persist only for the finished game summary.
    room.prepareForIdle();
  }

  await sleep(2_000);
}
```

## Message schema

Client to server

```ts
type ClientMsg =
  | { type: "hello", name?: string }                        // optional display name
  | { type: "list_rooms" }
  | { type: "join_room", roomId: string }
  | { type: "leave_room" }
  | { type: "guess", text: string }                         // doubles as chat
  | { type: "chat", text: string }
  | { type: "heartbeat" };
```

Server to client

```ts
type ServerMsg =
  | { type: "rooms", rooms: Array<{ id: string, status: RoomStatus, players: number }> }
  | { type: "joined", room: PublicRoomState, you: PublicPlayer }
  | { type: "left" }
  | { type: "player_list", players: PublicPlayer[] }
  | { type: "team_update", teams: PublicTeams }
  | { type: "countdown_started", roundIndex: number, endsAt: number, now: number }
  | { type: "round_started", roundIndex: number, endsAt: number, now: number }
  | { type: "word_claimed", word: string, byPlayerId: string, playerScore: number, teamScore: number }
  | { type: "score_update", playerScores: Score[], teamScores: TeamScore[] }
  | { type: "round_ended", summary: RoundSummary }
  | { type: "game_ended", summary: GameSummary }
  | { type: "chat", fromPlayerId: string, text: string, at: number, gotPointsFor?: string[] }
  | { type: "error", code: string, message: string }
  | { type: "ping", now: number };
```

HTTP

* `GET /rooms` returns same shape as `rooms`
* `GET /healthz` returns 200

## Word match algorithm

```ts
function normalize(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function extractTokens(s: string): string[] {
  return normalize(s).split(" ");
}

function scoreGuess(text: string, round: RoundState) {
  const tokens = new Set(extractTokens(text));
  const unclaimed = new Set(round.targetWords.filter(w =>
     !round.claimed.some(c => c.word === w)
  ));
  const hits: string[] = [];
  for (const w of unclaimed) {
    if (tokens.has(normalize(w))) hits.push(w);
  }
  return hits;
}
```

On each `guess`:

1. If not in `in_round`, ignore
2. Check rate limits
3. Compute `hits`
4. For each hit: mark claimed, update player and team scores, broadcast `word_claimed`
5. Broadcast the chat message with `gotPointsFor` for transparency

## Ties and end of game

* If team scores tie after round 3, call it a draw
* Still show top three players by score and earliest claim timestamp as tie breaker

## Reconnects

* On WebSocket reconnect, if `playerId` cookie is present, resume the same player
* If missing, create a new player identity

---

# Client

## Views

1. Lobby

   * List the single room and player count
   * Join button

2. Room

   * Header with team scores and round timer
   * Center panel: chat stream, show guess lines, and badge when someone scores
   * Right panel: players grouped by team with per player score
   * Footer input: one text input for guesses that also functions as chat

3. Mid-round join

   * On join, receive `PublicRoomState` with current round, timer, team assignment, and claimed words
   * Client renders the remaining target count but never shows the words

## UX rules

* Press Enter to send guess
* Show “claimed” toasts with the word and the winner
* Show a small target counter: “Targets remaining: 6”
* When you claim a word, briefly highlight your name and add +1 chip

## Team join logic

* Client sends `join_room`
* Server picks team with fewer players, returns `joined` with `you.team`

---

# Content and lists

For MVP

* Hardcode 5 to 10 lists in JSON files
* Examples: “Animals”, “Fruits”, “Cities”, “Verbs”, “Colors”
* Each list can have 50 to 200 entries
* On selection, shuffle and pick 10

Filtering

* Maintain a banned list for profanity
* Server refuses target words that match banned list

---

# Scaling plan

Short term

* Keep state in process
* Persist only current game and last summary to disk for debugging

Medium term

* Put room state in Redis
* PubSub channels for events
* Multiple stateless websocket workers behind a sticky load balancer

---

# Security and abuse controls

* Simple JWT or signed cookie for playerId
* Per IP and per player rate limits
* Drop messages that look like pasted dictionaries: more than 25 tokens triggers cooldown
* Optional “dictionary” mode later with one guess per second per player

---

# Observability

* Log events: round start, claim, round end, disconnect
* Prometheus or simple counters on HTTP: active players, messages per second, claims per round, dropped messages

---

# Edge cases

* Round ends while processing a guess: apply grace window then stop
* All 10 words claimed early: end round immediately
* No players in room during countdown: abort and return to idle
* Player disconnect during scoring: still keep their points
* Duplicate claim race: server orders by arrival time, first wins

---

# Test plan

Unit

* Normalization and matching
* Claim once per word
* Multiple hits in one message
* Team assignment fairness

Integration

* Join mid-round receives correct timer and state
* Round end summary is correct
* Rate limits drop excess messages

Load

* 200 clients with 2 guesses per second each
* Ensure no timer drift larger than 100 ms per minute

---

# Minimal implementation sketch

Server bootstrap

```ts
import { WebSocketServer } from "ws";
import http from "http";

const wss = new WebSocketServer({ noServer: true });
const server = http.createServer((req, res) => { /* rooms and health */ });
server.on("upgrade", (req, socket, head) => { wss.handleUpgrade(req, socket, head, ws => onSocket(ws, req)); });
server.listen(8080);
```

Room and loop

```ts
const room = createRoom("room-1");
startGameSupervisor(room); // runs the pseudocode loop
```

Handlers

```ts
function onSocket(ws, req) {
  const connId = genId();
  const player = attachOrCreatePlayer(ws, req, connId);
  ws.on("message", raw => handleClientMsg(player, raw.toString()));
  ws.on("close", () => handleDisconnect(player));
}
```

---

# Open questions to be decided later

1. Do you want to show the list category name to players
   Suggestion: show it, keeps rounds varied and fun.

2. Should repeating an already claimed word yield any feedback
   Suggestion: show “already claimed” in the sender’s client only.

3. Should you allow team chat
   Suggestion: not in MVP. Keep a single stream.

4. Do you want a password on the room for friends
   Suggestion: optional query param later.

