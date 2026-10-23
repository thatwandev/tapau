# Work Card 02: First Visible Version

## Goal

Build every layout zone of the game UI with mock data and full design tokens applied — StartScreen, HUD, OpponentArea, TableArea, PlayerHand, ActionBar, RoundSummaryModal shell, and TutorialOverlay shell. Nothing is interactive yet; this card is purely visual. Every component must match the `design.md` Visual recipe exactly.

## Inputs

- `build-blueprint.md` — component map, file/folder expectations
- `architecture.md` — TypeScript types, mock data requirements
- `design.md` — Visual recipe (every zone, colour, type, surfaces, motion rules)

## Files likely touched

- `src/App.tsx`
- `src/game/types.ts` (create)
- `src/game/mockData.ts` (create)
- `src/components/StartScreen.tsx` (create)
- `src/components/HUD.tsx` (create)
- `src/components/OpponentArea.tsx` (create)
- `src/components/TableArea.tsx` (create)
- `src/components/PlayerHand.tsx` (create)
- `src/components/Card.tsx` (create)
- `src/components/ChipToken.tsx` (create)
- `src/components/ActionBar.tsx` (create)
- `src/components/RoundSummaryModal.tsx` (create — static shell only)
- `src/components/TutorialOverlay.tsx` (create — static shell only)

## Instructions for the coding agent

### Step 1 — Create src/game/types.ts

Define all TypeScript interfaces used across the app:

```ts
export type Orientation = 'normal' | 'flipped';
export type Difficulty = 'easy' | 'standard' | 'hard';
export type GamePhase = 'start' | 'playing' | 'roundEnd' | 'gameEnd';
export type PlayerId = 'human' | 'ai';
export type SetOrder = 'asc' | 'desc' | null;

export interface Card {
  id: string;
  topValue: number;
  bottomValue: number;
  orientation: Orientation;
}

export interface ChipSet {
  scout: number;
  show: number;
}

export interface Player {
  id: PlayerId;
  hand: Card[];
  chips: ChipSet;
  score: number;
}

export interface TableState {
  activeSet: Card[];
  activeSetOrder: SetOrder;
  currentTurnIndex: number; // 0 = human, 1 = ai
  round: number;
  phase: GamePhase;
}

export interface GameState {
  players: [Player, Player];
  table: TableState;
  difficulty: Difficulty;
  deck: Card[];
  tutorialActive: boolean;
  tutorialStep: number;
}
```

### Step 2 — Create src/game/mockData.ts

Build the Scout card distribution. Scout uses 45 cards: pairs of (1,10), (2,9), (3,8), (4,7), (5,6) for each combination, plus single cards. For the mock, create 45 unique cards with topValue and bottomValue that mirror the actual Scout deck distribution.

```ts
import { Card, GameState, Difficulty } from './types';

export function createDeck(): Card[] {
  const cards: Card[] = [];
  let id = 1;
  // Scout deck: values 1-10, paired so each card has a top and complementary bottom
  // 10 pairs of complementary values (1+10, 2+9, etc.) × 4 suits, plus 5 middle cards
  // Simplified: 45 cards total, topValue + bottomValue always ≤ 11
  for (let top = 1; top <= 9; top++) {
    const bottom = 11 - top; // complement
    const count = top <= 5 ? top : 10 - top; // 1,2,3,4,5,4,3,2,1 distribution
    for (let i = 0; i < count; i++) {
      cards.push({ id: `card-${id++}`, topValue: top, bottomValue: bottom, orientation: 'normal' });
    }
  }
  // Fill to 45 if needed
  while (cards.length < 45) {
    cards.push({ id: `card-${id++}`, topValue: 5, bottomValue: 6, orientation: 'normal' });
  }
  return cards.slice(0, 45);
}

export function createMockGameState(difficulty: Difficulty = 'standard'): GameState {
  const deck = createDeck();
  // Deal 8 cards to each player
  const humanHand = deck.slice(0, 8);
  const aiHand = deck.slice(8, 16);
  const remainingDeck = deck.slice(16);

  const chipsPerDifficulty = { easy: 4, standard: 3, hard: 2 };
  const chips = chipsPerDifficulty[difficulty];

  return {
    players: [
      { id: 'human', hand: humanHand, chips: { scout: chips, show: chips }, score: 0 },
      { id: 'ai', hand: aiHand, chips: { scout: chips, show: chips }, score: 0 },
    ],
    table: {
      activeSet: [deck[16]], // one card on table to start
      activeSetOrder: null,
      currentTurnIndex: 0,
      round: 1,
      phase: 'playing',
    },
    difficulty,
    deck: remainingDeck,
    tutorialActive: false,
    tutorialStep: 0,
  };
}
```

