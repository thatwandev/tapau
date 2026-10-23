import type { GameState, Card, Orientation } from './types';
import { activeValue, isValidShow, canBeatActiveSet } from './engine';

type ScoutPlan = {
  tableCardIndex: number;
  handInsertIndex: number;
  scoutedOrientation: Orientation;
  hand: Card[];
};

export type AIMove =
  | { action: 'show'; cards: Card[] }
  | ({ action: 'scout' } & Omit<ScoutPlan, 'hand'>)
  | ({ action: 'scoutAndShow'; cards: Card[] } & Omit<ScoutPlan, 'hand'>);

function findValidSets(hand: Card[], table: GameState['table']): Card[][] {
  const sets: Card[][] = [];
  for (let start = 0; start < hand.length; start++) {
    for (let end = start + 1; end <= hand.length; end++) {
      const subset = hand.slice(start, end);
      if (isValidShow(subset).valid && canBeatActiveSet(subset, table)) sets.push(subset);
    }
  }
  return sets;
}

function getScoutPlans(hand: Card[], table: GameState['table']): ScoutPlan[] {
  if (table.activeSet.length === 0) return [];
  const endIndices = table.activeSet.length === 1 ? [0] : [0, table.activeSet.length - 1];
  const plans: ScoutPlan[] = [];
  for (const tableCardIndex of endIndices) {
    const card = table.activeSet[tableCardIndex];
    for (let handInsertIndex = 0; handInsertIndex <= hand.length; handInsertIndex++) {
      for (const scoutedOrientation of ['normal', 'flipped'] as const) {
        const scouted = { ...card, orientation: scoutedOrientation };
        plans.push({
          tableCardIndex,
          handInsertIndex,
          scoutedOrientation,
          hand: [...hand.slice(0, handInsertIndex), scouted, ...hand.slice(handInsertIndex)],
        });
      }
    }
  }
  return plans;
}

function strongestSet(sets: Card[][]): Card[] | null {
  return sets.reduce<Card[] | null>((best, candidate) => {
    if (!best || candidate.length > best.length) return candidate;
    if (candidate.length < best.length) return best;
    const candidateFloor = Math.min(...candidate.map(activeValue));
    const bestFloor = Math.min(...best.map(activeValue));
    return candidateFloor > bestFloor ? candidate : best;
  }, null);
}

function comparePlans(a: ScoutPlan, b: ScoutPlan, table: GameState['table']): number {
  const hypotheticalTable = (plan: ScoutPlan): GameState['table'] => ({
    ...table,
    activeSet: table.activeSet.filter((_, i) => i !== plan.tableCardIndex),
  });
  const aSet = strongestSet(findValidSets(a.hand, hypotheticalTable(a)));
  const bSet = strongestSet(findValidSets(b.hand, hypotheticalTable(b)));
  const aLength = aSet?.length ?? 0;
  const bLength = bSet?.length ?? 0;
  if (aLength !== bLength) return bLength - aLength;
  const aFloor = aSet ? Math.min(...aSet.map(activeValue)) : 0;
  const bFloor = bSet ? Math.min(...bSet.map(activeValue)) : 0;
  return bFloor - aFloor;
}

function easyMove(state: GameState, playerIndex: number): AIMove {
  const hand = state.players[playerIndex].hand;
  const sets = findValidSets(hand, state.table);
  if (sets.length > 0) return { action: 'show', cards: sets[Math.floor(Math.random() * sets.length)] };
  const plans = getScoutPlans(hand, state.table);
  const plan = plans[Math.floor(Math.random() * plans.length)];
  if (!plan) throw new Error('No legal move is available to the AI.');
  return {
    action: 'scout',
    tableCardIndex: plan.tableCardIndex,
    handInsertIndex: plan.handInsertIndex,
    scoutedOrientation: plan.scoutedOrientation,
  };
}

function standardMove(state: GameState, playerIndex: number): AIMove {
  const hand = state.players[playerIndex].hand;
  const best = strongestSet(findValidSets(hand, state.table));
  if (best) return { action: 'show', cards: best };
  const plans = getScoutPlans(hand, state.table).sort((a, b) => comparePlans(a, b, state.table));
  const plan = plans[0];
  if (!plan) throw new Error('No legal move is available to the AI.');
  return {
    action: 'scout',
    tableCardIndex: plan.tableCardIndex,
    handInsertIndex: plan.handInsertIndex,
    scoutedOrientation: plan.scoutedOrientation,
  };
}

function hardMove(state: GameState, playerIndex: number): AIMove {
  const player = state.players[playerIndex];
  const sets = findValidSets(player.hand, state.table);
  const bestNormal = strongestSet(sets);
  const normalValue = bestNormal ? bestNormal.length * bestNormal.length + (bestNormal.length === player.hand.length ? 100 : 0) : -1;

  if (player.chips.scoutAndShow && state.table.activeSet.length > 0) {
    const plans = getScoutPlans(player.hand, state.table);
    const combinations = plans.flatMap((plan) => {
      const tableAfterScout = { ...state.table, activeSet: state.table.activeSet.filter((_, i) => i !== plan.tableCardIndex) };
      return findValidSets(plan.hand, tableAfterScout).map((cards) => ({ plan, cards }));
    });
    const bestCombined = combinations.reduce<typeof combinations[number] | null>((best, candidate) => {
      const score = candidate.cards.length * candidate.cards.length + (candidate.cards.length === planHandLength(candidate.plan) ? 100 : 0);
      if (!best) return candidate;
      const bestScore = best.cards.length * best.cards.length + (best.cards.length === planHandLength(best.plan) ? 100 : 0);
      return score > bestScore ? candidate : best;
    }, null);
    if (bestCombined && bestCombined.cards.length > 0) {
      const combinedValue = bestCombined.cards.length * bestCombined.cards.length + (bestCombined.cards.length === planHandLength(bestCombined.plan) ? 100 : 0);
      if (combinedValue > normalValue) {
        return {
          action: 'scoutAndShow',
          tableCardIndex: bestCombined.plan.tableCardIndex,
          handInsertIndex: bestCombined.plan.handInsertIndex,
          scoutedOrientation: bestCombined.plan.scoutedOrientation,
          cards: bestCombined.cards,
        };
      }
    }
  }

  if (bestNormal) return { action: 'show', cards: bestNormal };
  const plans = getScoutPlans(player.hand, state.table).sort((a, b) => comparePlans(a, b, state.table));
  const plan = plans[0];
  if (!plan) throw new Error('No legal move is available to the AI.');
  return {
    action: 'scout',
    tableCardIndex: plan.tableCardIndex,
    handInsertIndex: plan.handInsertIndex,
    scoutedOrientation: plan.scoutedOrientation,
  };
}

function planHandLength(plan: ScoutPlan): number {
  return plan.hand.length;
}

export function getAIMove(state: GameState, playerIndex: number): AIMove {
  switch (state.difficulty) {
    case 'easy': return easyMove(state, playerIndex);
    case 'hard': return hardMove(state, playerIndex);
    default: return standardMove(state, playerIndex);
  }
}
