# Build Blueprint

## Source Files

- `project-brief.md` — confirmed 2025-07-02
- `architecture.md` — confirmed 2025-07-02
- `design.md` — confirmed 2025-07-02

## Project Identity

**Tapau Card Game** — a browser-based Scout-inspired card game with dual-value cards, Scout & Show Chips, smooth animations, a built-in tutorial, and three difficulty modes. One human player vs one AI opponent, fully playable in the browser with no install required.

## Build Shape

**Browser-local tool** (interactive card game SPA). All state is in-memory React state for the session. No localStorage, no backend, no API.

## Version-One Promise

Open the app on localhost, start a game on Standard difficulty, play through at least one full round — deal cards, Show a set, Scout a card, spend a chip, end the round, see the summary modal with correct scores, all with visible smooth animations. Launch the tutorial and step through all 5 steps.

## Scope Lock

### Now
- Vite + React + TypeScript SPA scaffold
- Dual-value card model, hand rack, flip/reorder
- Show action (play valid ascending or descending set)
- Scout action (take card from active set, insert into hand, spend Scout Chip)
- Show Chip mechanic (bonus show)
- AI opponent with Easy / Standard / Hard behaviour
- Round scoring (chips earned = points)
- Round Summary Modal
- Difficulty selector on Start Screen
- In-game tutorial overlay (5 steps, spotlight, tooltip card)
- Smooth Framer Motion animations on all discrete game actions
- HUD: round badge, player score, AI score, chip tokens
- Felt Tactile / Minimal Felt UI (felt green, off-white cards, emerald pills, chip tokens)
- Recoleta + Inter fonts
- Mobile-first layout (375px+), desktop layout (≥900px)
- Mock dataset (Scout card distribution, 45 cards, two players)

### Later
- Networked multiplayer
- Account login + persistent stats
- Custom card back art
- Sound effects

### Never (tonight)
- Backend, database, server
- Real money or payments
- Login or authentication
- Live API or secret keys
- Deployment (Ship cohort only)

## Architecture Summary

- **Stack:** Vite 9 / React 18 / TypeScript / Tailwind CSS v3 / Framer Motion
- **Fonts:** Recoleta + Inter via Google Fonts `<link>` in `index.html`
- **State:** `useReducer` + `useContext` in `src/state/GameContext.tsx`; pure game logic in `src/game/engine.ts`
- **No persistence:** session-only, no localStorage key
- **Folder structure:** `src/game/` (engine, types, mock data, AI), `src/state/` (reducer, context), `src/components/` (all React components)
- **App lives** in this project folder beside `START_HERE.md`

## Data / State / Storage Rules

```ts
// Core types — defined in src/game/types.ts
Card        { id, topValue, bottomValue, orientation: 'normal' | 'flipped' }
ChipSet     { scout: number, show: number }
Player      { id: 'human' | 'ai', hand: Card[], chips: ChipSet, score: number }
TableState  { activeSet: Card[], activeSetOrder, currentTurnIndex, round, phase }
GameState   { players, table, difficulty, deck, tutorialActive, tutorialStep }
```

Reducer actions: `DEAL`, `SHOW`, `SCOUT`, `SPEND_SHOW_CHIP`, `AI_TAKE_TURN`, `END_ROUND`, `SET_DIFFICULTY`, `OPEN_TUTORIAL`, `ADVANCE_TUTORIAL`, `CLOSE_TUTORIAL`, `RESTART_GAME`.

No data is written to `localStorage`. Refresh resets to StartScreen — correct and expected.

## Design Direction Summary