### Step 3 — Create src/components/Card.tsx

```tsx
import { Card as CardType } from '../game/types';

interface CardProps {
  card: CardType;
  selected?: boolean;
  showBack?: boolean;
  size?: 'normal' | 'small';
  onFlip?: () => void;
  onClick?: () => void;
}

export default function Card({ card, selected, showBack, size = 'normal', onFlip, onClick }: CardProps) {
  const dims = size === 'small'
    ? 'w-[60px] h-[88px] text-lg'
    : 'w-[72px] h-[104px] md:w-[84px] md:h-[120px] text-xl';

  if (showBack) {
    return (
      <div className={`${dims} rounded-card bg-card-text border border-card-border relative flex-shrink-0`}
        style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.04) 4px, rgba(255,255,255,0.04) 8px)" }}
      />
    );
  }

  const displayValue = card.orientation === 'normal' ? card.topValue : card.bottomValue;
  const hiddenValue = card.orientation === 'normal' ? card.bottomValue : card.topValue;

  return (
    <div
      className={`${dims} rounded-card bg-card border border-card-border relative flex-shrink-0 cursor-pointer select-none
        ${selected ? 'ring-2 ring-emerald-game -translate-y-1' : ''}
        transition-transform duration-150`}
      onClick={onClick}
    >
      {/* Primary value — top left */}
      <span className="absolute top-1.5 left-2 font-body font-semibold text-card-text"
        style={{ fontSize: size === 'small' ? '14px' : '20px' }}>
        {displayValue}
      </span>
      {/* Secondary value — bottom right, rotated */}
      <span className="absolute bottom-1.5 right-2 font-body font-semibold text-card-muted rotate-180 inline-block"
        style={{ fontSize: size === 'small' ? '11px' : '15px' }}>
        {hiddenValue}
      </span>
      {/* Flip button */}
      {onFlip && (
        <button
          aria-label="Flip card"
          className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-felt/40 text-card-muted hover:bg-felt/70 transition-colors"
          onClick={(e) => { e.stopPropagation(); onFlip(); }}
        >
          {/* Rotate SVG icon */}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"/>
          </svg>
        </button>
      )}
    </div>
  );
}
```

### Step 4 — Create src/components/ChipToken.tsx

```tsx
interface ChipTokenProps {
  type: 'scout' | 'show';
  count: number;
  spent?: boolean;
}

export default function ChipToken({ type, count, spent }: ChipTokenProps) {
  const bg = type === 'scout' ? 'bg-chip-scout' : 'bg-chip-show';
  const label = type === 'scout' ? 'Scout Chips' : 'Show Chips';

  return (
    <div className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full ${bg} ${spent ? 'opacity-40 grayscale' : ''}`}
      aria-label={`${label}: ${count}`}>
      {type === 'scout' ? (
        // Magnifying glass SVG
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      ) : (
        // Eye SVG
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
      {/* Count badge */}
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[10px] font-body font-semibold text-card-text flex items-center justify-center leading-none">
        {count}
      </span>
    </div>
  );
}
```

### Step 5 — Create src/components/HUD.tsx

```tsx
import ChipToken from './ChipToken';
import { Player, TableState } from '../game/types';

interface HUDProps {
  human: Player;
  ai: Player;
  table: TableState;
  onOpenSettings: () => void;
}

