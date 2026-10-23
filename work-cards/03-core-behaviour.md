# Work Card 03: Core Behaviour

## Goal

Wire up the GameContext reducer, implement all game mechanics (Show, Scout, End Turn, AI turn, round scoring, difficulty modes, chip logic), connect all Framer Motion animations, and make the Tutorial interactive and completeable. After this card the full game loop — deal → play turns → end round → next round — runs correctly with live state.

## Inputs

- `build-blueprint.md` — reducer actions, game rules, AI difficulty tiers
- `architecture.md` — `GameState`, `GameContext`, `gameReducer`, `engine.ts`, `aiOpponent.ts`
- `design.md` — animation spec (deal spring, flip rotateY, scout slide, show arc, score count-up, modal fade-scale)

## Files likely touched

- `src/game/engine.ts` (create)
- `src/game/aiOpponent.ts` (create)
- `src/state/gameReducer.ts` (create)
- `src/state/GameContext.tsx` (create)
- `src/App.tsx` (refactor to use context)
- `src/components/Card.tsx` (add Framer Motion flip animation)
- `src/components/PlayerHand.tsx` (add Framer Motion deal/reorder animation)
- `src/components/TableArea.tsx` (add Framer Motion show arc animation)
- `src/components/HUD.tsx` (add animated score count-up)
- `src/components/RoundSummaryModal.tsx` (add fade-scale entrance)
- `src/components/TutorialOverlay.tsx` (already functional from Card 02)
- `src/components/SettingsMenu.tsx` (create — slide-in panel)

## Instructions for the coding agent

### Step 1 — Create src/game/engine.ts (pure game logic, no React)

```ts
import { Card, GameState, Player, SetOrder, TableState } from './types';

/** Shuffle an array in place (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Get the active (display) value of a card given its orientation */
export function activeValue(card: Card): number {
  return card.orientation === 'normal' ? card.topValue : card.bottomValue;
}

/** Check if a sequence of cards forms a valid show set (strictly ascending or descending by active value) */
export function isValidShow(cards: Card[]): { valid: boolean; order: SetOrder } {
  if (cards.length < 1) return { valid: false, order: null };
  if (cards.length === 1) return { valid: true, order: null };

  const values = cards.map(activeValue);
  const isAsc = values.every((v, i) => i === 0 || v > values[i - 1]);
  const isDesc = values.every((v, i) => i === 0 || v < values[i - 1]);

  if (!isAsc && !isDesc) return { valid: false, order: null };
  return { valid: true, order: isAsc ? 'asc' : 'desc' };
}

/**
 * Check if a new set can beat the active set on the table.
 * New set must: have >= same number of cards AND all values are >= current set's highest (for asc)
 * or <= current set's lowest (for desc).
 * Simplified Scout rule: new set must have same length or more, and its values must
 * all be strictly higher than every value in the active set (or all strictly lower if playing desc).
 */
export function canBeatActiveSet(newCards: Card[], tableState: TableState): boolean {
  const { activeSet, activeSetOrder } = tableState;
  if (activeSet.length === 0) return true; // table is empty, anything goes
  if (newCards.length < activeSet.length) return false;

  const newValues = newCards.map(activeValue);
  const tableValues = activeSet.map(activeValue);
  const tableMax = Math.max(...tableValues);
  const tableMin = Math.min(...tableValues);

  const { valid, order: newOrder } = isValidShow(newCards);
  if (!valid) return false;

  // New set must beat in same direction as table, or table has no order yet
  if (activeSetOrder === 'asc' || activeSetOrder === null) {
    return newOrder === 'asc' && Math.min(...newValues) > tableMax;
  }
  if (activeSetOrder === 'desc') {
    return newOrder === 'desc' && Math.max(...newValues) < tableMin;
  }
  return false;
}

/** Deal cards from the deck to both players */
export function dealCards(state: GameState): GameState {
  const { createDeck } = require('./mockData'); // dynamic import for engine isolation
  const freshDeck = shuffle(createDeck());
  const handSize = 8;
  const chipsMap = { easy: 4, standard: 3, hard: 2 };
  const chips = chipsMap[state.difficulty];

  return {
    ...state,
    deck: freshDeck.slice(handSize * 2 + 1),
    players: [
      { ...state.players[0], hand: freshDeck.slice(0, handSize), chips: { scout: chips, show: chips }, score: state.players[0].score },
      { ...state.players[1], hand: freshDeck.slice(handSize, handSize * 2), chips: { scout: chips, show: chips }, score: state.players[1].score },
    ],
    table: {
      ...state.table,
      activeSet: [freshDeck[handSize * 2]],
      activeSetOrder: null,
      currentTurnIndex: 0,
      phase: 'playing',
    },
  };
}

/** Score a round: each remaining Scout Chip = 1 point, Show Chip = 1 point; winner (fewer cards) gets bonus */
export function scoreRound(state: GameState): GameState {
  const [human, ai] = state.players;
  const humanPoints = human.chips.scout + human.chips.show;
  const aiPoints = ai.chips.scout + ai.chips.show;

  // Winner bonus: fewer cards in hand = +2 points
  const humanBonus = human.hand.length < ai.hand.length ? 2 : 0;
  const aiBonus = ai.hand.length < human.hand.length ? 2 : 0;

  return {
    ...state,
    players: [
      { ...human, score: human.score + humanPoints + humanBonus },
      { ...ai, score: ai.score + aiPoints + aiBonus },
    ],
    table: { ...state.table, phase: 'roundEnd' },
  };
}
```

