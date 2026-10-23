import type { Card, GameState, PlayerCount, SetType, TableState } from './types';
import { createDeck, shuffle } from './mockData';

/** Active (display) value of a card */
export function activeValue(card: Card): number {
  return card.orientation === 'normal' ? card.topValue : card.bottomValue;
}

/**
 * Classify a set of cards.
 * - 'single'  : exactly 1 card
 * - 'match'   : 2+ cards all sharing the same active value
 * - 'run'     : 2+ cards in CONSECUTIVE integer values (no gaps), asc or desc
 *
 * IMPORTANT: Scout runs must be consecutive integers — [4,5,6] is valid, [1,8,9] is NOT.
 */
export function classifySet(cards: Card[]): { type: SetType; valid: boolean } {
  if (cards.length === 0) return { type: 'single', valid: false };
  if (cards.length === 1) return { type: 'single', valid: true };

  const vals = cards.map(activeValue);
  const allSame = vals.every((v) => v === vals[0]);
  if (allSame) return { type: 'match', valid: true };

  // Run: values must be strictly consecutive integers (each step exactly +1 or -1)
  const isAsc  = vals.every((v, i) => i === 0 || v === vals[i - 1] + 1);
  const isDesc = vals.every((v, i) => i === 0 || v === vals[i - 1] - 1);
  if (isAsc || isDesc) return { type: 'run', valid: true };

  return { type: 'run', valid: false };
}

/**
 * Check that the given card ids are from contiguous positions in the hand.
 * Scout rule: you may only play adjacent cards from your hand.
 */
export function areContiguousInHand(hand: Card[], cardIds: string[]): boolean {
  if (cardIds.length === 0) return false;
  const indices = cardIds
    .map((id) => hand.findIndex((c) => c.id === id))
    .filter((i) => i !== -1)
    .sort((a, b) => a - b);
  if (indices.length !== cardIds.length) return false;
  return indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1);
}

/** Kept for backward compat with AI code */
export function isValidShow(cards: Card[]): { valid: boolean; order: 'asc' | 'desc' | null } {
  const { valid, type } = classifySet(cards);
  if (!valid) return { valid: false, order: null };
  if (type === 'single') return { valid: true, order: null };
  if (type === 'match')  return { valid: true, order: null };
  const vals = cards.map(activeValue);
  const isAsc = vals[0] < vals[vals.length - 1];
  return { valid: true, order: isAsc ? 'asc' : 'desc' };
}

/**
 * Scout beating rules:
 * 1. Larger set size ALWAYS beats a smaller set size.
 * 2. Equal size: matching numbers beat runs.
 * 3. Equal size & equal type:
 *    - Run vs Run: the run whose minimum value is higher wins
 *    - Match vs Match: higher value wins.
 * 4. Single card: higher active value beats lower.
 */
export function canBeatActiveSet(newCards: Card[], table: TableState): boolean {
  const { valid: newValid, type: newType } = classifySet(newCards);
  if (!newValid) return false;

  const { activeSet } = table;
  if (activeSet.length === 0) return true;

  // Rule 1: larger set always wins
  if (newCards.length > activeSet.length) return true;
  if (newCards.length < activeSet.length) return false;

  // Equal length from here
  const { valid: tableValid, type: tableType } = classifySet(activeSet);
  if (!tableValid) return true; // table has invalid set (shouldn't happen)

  const newVals   = newCards.map(activeValue);
  const tableVals = activeSet.map(activeValue);

  // Equal-sized matches beat runs.
  if (newType === 'match' && tableType === 'run') return true;
  if (newType === 'run' && tableType === 'match') return false;

  // Runs are compared by their smallest active value, in either orientation.
  if (newType === 'run' && tableType === 'run') {
    return Math.min(...newVals) > Math.min(...tableVals);
  }

  // Rule 3b: match vs match — compare the repeated value
  if (newType === 'match' && tableType === 'match') {
    return newVals[0] > tableVals[0];
  }

  // Single vs single
  return newVals[0] > tableVals[0];
}

/** Deal a fresh round */
export function dealRound(state: GameState): GameState {
  const deck = shuffle(createDeck(state.playerCount));
  const handSizes: Record<PlayerCount, number> = { 3: 12, 4: 11, 5: 9 };
  const handSize = handSizes[state.playerCount];

  const players = state.players.map((p, i) => ({
    ...p,
    hand: deck.slice(handSize * i, handSize * (i + 1)),
    chips: { scout: 0, scoutAndShow: true },
    trophies: [],
    handFlipped: false,
  }));

  return {
    ...state,
    deck: [],
    players,
    table: {
      ...state.table,
      activeSet: [],
      activeSetType: null,
      activeSetOwnerIndex: -1,
      currentTurnIndex: (state.table.startingPlayerIndex + 1) % state.playerCount,
      startingPlayerIndex: (state.table.startingPlayerIndex + 1) % state.playerCount,
      consecutiveScouts: 0,
      phase: 'pickingUp',
      roundEndReason: null,
    },
    actionLog: [
      ...state.actionLog,
      {
        id: `log-deal-${state.table.round + 1}`,
        turnIndex: 0,
        playerName: 'Game',
        action: 'deal',
        description: `Round ${state.table.round + 1} started. Cards dealt.`,
      },
    ],
    lastToast: null,
  };
}

/**
 * Score a round.
 * Each player: trophies.length + chips.scout - hand.length
 */
export function scoreRound(state: GameState): GameState {
  const scored = state.players.map((p, index) => {
    const exempt = state.table.roundEndReason === 'lockout' && state.table.activeSetOwnerIndex === index;
    const roundScore = p.trophies.length + p.chips.scout - (exempt ? 0 : p.hand.length);
    return { ...p, score: p.score + roundScore };
  });

  return {
    ...state,
    players: scored,
    table: { ...state.table, phase: state.table.round >= state.playerCount ? 'gameEnd' : 'roundEnd' },
    actionLog: [
      ...state.actionLog,
      {
        id: `log-end-${state.table.round}`,
        turnIndex: state.table.round,
        playerName: 'Game',
        action: 'roundEnd',
        description: `Round ${state.table.round} ended.`,
      },
    ],
    lastToast: `Round ${state.table.round} Complete!`,
  };
}

/** Describe a set of cards for the action log */
export function describeSet(cards: Card[]): string {
  const vals = cards.map(activeValue);
  const { type } = classifySet(cards);
  if (type === 'single') return `[${vals[0]}]`;
  if (type === 'match')  return `Match of ${cards.length}: [${vals.join(', ')}]`;
  return `Run of ${cards.length}: [${vals.join(', ')}]`;
}