export default function HUD({ human, ai, table, onOpenSettings }: HUDProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-felt-dark h-14 flex items-center px-4 gap-3"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Settings */}
      <button aria-label="Open settings" onClick={onOpenSettings}
        className="w-10 h-10 flex items-center justify-center text-card/70 hover:text-card transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>

      {/* Centre: round + scores */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="font-body font-semibold text-score-ai text-lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {ai.score}
        </span>
        <span className="font-display font-bold text-score-round text-sm px-3 py-0.5 rounded-pill bg-score-round/20">
          R{table.round}
        </span>
        <span className="font-body font-semibold text-score-player text-lg" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {human.score}
        </span>
      </div>

      {/* Right: player chip tokens */}
      <div className="flex items-center gap-2">
        <ChipToken type="scout" count={human.chips.scout} />
        <ChipToken type="show" count={human.chips.show} />
      </div>
    </header>
  );
}
```

### Step 6 — Create src/components/OpponentArea.tsx

```tsx
import Card from './Card';
import ChipToken from './ChipToken';
import { Player, Card as CardType } from '../game/types';

interface OpponentAreaProps {
  ai: Player;
}

export default function OpponentArea({ ai }: OpponentAreaProps) {
  return (
    <section className="bg-felt-light px-4 py-3 flex items-center gap-4"
      aria-label="Opponent area">
      {/* Card backs */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {ai.hand.slice(0, Math.min(ai.hand.length, 5)).map((_, i) => (
          <Card key={i} card={{ id: `back-${i}`, topValue: 0, bottomValue: 0, orientation: 'normal' }} showBack size="small" />
        ))}
        {ai.hand.length > 5 && (
          <span className="text-card/70 font-body text-sm ml-1">+{ai.hand.length - 5}</span>
        )}
      </div>

      {/* Chip tokens */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ChipToken type="scout" count={ai.chips.scout} />
        <ChipToken type="show" count={ai.chips.show} />
      </div>

      {/* Card count label */}
      <span className="font-body text-xs text-card/50 ml-auto">
        {ai.hand.length} cards
      </span>
    </section>
  );
}
```

### Step 7 — Create src/components/TableArea.tsx

```tsx
import Card from './Card';
import { TableState } from '../game/types';

interface TableAreaProps {
  table: TableState;
}

export default function TableArea({ table }: TableAreaProps) {
  const orderLabel = table.activeSetOrder === 'asc' ? '↑ Ascending'
    : table.activeSetOrder === 'desc' ? '↓ Descending'
    : null;

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative"
      aria-label="Active play area">
      <div className="relative w-full max-w-sm min-h-[120px] rounded-[12px] border-2 border-dashed border-felt-light/60 flex items-center justify-center p-3">
        {/* Orientation badge */}
        {orderLabel && (
          <span className="absolute top-2 right-2 text-xs font-body font-semibold text-score-turn">
            {orderLabel}
          </span>
        )}

        {table.activeSet.length === 0 ? (
          <span className="font-body text-sm text-card/40">No set played yet</span>
        ) : (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {table.activeSet.map((card) => (
              <Card key={card.id} card={card} size="small" />
            ))}
          </div>
        )}
      </div>
      <p className="font-body text-xs text-card/40 mt-2">Active Set</p>
    </section>
  );
}
```

### Step 8 — Create src/components/PlayerHand.tsx

```tsx
import Card from './Card';
import { Card as CardType } from '../game/types';

interface PlayerHandProps {
  hand: CardType[];
  selectedIds: string[];
  onSelectCard: (id: string) => void;
  onFlipCard: (id: string) => void;
}

export default function PlayerHand({ hand, selectedIds, onSelectCard, onFlipCard }: PlayerHandProps) {
  return (
    <section className="px-4 pb-2" aria-label="Your hand">
      <p className="font-body text-xs text-card/40 mb-2">Your Hand</p>
      <div className="flex items-end gap-[-12px] overflow-x-auto pb-2"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {hand.map((card) => (
          <Card
            key={card.id}
            card={card}
            selected={selectedIds.includes(card.id)}
            onFlip={() => onFlipCard(card.id)}
            onClick={() => onSelectCard(card.id)}
          />
        ))}
      </div>
    </section>
  );
}
```

### Step 9 — Create src/components/ActionBar.tsx

```tsx
import ChipToken from './ChipToken';
import { Player } from '../game/types';

interface ActionBarProps {
  player: Player;
  canShow: boolean;
  canScout: boolean;
  onShow: () => void;
  onScout: () => void;
  onEndTurn: () => void;
}

export default function ActionBar({ player, canShow, canScout, onShow, onScout, onEndTurn }: ActionBarProps) {
  return (
    <div className="bg-felt-dark px-4 pt-3 pb-4 flex flex-col gap-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
      {/* Player chip tokens */}
      <div className="flex items-center gap-3 justify-center">
        <ChipToken type="scout" count={player.chips.scout} />
        <ChipToken type="show" count={player.chips.show} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          className="flex-1 h-12 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm
            disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:brightness-110 active:enabled:scale-95 transition-all"
          disabled={!canShow}
          onClick={onShow}
          aria-label="Show cards"
        >
          Show
        </button>
        <button
          className="flex-1 h-12 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm
            disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:brightness-110 active:enabled:scale-95 transition-all"
          disabled={!canScout}
          onClick={onScout}
          aria-label="Scout a card"
        >
          Scout
        </button>
        <button
          className="flex-1 h-12 rounded-pill bg-card text-card-text font-body font-semibold text-sm
            hover:brightness-95 active:scale-95 transition-all"
          onClick={onEndTurn}
          aria-label="End your turn"
        >
          End Turn
        </button>
      </div>
    </div>
  );
}
```

### Step 10 — Create src/components/RoundSummaryModal.tsx (shell)

```tsx
import { Player } from '../game/types';

interface RoundSummaryModalProps {
  round: number;
  human: Player;
  ai: Player;
  onNextRound: () => void;
  onClose: () => void;
}

export default function RoundSummaryModal({ round, human, ai, onNextRound }: RoundSummaryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card rounded-modal mx-4 p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="font-display font-bold text-2xl text-card-text text-center">
          Round {round} Complete
        </h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-body font-semibold text-card-text">You</span>
            <span className="font-body font-bold text-xl text-score-player" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {human.score}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body font-semibold text-card-text">Opponent</span>
            <span className="font-body font-bold text-xl text-score-ai" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {ai.score}
            </span>
          </div>
        </div>
        <button
          className="w-full h-12 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm
            hover:brightness-110 active:scale-95 transition-all"
          onClick={onNextRound}
        >
          Begin Next Round
        </button>
      </div>
    </div>
  );
}
```

### Step 11 — Create src/components/TutorialOverlay.tsx (shell)

```tsx
const TUTORIAL_STEPS = [
  { title: 'Your Hand', body: 'These are your cards. Each card has two values — one on top, one on the bottom.' },
  { title: 'The Active Set', body: 'This is the shared play area. The current set of cards played this turn lives here.' },
  { title: 'Flip a Card', body: 'Tap the rotate icon on a card to flip it. This swaps its top and bottom values — the Scout mechanic.' },
  { title: 'Show a Set', body: 'Select cards from your hand that form a run (all ascending or all descending), then press Show.' },
  { title: 'Scout & Show Chips', body: 'Amber chips let you Scout (take a card from the table). Blue chips let you play a bonus Show. Chips score points at round end.' },
];

