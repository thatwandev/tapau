import type { Card, Player, GameState, Difficulty, PlayerCount } from './types';

/**
 * Build the Scout deck: 45 cards total.
 * Each card combines a unique pair of values from 1 to 10.
 */
export function createDeck(playerCount: PlayerCount): Card[] {
  const cards: Card[] = [];
  let id = 1;
  // The 45 unique pairs from 1–10. Three players remove all nine 10s;
  // four players remove the 9/10 card; five players use the full deck.
  for (let low = 1; low <= 9; low++) {
    for (let high = low + 1; high <= 10; high++) {
      if (playerCount === 3 && high === 10) continue;
      if (playerCount === 4 && low === 9 && high === 10) continue;
      cards.push({
        id: `card-${String(id++).padStart(2, '0')}`,
        topValue: low,
        bottomValue: high,
        orientation: Math.random() < 0.5 ? 'normal' : 'flipped',
      });
    }
  }

  return cards;
}

/** Fisher-Yates shuffle */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Scout hand sizes per player count (45 cards total):
 * 3 players → 12 cards each (nine 10-cards removed)
 * 4 players → 11 cards each (9/10 card removed)
 * 5 players →  9 cards each
 */
const HAND_SIZES: Record<PlayerCount, number> = { 3: 12, 4: 11, 5: 9 };

const AI_NAMES = ['CPU-1', 'CPU-2', 'CPU-3', 'CPU-4'];

function makePlayer(id: string, name: string, hand: Card[], existingScore = 0): Player {
  return {
    id: id as Player['id'],
    name,
    hand,
    chips: { scout: 0, scoutAndShow: true },
    trophies: [],
    score: existingScore,
    handFlipped: false,
  };
}

export function createMockGameState(
  difficulty: Difficulty = 'standard',
  playerCount: PlayerCount = 3,
): GameState {
  const deck = shuffle(createDeck(playerCount));
  const handSize = HAND_SIZES[playerCount];
  const numAI = playerCount - 1; // 1 human + N-1 AI

  // Deal hands: human first, then each AI
  const players: Player[] = [
    makePlayer('human', 'You', deck.slice(0, handSize)),
  ];
  for (let i = 0; i < numAI; i++) {
    players.push(makePlayer('ai', AI_NAMES[i], deck.slice(handSize * (i + 1), handSize * (i + 2))));
  }

  return {
    players,
    table: {
      activeSet: [],
      activeSetType: null,
      activeSetOwnerIndex: -1,
      currentTurnIndex: 0,
      startingPlayerIndex: 0,
      consecutiveScouts: 0,
      round: 1,
      phase: 'pickingUp',
      roundEndReason: null,
    },
    difficulty,
    playerCount,
    deck: [],
    actionLog: [{
      id: 'log-deal-1',
      turnIndex: 0,
      playerName: 'Game',
      action: 'deal',
      description: 'Round 1 started. Cards dealt.',
    }],
    lastToast: null,
    tutorialActive: false,
    tutorialStep: 0,
  };
}
