# Build Status

## Setup Gate

- Node.js: v24.21.0 ✓
- npm: 11.19.0 ✓
- Git: 2.39.2 ✓
- Status: Passed

## Current KDBM Lite Stage

Build

## Current Phase

Localhost QA Complete

## Current Work Card

`work-cards/04-save-or-polish.md`

## Completed Planning Phases

- [x] Setup Gate
- [x] Project Brief / Identity
- [x] Architecture
- [x] Design
- [x] Build Blueprint
- [x] Work Cards (01 – 04)

## Decisions Made

- **Project name:** Tapau Card Game
- **Build shape:** Browser-local tool (interactive card game SPA)
- **Shape confirmation:** Confirmed — main user action is playing turns in a stateful game loop
- **Stack:** Vite 8 / React 19 / TypeScript / Tailwind CSS v3 / Framer Motion
- **Fonts:** Recoleta + Inter via Google Fonts
- **State management:** useReducer + useContext; no external store
- **Storage:** None — game sessions are ephemeral (no localStorage)
- **Design system:** Flat Tactile / Minimal Felt UI (felt green canvas, off-white cards, emerald pills, chip tokens)
- **AI opponent:** Easy (random) / Standard (greedy longest run) / Hard (lookahead)
- **Proof target:** Full round loop with mock data, Tutorial, Difficulty selector, smooth animations

## Work Cards

| Card | File | Status |
|---|---|---|
| 01 | work-cards/01-project-skeleton.md | ✅ Done |
| 02 | work-cards/02-first-visible-version.md | ✅ Done |
| 03 | work-cards/03-core-behaviour.md | ✅ Done |
| 04 | work-cards/04-save-or-polish.md | ✅ Done |

## WC04 Changes Applied

- Removed stale `OpponentArea` import from `App.tsx` (was causing TS6133 unused-import error)
- Added `useReducedMotion()` from Framer Motion to `Card.tsx` — all spring/deal transitions collapse to `duration: 0` when `prefers-reduced-motion: reduce` is active
- Added focus trap to `SettingsMenu.tsx` — first player-count button receives focus 80ms after panel opens; `Escape` closes
- Fixed `SettingsMenu` close button tap target: `w-8 h-8` → `min-w-[44px] min-h-[44px]`
- Added `.hide-scrollbar` CSS class to `tokens.css` (covers `scrollbar-width: none`, `ms-overflow-style: none`, `::webkit-scrollbar: display none`)
- Applied `hide-scrollbar` class to `PlayerHand` scroll container (replaced inline style props)
- Added `felt-noise` class to GameScreen root `<div>` so the grain overlay covers the game screen canvas

## Core Gameplay Fixes and Local QA

- Corrected the Scout deck and deals for 3, 4, and 5 players (12, 11, and 9 cards each) and removed the opening Active Set.
- Corrected legal Show validation, match/run strength, trophy capture, Scout ownership rewards, and negative hand scoring including the lockout exemption.
- Implemented a complete Scout & Show action for the player and Hard AI, chained turns for every AI seat, rotating starting player, and game end after the player-count number of rounds.
- Made difficulty/player-count changes start a matching fresh game and kept opponent panels and action controls visible at localhost viewport size.
- Added the latest player action to the center board with an animated transition.
- Verified 3/4/5-player deals, Easy/Standard/Hard selections, human Scout & Show, AI chaining, lockout scoring, round rotation, and cumulative scoring.
- `npm run build` and `npm run lint` pass.

## Blockers

None.

## Next Instruction for AI

All work cards and core localhost QA are complete. Continue from the user's play-through feedback; graphics polish is intentionally deferred.
