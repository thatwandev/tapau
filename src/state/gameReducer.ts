import type { GameState, Difficulty, PlayerCount, ActionLogEntry, Card, Orientation, TableState } from '../game/types';
import {
  classifySet,
  canBeatActiveSet,
  scoreRound,
  dealRound,
  describeSet,
  isValidShow,
  areContiguousInHand,
} from '../game/engine';
import { createMockGameState } from '../game/mockData';
import { getAIMove } from '../game/aiOpponent';

let _logId = 1;
function logId() { return `log-${_logId++}`; }

function addLog(state: GameState, entry: Omit<ActionLogEntry, 'id'>): GameState {
  return {
    ...state,
    actionLog: [...state.actionLog, { ...entry, id: logId() }].slice(-50),
    lastToast: entry.description,
  };
}

function nextTurn(current: number, total: number) {
  return (current + 1) % total;
}

function validSelection(hand: Card[], cardIds: string[], table: TableState): Card[] | null {
  if (cardIds.length === 0 || new Set(cardIds).size !== cardIds.length) return null;
  if (!areContiguousInHand(hand, cardIds)) return null;
  // Preserve the immutable hand order, regardless of the order cards were clicked.
  const ids = new Set(cardIds);
  const selected = hand.filter((card) => ids.has(card.id));
  if (selected.length !== cardIds.length || !isValidShow(selected).valid) return null;
  return canBeatActiveSet(selected, table) ? selected : null;
}

interface ScoutResult {
  players: GameState['players'];
  activeSet: Card[];
  scouted: Card;
  ownerIndex: number;
}

function applyScout(
  state: GameState,
  actorIndex: number,
  tableCardIndex: number,
  handInsertIndex: number,
  orientation: Orientation,
): ScoutResult | null {
  const activeSet = state.table.activeSet;
  if (activeSet.length === 0) return null;
  if (!Number.isInteger(tableCardIndex) || !Number.isInteger(handInsertIndex)) return null;
  if (tableCardIndex < 0 || tableCardIndex >= activeSet.length) return null;
  if (activeSet.length > 1 && tableCardIndex !== 0 && tableCardIndex !== activeSet.length - 1) return null;

  const actor = state.players[actorIndex];
  if (!actor || handInsertIndex < 0 || handInsertIndex > actor.hand.length) return null;

  const scouted = { ...activeSet[tableCardIndex], orientation };
  const remainingActiveSet = activeSet.filter((_, index) => index !== tableCardIndex);
  const newHand = [
    ...actor.hand.slice(0, handInsertIndex),
    scouted,
    ...actor.hand.slice(handInsertIndex),
  ];
  const players = [...state.players];
  const ownerIndex = state.table.activeSetOwnerIndex;
  if (ownerIndex >= 0 && ownerIndex < players.length) {
    players[ownerIndex] = {
      ...players[ownerIndex],
      chips: { ...players[ownerIndex].chips, scout: players[ownerIndex].chips.scout + 1 },
    };
  }
  players[actorIndex] = { ...players[actorIndex], hand: newHand };
  return { players, activeSet: remainingActiveSet, scouted, ownerIndex };
}

function finishShow(
  state: GameState,
  actorIndex: number,
  selected: Card[],
  handAfterShow: Card[],
  playersBeforeShow: GameState['players'],
  cardsToCollect: Card[],
  action: 'show' | 'scoutAndShow',
  description: string,
): GameState {
  const players = [...playersBeforeShow];
  const actor = players[actorIndex];
  players[actorIndex] = {
    ...actor,
    hand: handAfterShow,
    trophies: [...actor.trophies, ...cardsToCollect],
  };

  const { type } = classifySet(selected);
  const roundOver = handAfterShow.length === 0;
  const next = addLog({
    ...state,
    players,
    table: {
      ...state.table,
      activeSet: selected,
      activeSetType: type,
      activeSetOwnerIndex: actorIndex,
      currentTurnIndex: nextTurn(actorIndex, state.players.length),
      consecutiveScouts: 0,
      phase: roundOver ? 'roundEnd' : 'playing',
      roundEndReason: roundOver ? 'emptyHand' : null,
    },
  }, {
    turnIndex: state.table.round,
    playerName: state.players[actorIndex].name,
    action,
    description,
  });
  return roundOver ? scoreRound(next) : next;
}

