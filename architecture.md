# Architecture

## Build Shape

Browser-local tool — interactive card game SPA. All game state lives in React state/context in-memory for the session. No persistence between browser refreshes is required (games are self-contained sessions).

## Stack Decision

- **Bundler:** Vite 9.x
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS v3 with custom design tokens (Flat Tactile / Minimal Felt palette)
- **Animation:** Framer Motion (card deals, flips, scout inserts, score ticks, modal transitions)
- **Fonts:** Google Fonts — Recoleta (headers, fallback: Cooper Black, serif); Inter (data/labels, fallback: system-ui)
- **State:** React `useReducer` + `useContext` (game engine state); no external state library needed at this scale
- **Storage:** None — game sessions are ephemeral (no `localStorage` key required)
- **Testing/mock data:** Inline TypeScript mock dataset; no external API

## Structure Overview

```
src/
  main.tsx                   # App entry, mounts <App />
  App.tsx                    # Root: routes between StartScreen, GameScreen, TutorialOverlay
  game/
    engine.ts                # Pure game-rules functions (deal, validate show, scout logic, scoring)
    types.ts                 # All TypeScript interfaces/types
    mockData.ts              # Scout card distribution + sample game state
    aiOpponent.ts            # AI move logic per difficulty tier
  state/
    GameContext.tsx           # useReducer store + context provider
    gameReducer.ts            # All state transitions (DEAL, SHOW, SCOUT, SPEND_CHIP, END_ROUND, etc.)
  components/
    StartScreen.tsx           # Difficulty selector + Start / Tutorial buttons
    HUD.tsx                   # Top bar: round, scores, chip counts
    OpponentArea.tsx          # Opponent card count, last played set, chip tokens
    TableArea.tsx             # Active played set with card drop-slot frames
    PlayerHand.tsx            # Horizontal scrollable card rack
    Card.tsx                  # Dual-value card (topValue/bottomValue, flip animation)
    ChipToken.tsx             # Scout Chip or Show Chip token component
    ActionBar.tsx             # "Show", "Scout", "End Turn" pill buttons
    RoundSummaryModal.tsx     # Round-end overlay with scores + "Begin Next Round"
    TutorialOverlay.tsx       # Step-by-step tutorial, triggerable from menu
    SettingsMenu.tsx          # Slide-in settings panel (difficulty, tutorial, restart)
  styles/
    tokens.css                # Tailwind custom tokens (felt green, card white, chip colours)
    animations.css            # Global Framer Motion variants / CSS keyframes
```

## Component Map

```
App
├── StartScreen (difficulty pick, start, open tutorial)
└── GameScreen
    ├── HUD (round, scores, chip counts)
    ├── OpponentArea (card back count, chip tokens, last set)
    ├── TableArea (active set cards, orientation indicator)
    ├── PlayerHand (scrollable card rack, flip toggle, reorder)
    ├── ActionBar (Show pill, Scout pill, End Turn pill)
    ├── RoundSummaryModal (overlay, scores, next round CTA)
    ├── TutorialOverlay (step overlay, prev/next/close)
    └── SettingsMenu (slide-in panel)
```

## Data / State Model

### Card
```ts
interface Card {
  id: string;           // e.g. "card-01"
  topValue: number;     // 1–10 (one side)
  bottomValue: number;  // 1–10 (other side)
  orientation: 'normal' | 'flipped';
}
```

### ChipSet
```ts
interface ChipSet {
  scout: number;   // Scout Chips remaining
  show: number;    // Show Chips remaining
}
```

### Player
```ts
interface Player {
  id: 'human' | 'ai';
  hand: Card[];
  chips: ChipSet;
  score: number;
}
```

### TableState
```ts
interface TableState {
  activeSet: Card[];           // cards currently on the table
  activeSetOrder: 'asc' | 'desc' | null;
  currentTurnIndex: number;   // 0 = human, 1 = ai
  round: number;
  phase: 'start' | 'playing' | 'roundEnd' | 'gameEnd';
}
```

### GameState (root)
```ts
interface GameState {
  players: [Player, Player];  // [human, ai]
  table: TableState;
  difficulty: 'easy' | 'standard' | 'hard';
  deck: Card[];
  tutorialActive: boolean;
  tutorialStep: number;
}
```

### Reducer Actions
- `DEAL` — shuffle deck, distribute cards to both players
- `SHOW` — human plays a valid set onto the table
- `SCOUT` — human takes one card from active set, inserts into hand, spends a Scout Chip
- `SPEND_SHOW_CHIP` — human uses a Show Chip for a bonus show
- `AI_TAKE_TURN` — AI plays its move based on difficulty
- `END_ROUND` — tally scores, reset deck, advance round
- `SET_DIFFICULTY` — change difficulty before game starts
- `OPEN_TUTORIAL` / `ADVANCE_TUTORIAL` / `CLOSE_TUTORIAL`
- `RESTART_GAME`

## Storage Logic

No `localStorage` is used. The game session exists entirely in React state. If the user refreshes, the game resets to the Start Screen — this is expected and correct for a card game.

## User Flow

```
StartScreen
  → pick difficulty (Easy / Standard / Hard)
  → [optional] open Tutorial
  → press "Start Game"
GameScreen
  → HUD shows round 1, scores 0/0, chip counts
  → cards deal with animation
  → Human turn: view hand, select cards, choose Show or Scout
  → AI turn: AI moves automatically (with animation delay)
  → Repeat until one player empties their hand (or passes)
  → RoundSummaryModal: show per-player scores, chips earned
  → "Begin Next Round" → new deal, round counter increments
  → Game ends after agreed number of rounds (or one player has no chips)
TutorialOverlay
  → step 1: "This is your hand" (highlights PlayerHand)
  → step 2: "This is the active set" (highlights TableArea)
  → step 3: "Flip a card to Scout" (highlights Card flip)
  → step 4: "Use Show to play a set" (highlights ActionBar)
  → step 5: "Scout & Show Chips" (highlights ChipToken)
  → Close → returns to game or StartScreen
```

## File Expectations

- App lives in this project folder beside `START_HERE.md` (after Card 01 scaffold)
- `src/` contains all application code
- `index.html` title = "Tapau Card Game"
- `package.json` name = `tapau-card-game`
- No files outside `src/` are modified during build cards except `index.html` and `package.json`
- `work-cards/`, `prompts/`, `START_HERE.md`, planning `.md` files are never deleted or overwritten

## Constraints

- No backend, no API calls, no `localStorage`, no environment variables, no secret keys
- No networked multiplayer
- No login, auth, or payments
- Framer Motion is the only animation library permitted
- Google Fonts loaded via `<link>` in `index.html` (no CSS `@import`)
- All game state derived from the reducer — no ad-hoc component-level state for game logic

## Technical Non-Goals

- Server-side rendering
- PWA / offline mode
- Save/load game to disk
- Real-money mechanics
- Analytics or telemetry

## Verification Notes

- `npm run dev` starts with no TypeScript errors
- Starting a game on Standard difficulty and playing one full round (Show → Scout → End Round) must complete without a runtime error
- Tutorial overlay must open and step through all 5 steps without freezing
- App renders correctly at 375px wide (mobile) and 1280px wide (desktop)
