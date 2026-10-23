# Project Brief

## Project Identity

**Tapau Card Game**

## One-Sentence Concept

A browser-based Scout-inspired card game with dual-value cards, Scout & Show Chips, smooth animations, a built-in tutorial, and three difficulty modes — playable solo against an AI opponent whenever friends aren't around.

## Target User

Board game and card game enthusiasts who want to play a Scout-style game in a browser whenever they can't meet friends to play physically.

## User Goal

Deal cards, manage a dual-value hand, flip and reorder cards, Scout from the active table set, Show a matching set, spend and earn Scout & Show Chips, track scores and chip counts in the HUD, complete rounds, choose a difficulty level, and learn the rules through a built-in tutorial — all in the browser with no install required.

## Build Shape

Browser-local tool (interactive card game SPA — the primary value is playing and changing game state; the full turn loop must run and persist within a session).

## Shape Confirmation

Confirmed — the main user action is playing turns in a stateful game loop, not reading content. All state is in-memory per session (no backend needed).

## Version-One Success

- Full turn loop works in-browser using mock/sample data
- Dual-value cards dealt and displayed in player's horizontal hand rack
- Cards can be flipped (orientation toggle) and reordered
- Active played set displayed on the table area
- Scout action: take a card from the table set, insert it into hand
- Show action: play a valid set from hand onto the table
- Scout Chips and Show Chips visually present per player, spent/gained mechanically
- HUD shows round number, per-player scores, and chip counts
- Round summary modal appears at round end with scores
- Difficulty selector (Easy / Standard / Hard) at game start
- Built-in step-by-step tutorial for new players
- Smooth CSS/JS animations on every action (deal, flip, scout insert, show, score tick, modal transition)
- Works on mobile viewport (375px+) and desktop

## Now / Later / Never

### Now
- Vite + React + TypeScript SPA
- Dual-value card model (topValue, bottomValue, orientation)
- Hand rack with flip and drag-to-reorder
- Active table state (current played set, whose turn)
- Show action (play a valid ascending or descending set)
- Scout action (take one card from active set, insert into hand)
- Scout Chips and Show Chips tracked per player
- AI opponent (one player vs one AI) for each difficulty tier
- Round scoring (chips returned = points at round end)
- Round summary modal
- Difficulty selector modal at game start (Easy / Standard / Hard)
- In-game tutorial overlay (step-by-step, triggerable from menu)
- Smooth animations throughout (Framer Motion or CSS transitions)
- HUD: round counter, player score, AI score, chip counts
- Mobile-first responsive layout
- Tailwind CSS with custom Flat Tactile / Minimal Felt design tokens
- Mock dataset so every UI state is testable immediately

### Later
- Multiplayer over a network
- Account login and persistent stats
- Custom card back art
- Sound effects

### Never (tonight)
- Backend, database, or server
- Real money or payments
- Login or authentication
- Live API or secret keys
- Networked multiplayer
- Deployment (Ship is taught in Build & Ship cohort)

## Assumptions

- One human player vs one AI opponent per game session
- AI opponent behaviour differs per difficulty: Easy (random valid moves), Standard (greedy), Hard (look-ahead heuristic)
- Game state resets on page refresh (no localStorage persistence required for this game type)
- All card values and chip counts use the official Scout card distribution as the mock dataset
- No real personal data anywhere in the app

## Proof Target

Open the app on localhost, start a game on Standard difficulty, play through at least one full round: deal cards, Show a set, Scout a card, spend a chip, end the round, see the summary modal with correct scores — all with visible animations. Then launch the tutorial and step through it.

## Trainer / Learner Notes

- Design system: Flat Tactile / Minimal Felt UI (deep forest green felt, off-white cards, emerald pill buttons)
- Fonts: Recoleta or Cooper Black (headers), Inter (data/labels)
- Animations: smooth on every discrete game action
- Scout Chips and Show Chips are physical game pieces — render them as tokens, not text labels