function executeScout(
  state: GameState,
  actorIndex: number,
  tableCardIndex: number,
  handInsertIndex: number,
  orientation: Orientation,
): GameState {
  const result = applyScout(state, actorIndex, tableCardIndex, handInsertIndex, orientation);
  if (!result) return state;

  const consecutiveScouts = state.table.consecutiveScouts + 1;
  const lockout = consecutiveScouts >= state.players.length - 1;
  const side = tableCardIndex === 0 ? 'left' : 'right';
  const value = result.scouted.orientation === 'normal' ? result.scouted.topValue : result.scouted.bottomValue;
  const ownerName = result.ownerIndex >= 0 ? state.players[result.ownerIndex].name : 'nobody';
  const description = `${state.players[actorIndex].name} SCOUTED the ${side} card [${value}] from the Active Set. ${ownerName} earned +1 Scout Chip.`;
  const next = addLog({
    ...state,
    players: result.players,
    table: {
      ...state.table,
      activeSet: result.activeSet,
      activeSetType: result.activeSet.length > 0 ? classifySet(result.activeSet).type : null,
      currentTurnIndex: nextTurn(actorIndex, state.players.length),
      consecutiveScouts,
      phase: lockout ? 'roundEnd' : 'playing',
      roundEndReason: lockout ? 'lockout' : null,
    },
  }, {
    turnIndex: state.table.round,
    playerName: state.players[actorIndex].name,
    action: 'scout',
    description,
  });
  return lockout ? scoreRound(next) : next;
}

function executeScoutAndShow(
  state: GameState,
  actorIndex: number,
  tableCardIndex: number,
  handInsertIndex: number,
  orientation: Orientation,
  showCardIds: string[],
): GameState {
  if (!state.players[actorIndex]?.chips.scoutAndShow) return state;
  const scout = applyScout(state, actorIndex, tableCardIndex, handInsertIndex, orientation);
  if (!scout) return state;

  const tableAfterScout: TableState = {
    ...state.table,
    activeSet: scout.activeSet,
    activeSetType: scout.activeSet.length > 0 ? classifySet(scout.activeSet).type : null,
  };
  const actorHand = scout.players[actorIndex].hand;
  const selected = validSelection(actorHand, showCardIds, tableAfterScout);
  if (!selected) return state;

  const handAfterShow = actorHand.filter((card) => !new Set(showCardIds).has(card.id));
  const players = [...scout.players];
  players[actorIndex] = {
    ...players[actorIndex],
    chips: { ...players[actorIndex].chips, scoutAndShow: false },
  };

  const value = orientation === 'normal' ? scout.scouted.topValue : scout.scouted.bottomValue;
  const description = `${state.players[actorIndex].name} used SCOUT & SHOW: scouted [${value}] then SHOWED ${describeSet(selected)}.`;
  return finishShow(
    { ...state, table: tableAfterScout },
    actorIndex,
    selected,
    handAfterShow,
    players,
    scout.activeSet,
    'scoutAndShow',
    description,
  );
}