interface TutorialOverlayProps {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

export default function TutorialOverlay({ step, onNext, onBack, onClose }: TutorialOverlayProps) {
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 pb-24">
      <div className="bg-card rounded-modal mx-4 p-5 w-full max-w-sm flex flex-col gap-4">
        {/* Close */}
        <div className="flex items-center justify-between">
          <h3 className="font-body font-semibold text-card-text text-base">{current.title}</h3>
          <button aria-label="Close tutorial" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-felt/10 text-card-muted hover:bg-felt/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p className="font-body text-sm text-card-text/80 leading-relaxed">{current.body}</p>
        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5">
          {TUTORIAL_STEPS.map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-emerald-game' : 'bg-card-muted'}`} />
          ))}
        </div>
        {/* Nav buttons */}
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button className="flex-1 h-10 rounded-pill bg-card border border-card-border text-card-text font-body font-semibold text-sm hover:bg-felt/10 transition-colors"
              onClick={onBack}>
              Back
            </button>
          )}
          <button className="flex-1 h-10 rounded-pill bg-emerald-game text-white font-body font-semibold text-sm hover:brightness-110 active:scale-95 transition-all"
            onClick={isLast ? onClose : onNext}>
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 12 — Create src/components/StartScreen.tsx

```tsx
import { Difficulty } from '../game/types';

interface StartScreenProps {
  difficulty: Difficulty;
  onSetDifficulty: (d: Difficulty) => void;
  onStartGame: () => void;
  onOpenTutorial: () => void;
}

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: 'Easy', desc: 'AI plays randomly — great for learning' },
  { id: 'standard', label: 'Standard', desc: 'AI plays the longest valid run' },
  { id: 'hard', label: 'Hard', desc: 'AI plans ahead — a real challenge' },
];

export default function StartScreen({ difficulty, onSetDifficulty, onStartGame, onOpenTutorial }: StartScreenProps) {
  return (
    <div className="min-h-dvh bg-felt felt-noise flex flex-col items-center justify-center px-6 gap-8">
      {/* Title */}
      <div className="text-center">
        <h1 className="font-display font-bold text-5xl text-card leading-tight">Tapau</h1>
        <p className="font-body text-card/60 text-base mt-2">A Scout-inspired card game</p>
      </div>

      {/* Difficulty picker */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <p className="font-body text-xs text-card/50 uppercase tracking-widest text-center">Choose Difficulty</p>
        {DIFFICULTIES.map((d) => (
          <button
            key={d.id}
            className={`w-full text-left px-4 py-3 rounded-[16px] bg-card border-2 transition-all
              ${difficulty === d.id ? 'border-emerald-game scale-[1.03]' : 'border-transparent hover:border-card-border'}`}
            onClick={() => onSetDifficulty(d.id)}
            aria-pressed={difficulty === d.id}
          >
            <span className="font-body font-semibold text-card-text block">{d.label}</span>
            <span className="font-body text-xs text-card-muted">{d.desc}</span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          className="w-full h-[52px] rounded-pill bg-emerald-game text-white font-body font-semibold text-base hover:brightness-110 active:scale-95 transition-all"
          onClick={onStartGame}
        >
          Start Game
        </button>
        <button
          className="font-body text-sm text-card/50 underline underline-offset-2 hover:text-card/80 transition-colors"
          onClick={onOpenTutorial}
        >
          How to Play
        </button>
      </div>
    </div>
  );
}
```

