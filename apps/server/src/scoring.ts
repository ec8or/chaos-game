import type { RoundState, ClaimedWord } from '@chaos-game/protocol';

// Normalize text for matching
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract tokens from text
export function extractTokens(s: string): string[] {
  return normalize(s).split(' ').filter(t => t.length > 0);
}

// Score a guess against current round
export function scoreGuess(text: string, round: RoundState): string[] {
  const guessTokens = new Set(extractTokens(text));
  const unclaimed = round.targetWords.filter(w => !round.claimed.some(c => c.word === w));

  const hits: string[] = [];
  for (const word of unclaimed) {
    const wordTokens = extractTokens(word);

    // Check if ALL word tokens are present in the guess
    const allTokensMatch = wordTokens.every(token => guessTokens.has(token));

    if (allTokensMatch) {
      hits.push(word);
    }
  }

  return hits;
}

// Check if message should be rate limited
const playerMessageHistory = new Map<string, number[]>();

export function checkRateLimit(playerId: string): boolean {
  const now = Date.now();
  const history = playerMessageHistory.get(playerId) || [];

  // Keep only messages from last 5 seconds
  const recentMessages = history.filter(t => now - t < 5000);

  if (recentMessages.length >= 8) {
    return false; // Rate limited
  }

  recentMessages.push(now);
  playerMessageHistory.set(playerId, recentMessages);
  return true;
}

// Check for exact repeat within 1 second
const lastMessages = new Map<string, { text: string; timestamp: number }>();

export function checkDuplicate(playerId: string, text: string): boolean {
  const now = Date.now();
  const last = lastMessages.get(playerId);

  if (last && last.text === text && now - last.timestamp < 1000) {
    return true; // Is duplicate
  }

  lastMessages.set(playerId, { text, timestamp: now });
  return false;
}

// Validate message length
export function validateMessageLength(text: string): boolean {
  return text.length <= 200;
}

// Check for dictionary spam (more than 25 tokens)
export function checkDictionarySpam(text: string): boolean {
  const tokens = extractTokens(text);
  return tokens.length > 25;
}