Note: avoid the `require()` inside `dealCards` — instead import `createDeck` at the top of the file.

### Step 2 — Create src/game/aiOpponent.ts

```ts
import { GameState, Card } from './types';
import { activeValue, isValidShow, canBeatActiveSet } from './engine';

/** Get all valid contiguous subsets of the hand (runs of consecutive active values) */
function findValidSets(hand: Card[], tableState: GameState['table']): Card[][] {
  const validSets: Card[][] = [];
  for (let start = 0; start < hand.length; start++) {
    for (let end = start + 1; end <= hand.length; end++) {
      const subset = hand.slice(start, end);
      const { valid } = isValidShow(subset);
      if (valid && canBeatActiveSet(subset, tableState)) {
        validSets.push(subset);
      }
    }
  }
  return validSets;
}

/** Easy: plays a single random valid card if possible, otherwise scouts or passes */
function easyMove(state: GameState): { action: 'show'; cards: Card[] } | { action: 'scout'; cardIndex: number } | { action: 'endTurn' } {
  const ai = state.players[1];
  const validSets = findValidSets(ai.hand, state.table);
  if (validSets.length > 0) {
    const pick = validSets[Math.floor(Math.random() * validSets.length)];
    return { action: 'show', cards: pick };
  }
  if (ai.chips.scout > 0 && state.table.activeSet.length > 0) {
    return { action: 'scout', cardIndex: 0 };
  }
  return { action: 'endTurn' };
}

/** Standard: plays the longest valid set */
function standardMove(state: GameState): ReturnType<typeof easyMove> {
  const ai = state.players[1];
  const validSets = findValidSets(ai.hand, state.table);
  if (validSets.length > 0) {
    const longest = validSets.reduce((a, b) => b.length > a.length ? b : a);
    return { action: 'show', cards: longest };
  }
  if (ai.chips.scout > 0 && state.table.activeSet.length > 0) {
    return { action: 'scout', cardIndex: 0 };
  }
  return { action: 'endTurn' };
}

/** Hard: plays the longest set; prefers sets that leave the fewest cards */
function hardMove(state: GameState): ReturnType<typeof easyMove> {
  const ai = state.players[1];
  const validSets = findValidSets(ai.hand, state.table);
  if (validSets.length > 0) {
    // pick the set that leaves fewest cards remaining
    const best = validSets.reduce((a, b) => {
      const aLeft = ai.hand.length - a.length;
      const bLeft = ai.hand.length - b.length;
      return bLeft < aLeft ? b : a;
    });
    return { action: 'show', cards: best };
  }
  if (ai.chips.scout > 0 && state.table.activeSet.length > 0) {
    // Scout the highest-value card from the active set
    const bestIndex = state.table.activeSet.reduce((best, card, i) =>
      activeValue(card) > activeValue(state.table.activeSet[best]) ? i : best, 0);
    return { action: 'scout', cardIndex: bestIndex };
  }
  return { action: 'endTurn' };
}

export function getAIMove(state: GameState): ReturnType<typeof easyMove> {
  switch (state.difficulty) {
    case 'easy': return easyMove(state);
    case 'hard': return hardMove(state);
    default: return standardMove(state);
  }
}
```