### Step 13 — Wire it all together in src/App.tsx

Use the mock data to render the full game screen with static state (no reducer yet):

```tsx
import { useState } from 'react';
import { createMockGameState } from './game/mockData';
import { Difficulty } from './game/types';
import StartScreen from './components/StartScreen';
import HUD from './components/HUD';
import OpponentArea from './components/OpponentArea';
import TableArea from './components/TableArea';
import PlayerHand from './components/PlayerHand';
import ActionBar from './components/ActionBar';
import RoundSummaryModal from './components/RoundSummaryModal';
import TutorialOverlay from './components/TutorialOverlay';

type Screen = 'start' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [gameState, setGameState] = useState(() => createMockGameState('standard'));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const human = gameState.players[0];
  const ai = gameState.players[1];

  if (screen === 'start') {
    return (
      <>
        <StartScreen
          difficulty={difficulty}
          onSetDifficulty={setDifficulty}
          onStartGame={() => {
            setGameState(createMockGameState(difficulty));
            setScreen('game');
          }}
          onOpenTutorial={() => setShowTutorial(true)}
        />
        {showTutorial && (
          <TutorialOverlay
            step={tutorialStep}
            onNext={() => setTutorialStep(s => s + 1)}
            onBack={() => setTutorialStep(s => s - 1)}
            onClose={() => { setShowTutorial(false); setTutorialStep(0); }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-dvh bg-felt flex flex-col">
      <HUD human={human} ai={ai} table={gameState.table} onOpenSettings={() => {}} />

      {/* Main game area — offset for fixed HUD (56px) */}
      <div className="flex flex-col flex-1 pt-14">
        <OpponentArea ai={ai} />
        <TableArea table={gameState.table} />
        <PlayerHand
          hand={human.hand}
          selectedIds={selectedIds}
          onSelectCard={(id) => setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
          )}
          onFlipCard={(_id) => {}}
        />
        <ActionBar
          player={human}
          canShow={selectedIds.length > 0}
          canScout={gameState.table.activeSet.length > 0}
          onShow={() => setShowModal(true)}
          onScout={() => {}}
          onEndTurn={() => setShowModal(true)}
        />
      </div>

      {showModal && (
        <RoundSummaryModal
          round={gameState.table.round}
          human={human}
          ai={ai}
          onNextRound={() => { setShowModal(false); setGameState(createMockGameState(difficulty)); }}
          onClose={() => setShowModal(false)}
        />
      )}
      {showTutorial && (
        <TutorialOverlay
          step={tutorialStep}
          onNext={() => setTutorialStep(s => s + 1)}
          onBack={() => setTutorialStep(s => s - 1)}
          onClose={() => { setShowTutorial(false); setTutorialStep(0); }}
        />
      )}
    </div>
  );
}
```