export type GameAction =
  | { type: 'FLIP_HAND' }
  | { type: 'CONFIRM_HAND' }
  | { type: 'SHOW'; cardIds: string[] }
  | { type: 'SCOUT'; tableCardIndex: number; handInsertIndex: number; scoutedOrientation: Orientation }
  | { type: 'SCOUT_AND_SHOW'; tableCardIndex: number; handInsertIndex: number; scoutedOrientation: Orientation; showCardIds: string[] }
  | { type: 'AI_TAKE_TURN' }
  | { type: 'NEXT_ROUND' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'SET_PLAYER_COUNT'; playerCount: PlayerCount }
  | { type: 'OPEN_TUTORIAL' }
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'BACK_TUTORIAL' }
  | { type: 'CLOSE_TUTORIAL' }
  | { type: 'RESTART_GAME' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'FLIP_HAND': {
      if (state.table.phase !== 'pickingUp') return state;
      const players = [...state.players];
      const human = players[0];
      players[0] = {
        ...human,
        handFlipped: !human.handFlipped,
        hand: human.hand.map((card) => ({
          ...card,
          orientation: card.orientation === 'normal' ? 'flipped' : 'normal',
        })),
      };
      return { ...state, players };
    }

    case 'CONFIRM_HAND':
      if (state.table.phase !== 'pickingUp') return state;
      return { ...state, table: { ...state.table, phase: 'playing' } };

    case 'SHOW': {
      const actorIndex = state.table.currentTurnIndex;
      if (state.table.phase !== 'playing' || actorIndex !== 0) return state;
      const actor = state.players[actorIndex];
      const selected = validSelection(actor.hand, action.cardIds, state.table);
      if (!selected) return state;
      const ids = new Set(selected.map((card) => card.id));
      const handAfterShow = actor.hand.filter((card) => !ids.has(card.id));
      return finishShow(
        state,
        actorIndex,
        selected,
        handAfterShow,
        state.players,
        state.table.activeSet,
        'show',
        `${actor.name} SHOWED ${describeSet(selected)}.`,
      );
    }

    case 'SCOUT':
      if (state.table.phase !== 'playing' || state.table.currentTurnIndex !== 0) return state;
      return executeScout(state, 0, action.tableCardIndex, action.handInsertIndex, action.scoutedOrientation);

    case 'SCOUT_AND_SHOW':
      if (state.table.phase !== 'playing' || state.table.currentTurnIndex !== 0) return state;
      return executeScoutAndShow(
        state,
        0,
        action.tableCardIndex,
        action.handInsertIndex,
        action.scoutedOrientation,
        action.showCardIds,
      );

    case 'AI_TAKE_TURN': {
      const actorIndex = state.table.currentTurnIndex;
      if (state.table.phase !== 'playing' || actorIndex === 0) return state;
      const move = getAIMove(state, actorIndex);
      if (move.action === 'show') {
        const actor = state.players[actorIndex];
        const selected = validSelection(actor.hand, move.cards.map((card) => card.id), state.table);
        if (!selected) return state;
        const ids = new Set(selected.map((card) => card.id));
        return finishShow(
          state,
          actorIndex,
          selected,
          actor.hand.filter((card) => !ids.has(card.id)),
          state.players,
          state.table.activeSet,
          'show',
          `${actor.name} SHOWED ${describeSet(selected)}.`,
        );
      }
      if (move.action === 'scout') {
        return executeScout(state, actorIndex, move.tableCardIndex, move.handInsertIndex, move.scoutedOrientation);
      }
      return executeScoutAndShow(
        state,
        actorIndex,
        move.tableCardIndex,
        move.handInsertIndex,
        move.scoutedOrientation,
        move.cards.map((card) => card.id),
      );
    }

    case 'NEXT_ROUND': {
      if (state.table.phase !== 'roundEnd') return state;
      if (state.table.round >= state.playerCount) {
        return { ...state, table: { ...state.table, phase: 'gameEnd' } };
      }
      const next = dealRound(state);
      return { ...next, table: { ...next.table, round: state.table.round + 1 } };
    }

    case 'SET_DIFFICULTY':
      return createMockGameState(action.difficulty, state.playerCount);

    case 'SET_PLAYER_COUNT':
      return createMockGameState(state.difficulty, action.playerCount);

    case 'OPEN_TUTORIAL':
      return { ...state, tutorialActive: true, tutorialStep: 0 };

    case 'ADVANCE_TUTORIAL':
      return { ...state, tutorialStep: Math.min(state.tutorialStep + 1, 4) };

    case 'BACK_TUTORIAL':
      return { ...state, tutorialStep: Math.max(state.tutorialStep - 1, 0) };

    case 'CLOSE_TUTORIAL':
      return { ...state, tutorialActive: false, tutorialStep: 0 };

    case 'RESTART_GAME':
      return createMockGameState(state.difficulty, state.playerCount);

    default:
      return state;
  }
}
