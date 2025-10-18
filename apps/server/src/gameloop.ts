import type { RoundState, RoundSummary, GameSummary, PlayerScore, TeamScore } from '@chaos-game/protocol';
import { room, hasPlayers, hasMinimumPlayers, resetForNewGame } from './room';
import { broadcast } from './broadcast';
import { pickListByIndex, selectTargetWords, getListById } from './wordlists';

const COUNTDOWN_MS = 10_000;
const ROUND_MS = 60_000;
const INTERMISSION_MS = 5_000;
const GRACE_PERIOD_MS = 150;
const IDLE_CHECK_MS = 2_000;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initRound(roundIndex: number): RoundState {
  // Pick list in order based on round index
  const wordList = pickListByIndex(roundIndex);
  const targetWords = selectTargetWords(wordList.id, room.gameNumber, roundIndex);

  const now = Date.now();
  return {
    roundIndex,
    targetListId: wordList.id,
    targetWords,
    claimed: [],
    startedAt: now,
    endsAt: now + ROUND_MS,
  };
}

function computeRoundSummary(round: RoundState): RoundSummary {
  const playerScores: PlayerScore[] = Object.values(room.players)
    .map(p => ({
      playerId: p.id,
      playerName: p.name,
      score: p.score,
    }))
    .sort((a, b) => b.score - a.score);

  const teamScores: TeamScore[] = [
    { team: 'red', score: room.teams.red.score },
    { team: 'blue', score: room.teams.blue.score },
  ];

  return {
    roundIndex: round.roundIndex,
    targetListId: round.targetListId,
    targetWords: round.targetWords,
    claimed: round.claimed,
    playerScores,
    teamScores,
  };
}

function computeGameSummary(): GameSummary {
  const rounds: RoundSummary[] = []; // Would need to track round history

  const finalPlayerScores: PlayerScore[] = Object.values(room.players)
    .map(p => ({
      playerId: p.id,
      playerName: p.name,
      score: p.score,
    }))
    .sort((a, b) => b.score - a.score);

  const finalTeamScores: TeamScore[] = [
    { team: 'red', score: room.teams.red.score },
    { team: 'blue', score: room.teams.blue.score },
  ];

  let winner: 'red' | 'blue' | 'draw' | undefined;
  if (room.teams.red.score > room.teams.blue.score) {
    winner = 'red';
  } else if (room.teams.blue.score > room.teams.red.score) {
    winner = 'blue';
  } else {
    winner = 'draw';
  }

  return {
    gameNumber: room.gameNumber,
    rounds,
    finalPlayerScores,
    finalTeamScores,
    winner,
  };
}

export async function startGameSupervisor(): Promise<void> {
  console.log('🎮 Game supervisor started');

  while (true) {
    if (hasMinimumPlayers(2) && room.status === 'idle') {
      console.log('Starting new game with at least 2 players...');
      resetForNewGame();

      // Run 3 rounds
      for (let roundIndex = 0; roundIndex < 3; roundIndex++) {
        // Countdown phase
        room.status = 'countdown';
        const countdownEndsAt = Date.now() + COUNTDOWN_MS;
        broadcast({
          type: 'countdown_started',
          roundIndex,
          endsAt: countdownEndsAt,
          now: Date.now(),
        });
        console.log(`Countdown for round ${roundIndex}...`);
        await sleep(COUNTDOWN_MS);

        // Check if we still have minimum players during countdown
        if (!hasMinimumPlayers(2)) {
          console.log('Not enough players (need 2), aborting game');
          room.status = 'idle';
          break;
        }

        // Round phase
        const round = initRound(roundIndex);
        room.currentRound = round;
        room.status = 'in_round';
        const listName = getListById(round.targetListId)?.name;
        broadcast({
          type: 'round_started',
          roundIndex: round.roundIndex,
          endsAt: round.endsAt,
          now: Date.now(),
          targetListId: round.targetListId,
          targetListName: listName,
        });
        console.log(`Round ${roundIndex} started with list: ${listName || round.targetListId}`);

        // Wait for round to end (plus grace period)
        await sleep(ROUND_MS + GRACE_PERIOD_MS);

        // Intermission phase
        room.status = 'intermission';
        const roundSummary = computeRoundSummary(round);
        broadcast({
          type: 'round_ended',
          summary: roundSummary,
        });
        console.log(`Round ${roundIndex} ended`);

        room.roundsCompleted++;
        await sleep(INTERMISSION_MS);
      }

      // Game finished
      if (room.roundsCompleted === 3) {
        room.status = 'finished_game';
        const gameSummary = computeGameSummary();
        broadcast({
          type: 'game_ended',
          summary: gameSummary,
        });
        console.log(`Game ${room.gameNumber} finished. Winner: ${gameSummary.winner}`);
        await sleep(5000); // Show results for 5 seconds
      }

      // Reset to idle
      room.status = 'idle';
      console.log('Game complete, returning to idle...');
    }

    await sleep(IDLE_CHECK_MS);
  }
}