**Borrow:** Deep forest green felt canvas (#0C4A28), off-white card faces (#F0F4F1) with inner border (no shadow), emerald pill buttons (#00A859), Scout Chip amber tokens (#F59E0B) + Show Chip sky-blue tokens (#38BDF8) with SVG icons, Recoleta 700 for display type, Inter for data/labels, spring-curve Framer Motion animations, spotlight tutorial overlay.

**Do not copy:** Casino palette, neumorphism, glassmorphism, gradients, emoji, Scout board-game brand/logo/art, heavy drop shadows, box-in-box surfaces, dark/light toggle.

## Implementation Rules

1. **Strict separation:** `src/game/engine.ts` contains only pure functions (no React, no side effects). Components only call the reducer — they do not run game logic directly.
2. **TypeScript strict mode.** No `any` type unless absolutely unavoidable, and commented with a reason.
3. **Tailwind for all layout/spacing/colour.** Custom tokens in `tailwind.config.js` for felt green, emerald, chip colours. No inline `style` except for Framer Motion dynamic values.
4. **Framer Motion for all animated transitions.** CSS keyframes only for the felt noise overlay.
5. **SVG icons inline** inside components — no emoji, no icon font, no external icon CDN.
6. **Mock data** in `src/game/mockData.ts` must cover the full Scout card distribution (45 dual-value cards, 3 Scout Chips and 3 Show Chips per player for Standard).
7. **AI opponent** logic in `src/game/aiOpponent.ts`. Easy = random valid move. Standard = play longest valid run. Hard = greedy with one-step lookahead.
8. **Tutorial steps** defined as a static array in `src/components/TutorialOverlay.tsx` — no network fetch.
9. **Accessibility:** `aria-label` on all icon buttons, focus rings never hidden, `prefers-reduced-motion` disables Framer Motion spring (uses `duration: 0` tween instead).
10. **One component per file.** No file over ~200 lines — split if needed.

## File and Folder Expectations

```
tapau-card-game/            ← this project folder
  START_HERE.md             ← never deleted
  project-brief.md
  architecture.md
  design.md
  build-blueprint.md
  build-status.md
  prompts/
  work-cards/
  index.html                ← title "Tapau Card Game" (set in Card 01)
  package.json              ← name "tapau-card-game" (set in Card 01)
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  tsconfig.json
  src/
    main.tsx
    App.tsx
    game/
      types.ts
      engine.ts
      mockData.ts
      aiOpponent.ts
    state/
      GameContext.tsx
      gameReducer.ts
    components/
      StartScreen.tsx
      HUD.tsx
      OpponentArea.tsx
      TableArea.tsx
      PlayerHand.tsx
      Card.tsx
      ChipToken.tsx
      ActionBar.tsx
      RoundSummaryModal.tsx
      TutorialOverlay.tsx
      SettingsMenu.tsx
    styles/
      tokens.css
      animations.css
```

## Work Card Plan

1. **01 Project skeleton** — Scaffold Vite + React + TypeScript in this folder; install Tailwind CSS, Framer Motion, and Google Fonts; set title and package name; confirm `npm run dev` starts with the app title visible.
2. **02 First visible version** — Build all layout zones (HUD, OpponentArea, TableArea, PlayerHand, ActionBar, StartScreen, RoundSummaryModal shell, TutorialOverlay shell) with mock data and full design tokens applied; nothing interactive yet.
3. **03 Core behaviour** — Wire up the GameContext reducer; implement Show, Scout, End Turn, AI turn, round scoring, difficulty modes, and the Tutorial step-through; all Framer Motion animations connected.
4. **04 Save or polish** — Phone-width QA (375px), `prefers-reduced-motion` check, all accessibility attributes, final design-token sweep, every `design.md` Visual recipe item verified, complete mock-data test pass.

## Review Mirror

Optional tonight. See `prompts/07-review-mirror.md` after the build cards are done.

## Proof Ladder

App running on localhost. Improved your way. No GitHub or Vercel tonight.

Step-by-step proof:
1. `npm run dev` starts, browser shows StartScreen with felt green canvas and "Tapau" title.
2. Pick Standard difficulty, press Start Game — cards deal with spring animation.
3. Select cards in hand, press Show — cards arc to TableArea, orientation badge updates.
4. Press Scout — one card slides from TableArea to hand with insert animation.
5. AI takes its turn automatically — AI card animates.
6. End the round — RoundSummaryModal fades in with correct scores.
7. Press "Begin Next Round" — modal closes, new cards deal.
8. Open tutorial from StartScreen — spotlight steps through all 5 stops and closes cleanly.
9. Open at 375px width — no overflow, tap targets reachable, all zones visible.

## 60-Second Explanation Template

"Tapau is a browser-based card game inspired by Scout. You and an AI opponent each get a hand of dual-value cards. On your turn you can Show — play a set of cards onto the table — or Scout — take a card from the active set and add it to your hand. Scout and Show Chips let you take bonus moves. At the end of each round, your chips score points. Pick Easy, Standard, or Hard to set the AI difficulty, and use the built-in tutorial if you're new to the game. It runs fully in the browser — no install, no login, no internet needed."

## Guardrails for the Coding Agent

- Read `build-status.md`, `build-blueprint.md`, `design.md`, and the current work card **before** editing any file.
- Implement **only** the current work card. Do not jump ahead to the next card.
- Stop after the work card's verification steps and update `build-status.md`.
- Do not add a backend, auth, database, live API, or secret key — the blueprint does not permit it.
- Do not add `localStorage` — game state is session-only.
- Do not put any secret, password, or real personal data in the app. Use mock/sample data only.
- Do not invent game rules not in the brief. Use the Scout card distribution from `mockData.ts`.
- Do not delete or overwrite `START_HERE.md`, `prompts/`, `work-cards/`, or any planning `.md` file.
- When scaffolding (Card 01): create the Vite app in `app-temp/`, then move everything up to the project root — never use `--overwrite` and never choose "Remove existing files".
- Apply all design tokens from `design.md` — felt green canvas, off-white cards, emerald pills, chip tokens, Recoleta + Inter fonts.
- No emoji anywhere in the rendered UI — SVG icons only.
- No drop shadows — inner borders only on cards and modals.
- No gradients on any surface or button.
- `prefers-reduced-motion`: collapse all Framer Motion spring animations to instant swap.
- All tap targets ≥ 44×44px.
- Focus rings must be visible on keyboard navigation — never `outline: none` without an equivalent replacement.
- If a legacy planning file uses `Build Mode`, treat it as `Build Shape` without stopping.