### Step 3 — Create src/state/gameReducer.ts

```ts
import { GameState, Card } from '../game/types';
import { shuffle } from '../game/engine';
import { createDeck, createMockGameState } from '../game/mockData';
import { isValidShow, canBeatActiveSet, scoreRound } from '../game/engine';
import { getAIMove } from '../game/aiOpponent';
import { activeValue } from '../game/engine';

export type GameAction =
  | { type: 'DEAL' }
  | { type: 'SHOW'; cardIds: string[] }
  | { type: 'SCOUT'; tableCardIndex: number; handInsertIndex: number }
  | { type: 'SPEND_SHOW_CHIP' }
  | { type: 'AI_TAKE_TURN' }
  | { type: 'END_ROUND' }
  | { type: 'NEXT_ROUND' }
  | { type: 'SET_DIFFICULTY'; difficulty: GameState['difficulty'] }
  | { type: 'OPEN_TUTORIAL' }
  | { type: 'ADVANCE_TUTORIAL' }
  | { type: 'BACK_TUTORIAL' }
  | { type: 'CLOSE_TUTORIAL' }
  | { type: 'RESTART_GAME' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'DEAL': {
      const fresh = shuffle(createDeck());
      const handSize = 8;
      const chipsMap = { easy: 4, standard: 3, hard: 2 };
      const chips = chipsMap[state.difficulty];
      return {
        ...state,
        deck: fresh.slice(handSize * 2 + 1),
        players: [
          { ...state.players[0], hand: fresh.slice(0, handSize), chips: { scout: chips, show: chips } },
          { ...state.players[1], hand: fresh.slice(handSize, handSize * 2), chips: { scout: chips, show: chips } },
        ],
        table: { ...state.table, activeSet: [fresh[handSize * 2]], activeSetOrder: null, currentTurnIndex: 0, phase: 'playing' },
      };
    }

    case 'SHOW': {
      const human = state.players[0];
      const selectedCards = action.cardIds.map(id => human.hand.find(c => c.id === id)!).filter(Boolean);
      const { valid, order } = isValidShow(selectedCards);
      if (!valid || !canBeatActiveSet(selectedCards, state.table)) return state;

      const newHand = human.hand.filter(c => !action.cardIds.includes(c.id));
      const newPhase = newHand.length === 0 ? 'roundEnd' : 'playing';

      let nextState: GameState = {
        ...state,
        players: [
          { ...human, hand: newHand },
          state.players[1],
        ],
        table: {
          ...state.table,
          activeSet: selectedCards,
          activeSetOrder: order ?? state.table.activeSetOrder,
          currentTurnIndex: 1,
          phase: newPhase,
        },
      };

      if (newPhase === 'roundEnd') return scoreRound(nextState);
      return nextState;
    }

    case 'SCOUT': {
      const human = state.players[0];
      if (human.chips.scout <= 0) return state;
      const scouted = state.table.activeSet[action.tableCardIndex];
      if (!scouted) return state;

      const newActiveSet = state.table.activeSet.filter((_, i) => i !== action.tableCardIndex);
      const newHand = [
        ...human.hand.slice(0, action.handInsertIndex),
        scouted,
        ...human.hand.slice(action.handInsertIndex),
      ];

      return {
        ...state,
        players: [
          { ...human, hand: newHand, chips: { ...human.chips, scout: human.chips.scout - 1 } },
          state.players[1],
        ],
        table: {
          ...state.table,
          activeSet: newActiveSet,
          currentTurnIndex: 1,
        },
      };
    }

    case 'AI_TAKE_TURN': {
      const move = getAIMove(state);
      const ai = state.players[1];

      if (move.action === 'show') {
        const { valid, order } = isValidShow(move.cards);
        if (!valid) {
          return { ...state, table: { ...state.table, currentTurnIndex: 0 } };
        }
        const newAIHand = ai.hand.filter(c => !move.cards.find(mc => mc.id === c.id));
        const newPhase = newAIHand.length === 0 ? 'roundEnd' : 'playing';
        let nextState: GameState = {
          ...state,
          players: [state.players[0], { ...ai, hand: newAIHand }],
          table: {
            ...state.table,
            activeSet: move.cards,
            activeSetOrder: order ?? state.table.activeSetOrder,
            currentTurnIndex: 0,
            phase: newPhase,
          },
        };
        if (newPhase === 'roundEnd') return scoreRound(nextState);
        return nextState;
      }

      if (move.action === 'scout' && ai.chips.scout > 0) {
        const scouted = state.table.activeSet[move.cardIndex];
        const newActiveSet = state.table.activeSet.filter((_, i) => i !== move.cardIndex);
        return {
          ...state,
          players: [
            state.players[0],
            { ...ai, hand: [...ai.hand, scouted], chips: { ...ai.chips, scout: ai.chips.scout - 1 } },
          ],
          table: { ...state.table, activeSet: newActiveSet, currentTurnIndex: 0 },
        };
      }

      // End turn
      return { ...state, table: { ...state.table, currentTurnIndex: 0 } };
    }

    case 'END_ROUND': {
      return scoreRound(state);
    }

    case 'NEXT_ROUND': {
      const fresh = shuffle(createDeck());
      const handSize = 8;
      const chipsMap = { easy: 4, standard: 3, hard: 2 };
      const chips = chipsMap[state.difficulty];
      return {
        ...state,
        deck: fresh.slice(handSize * 2 + 1),
        players: [
          { ...state.players[0], hand: fresh.slice(0, handSize), chips: { scout: chips, show: chips } },
          { ...state.players[1], hand: fresh.slice(handSize, handSize * 2), chips: { scout: chips, show: chips } },
        ],
        table: {
          ...state.table,
          activeSet: [fresh[handSize * 2]],
          activeSetOrder: null,
          currentTurnIndex: 0,
          round: state.table.round + 1,
          phase: 'playing',
        },
      };
    }

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty };

    case 'OPEN_TUTORIAL':
      return { ...state, tutorialActive: true, tutorialStep: 0 };

    case 'ADVANCE_TUTORIAL':
      return { ...state, tutorialStep: Math.min(state.tutorialStep + 1, 4) };

    case 'BACK_TUTORIAL':
      return { ...state, tutorialStep: Math.max(state.tutorialStep - 1, 0) };

    case 'CLOSE_TUTORIAL':
      return { ...state, tutorialActive: false, tutorialStep: 0 };

    case 'RESTART_GAME':
      return createMockGameState(state.difficulty);

    default:
      return state;
  }
}
```