### Step 14 — Run and verify

```bash
npm run dev
```

Fix any TypeScript errors before marking done.

## What not to do

- Do not wire up game logic or the reducer yet — that is Work Card 03.
- Do not add Framer Motion animation calls yet — animations come in Work Card 03.
- Do not add `src/state/GameContext.tsx` or `src/game/engine.ts` yet.
- Do not add `localStorage` logic.
- Do not invent game values not in the mock dataset.

## Done when

- `npm run dev` starts with zero TypeScript errors.
- StartScreen shows on load: felt canvas, "Tapau" title, three difficulty options, Start Game button.
- Selecting Standard difficulty and pressing Start Game shows the full game layout.
- HUD bar visible at top: round badge, scores (both 0), chip tokens.
- OpponentArea shows card backs and chip tokens.
- TableArea shows the dashed drop zone with the initial mock card.
- PlayerHand shows the 8 mock cards in a horizontal scrollable row.
- ActionBar shows Show, Scout, End Turn buttons at the bottom.
- Pressing End Turn (or Show) opens RoundSummaryModal shell.
- Pressing "Begin Next Round" closes the modal and resets mock state.
- Tutorial opens and all 5 steps step through without error.
- No emoji anywhere on screen.
- No drop shadows anywhere.

## Verification steps

1. Open http://localhost:5173 — StartScreen with felt green background and "Tapau" heading.
2. Click each difficulty option — selected option gets the emerald ring border.
3. Press Start Game — transitions to GameScreen layout.
4. GameScreen: confirm HUD, OpponentArea, TableArea, PlayerHand, ActionBar all visible.
5. Click cards in PlayerHand — selected cards lift with emerald ring.
6. Press End Turn — RoundSummaryModal appears with round 1, scores 0/0, Begin Next Round button.
7. Press Begin Next Round — modal closes.
8. Return to StartScreen (refresh) → press "How to Play" → Tutorial overlay appears.
9. Step through all 5 tutorial steps — dot indicators advance.
10. Press Done on step 5 — tutorial closes.
11. Design check: canvas is felt green (#0C4A28), cards are off-white (#F0F4F1), HUD is #0A3D20, pill buttons are emerald or off-white, chip tokens are amber and sky-blue circles — all per `design.md`.
12. No emoji visible anywhere. No drop shadows visible.

## Localhost test before continuing

After this card, the learner should test:

- Open http://localhost:5173 — the StartScreen loads with a dark green felt background and "Tapau" as the title.
- Press "Start Game" on Standard — the full game layout appears with HUD, card zones, and action buttons all visible.
- Click a card in the hand — it lifts slightly with an emerald ring.
- Press "End Turn" — the Round Summary modal appears. Press "Begin Next Round" — it closes.
- Press "How to Play" on the Start Screen — the tutorial opens and all 5 steps step through.
- Check at 375px browser width — nothing is cut off horizontally.

If all tests pass, reply `continue`.
If anything fails, reply `fix` and paste the error or describe what you see.

## Stop condition

If any TypeScript errors cannot be resolved in five minutes, put up your hand for a trainer. Do not proceed to Work Card 03 until all verification steps pass.

## Status
✅ Done
