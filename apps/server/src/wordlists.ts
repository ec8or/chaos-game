import topicsData from './lists/topics.json';

export interface WordList {
  id: string;
  name: string;
  words: string[];
}

// Convert topics.json to WordList array
const lists: WordList[] = Object.entries(topicsData).map(([id, data]) => ({
  id,
  name: data.name,
  words: data.words,
}));

// Track used lists (will be managed by game loop per game)
const usedListIds = new Set<string>();

export function pickRandomList(excludeIds?: Set<string>): WordList {
  // If we only have one list, return it
  if (lists.length === 1) {
    return lists[0]!;
  }

  // Filter out already used lists in this game
  const availableLists = excludeIds
    ? lists.filter(l => !excludeIds.has(l.id))
    : lists;

  // If all lists have been used, reset and pick from all
  if (availableLists.length === 0) {
    return lists[Math.floor(Math.random() * lists.length)]!;
  }

  return availableLists[Math.floor(Math.random() * availableLists.length)]!;
}

// Seeded shuffle for reproducibility
function seededShuffle<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Simple LCG (Linear Congruential Generator)
  const random = () => {
    hash = (hash * 1664525 + 1013904223) | 0;
    return Math.abs(hash) / 0x7fffffff;
  };

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }

  return arr;
}

export function getListById(listId: string): WordList | undefined {
  return lists.find(l => l.id === listId);
}

export function selectTargetWords(listId: string, gameNumber: number, roundIndex: number): string[] {
  const list = getListById(listId);
  if (!list) {
    throw new Error(`List not found: ${listId}`);
  }

  const seed = `${gameNumber}:${roundIndex}`;
  const shuffled = seededShuffle(list.words, seed);
  return shuffled.slice(0, 10);
}