### Step 4 — Create src/state/GameContext.tsx

```tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState } from '../game/types';
import { gameReducer, GameAction } from './gameReducer';
import { createMockGameState } from '../game/mockData';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createMockGameState('standard'));
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
```

### Step 5 — Add Framer Motion animations to Card.tsx

Replace the Card component with an animated version using Framer Motion:

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '../game/types';

// ... (keep existing props interface)

export default function Card({ card, selected, showBack, size = 'normal', onFlip, onClick }: CardProps) {
  // Wrap the existing JSX in <motion.div> with whileHover and animation props
  // Card flip: use rotateY on a motion.div wrapping the card face
  // Deal animation: initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
  // Selection lift: already handled via CSS translateY; add spring transition
}
```

Key animation specs from `design.md`:
- **Deal:** `initial={{ y: -80, opacity: 0 }}` → `animate={{ y: 0, opacity: 1 }}`, `transition: { type: 'spring', stiffness: 300, damping: 24 }`, staggered by card index.
- **Flip:** Wrap front/back in a `motion.div` with `animate={{ rotateY: card.orientation === 'flipped' ? 180 : 0 }}`, `transition: { duration: 0.3 }`, `style={{ perspective: 1000 }}`.
- **Scout (card moving from table to hand):** Use `layoutId={card.id}` on the Card in both TableArea and PlayerHand so Framer Motion interpolates position automatically.
- **Show (cards arcing to table):** Use `layoutId={card.id}` similarly.
- **Selection lift:** `animate={{ y: selected ? -4 : 0 }}`, `transition: { type: 'spring', stiffness: 400 }`.
- **`prefers-reduced-motion`:** wrap all `transition` overrides with a check or use Framer Motion's `useReducedMotion()` hook; if true, set `transition: { duration: 0 }`.

### Step 6 — Add RoundSummaryModal entrance animation

```tsx
import { motion, AnimatePresence } from 'framer-motion';
// Wrap the modal panel in:
// <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
//   exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.24, ease: 'easeOut' }}>
```

### Step 7 — Add animated score count-up to HUD.tsx

Use a simple `useEffect` + `useState` counter that increments from previous value to new value over 500ms:

```tsx
function AnimatedScore({ value, className }: { value: number; className: string }) {
  const [displayed, setDisplayed] = useState(value);
  useEffect(() => {
    let start = displayed;
    const end = value;
    if (start === end) return;
    const step = end > start ? 1 : -1;
    const interval = setInterval(() => {
      start += step;
      setDisplayed(start);
      if (start === end) clearInterval(interval);
    }, 500 / Math.abs(end - start));
    return () => clearInterval(interval);
  }, [value]);
  return <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>{displayed}</span>;
}
```

### Step 8 — Create src/components/SettingsMenu.tsx

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Difficulty } from '../game/types';

interface SettingsMenuProps {
  isOpen: boolean;
  difficulty: Difficulty;
  onSetDifficulty: (d: Difficulty) => void;
  onOpenTutorial: () => void;
  onRestartGame: () => void;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, difficulty, onSetDifficulty, onOpenTutorial, onRestartGame, onClose }: SettingsMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-black/50" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="fixed top-14 left-0 bottom-0 z-50 w-72 bg-felt-dark p-6 flex flex-col gap-4"
            initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <h2 className="font-display font-bold text-xl text-card">Settings</h2>
            <div className="flex flex-col gap-2">
              <p className="font-body text-xs text-card/50 uppercase tracking-widest">Difficulty</p>
              {(['easy', 'standard', 'hard'] as Difficulty[]).map(d => (
                <button key={d} onClick={() => onSetDifficulty(d)}
                  className={`text-left px-3 py-2 rounded-[12px] font-body font-semibold text-sm capitalize transition-all
                    ${difficulty === d ? 'bg-emerald-game text-white' : 'bg-felt text-card/70 hover:text-card'}`}>
                  {d}
                </button>
              ))}
            </div>
            <button onClick={onOpenTutorial}
              className="text-left font-body text-sm text-card/70 hover:text-card transition-colors">
              How to Play
            </button>
            <button onClick={onRestartGame}
              className="text-left font-body text-sm text-score-ai hover:brightness-110 transition-colors">
              Restart Game
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Step 9 — Refactor src/App.tsx to use GameContext

Replace the local `useState` approach from Card 02 with the `GameProvider` and `useGame` hook. Key wiring:

- `<GameProvider>` wraps the whole app.
- `dispatch({ type: 'DEAL' })` is called when Start Game is pressed.
- `dispatch({ type: 'SHOW', cardIds: selectedIds })` on Show button.
- `dispatch({ type: 'SCOUT', tableCardIndex: 0, handInsertIndex: selectedHandIndex })` on Scout button.
- `dispatch({ type: 'AI_TAKE_TURN' })` is called after every human action where `currentTurnIndex` becomes 1 — use a `useEffect` that watches `state.table.currentTurnIndex` and dispatches `AI_TAKE_TURN` with a 600ms delay (for animation feel).
- `dispatch({ type: 'NEXT_ROUND' })` on "Begin Next Round".
- `dispatch({ type: 'RESTART_GAME' })` from SettingsMenu.

Scout UX: when Scout button is pressed, take the first card from the active set and insert it at the current end of the hand. (Full drag-to-choose insert point is polish; default to appending at end for now.)

Show UX: validation happens inside the reducer; if `SHOW` returns the same state (invalid), the UI stays unchanged — no error modal needed in v1.

### Step 10 — Run and verify

```bash
npm run dev
```

Fix all TypeScript errors. Test the full turn loop manually.

## What not to do

- Do not add `localStorage`.
- Do not add a backend or API.
- Do not add a fourth difficulty tier or extra game modes not in the brief.
- Do not break the layout built in Card 02 — only add behaviour and animations on top.
- Do not remove any component from Card 02.
- Do not use `any` type unless absolutely required; comment the reason.

## Done when

- `npm run dev` starts with zero TypeScript errors.
- Starting a Standard game deals 8 cards to the player and 8 to the AI, with one card on the table — all with deal animations.
- Selecting 1–3 cards and pressing Show plays them to the table if valid; invalid selections are silently ignored (button stays active but nothing changes is acceptable in v1).
- Pressing Scout takes the first table card and adds it to the hand.
- After a human action, the AI takes its turn automatically after a short delay, with its card animating to the table.
- Chip counts decrease correctly when Scout or Show Chip actions are used.
- The round ends and the RoundSummaryModal appears with correct scores when a player empties their hand.
- "Begin Next Round" starts a new round with the round counter incremented.
- Card flip animation works (rotateY 180°).
- RoundSummaryModal fades and scales in.
- Settings menu slides in from the left when the gear icon is tapped.
- Tutorial steps through all 5 steps and closes correctly.
- `prefers-reduced-motion` collapses all animations to instant.

## Verification steps

1. Start game on Easy — cards deal with spring animation from above.
2. Select 2 consecutive-value cards, press Show — they arc to TableArea, hand shrinks by 2.
3. Press Scout — active set loses one card, hand gains one card with a slide animation.
4. AI turn fires automatically ~600ms later — AI card appears on table.
5. Click the flip button on a hand card — card rotates 180°, values swap.
6. Play until one player has no cards — RoundSummaryModal fades in with correct chip-based scores.
7. Press Begin Next Round — round counter increments, new cards deal.
8. Switch to Hard difficulty via Settings, restart — AI plays noticeably more aggressively.
9. Open Tutorial in Settings — all 5 steps work.
10. In browser DevTools: `window.matchMedia('(prefers-reduced-motion: reduce)')` → simulate `true` → all motion should instantly swap.
11. Design check: animations match `design.md` specs — spring deal, rotateY flip, fade-scale modal, slide settings panel; no extra effects added beyond what design.md specifies.

## Localhost test before continuing

After this card, the learner should test:

- Start a game on Standard. Cards deal with a visible spring animation.
- Select cards from your hand that have consecutive values, press Show — they move to the table. Try pressing Show with non-consecutive cards — nothing should happen.
- Press Scout — one card moves from the table to your hand.
- Wait ~1 second after your turn — the AI plays its card automatically.
- Flip a card using the rotate icon — the values swap with a smooth animation.
- Play until the round ends — the Round Summary modal appears with scores that reflect the chips used.
- Press "Begin Next Round" — a fresh hand deals.
- Open Settings (gear icon) — the settings panel slides in; change difficulty; press Restart.
- Open Tutorial from Settings — all 5 steps step through.

If all tests pass, reply `continue`.
If anything fails, reply `fix` and paste the error or describe what you see.

## Stop condition

If the game loop crashes or the AI causes an infinite loop and it cannot be resolved in five minutes, put up your hand for a trainer. Do not proceed to Work Card 04 until all verification steps pass.

## Status
Not started
