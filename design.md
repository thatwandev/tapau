# Design Direction

## Design Inspiration URL

Learner's own description — "Flat Tactile / Minimal Felt UI": a physical board-game table translated into pixels. Deep forest green felt as the canvas, crisp off-white card faces, chunky pill buttons, and etching-style chip tokens. The mood is a premium tabletop game night on a screen, not a casino app and not a generic mobile game.

## What We Borrow

- **Felt canvas:** Deep forest green (#0C4A28) as the full-bleed app background, with a subtle CSS noise/grain overlay (`url("data:image/svg+xml,...")` or a repeating SVG pattern at very low opacity) to give the texture of a real felt mat.
- **Card faces:** High-contrast off-white panels (#F0F4F1), border-radius 20px, a 1px inner border in a slightly darker off-white (#D8DDD9) instead of a drop shadow. Dual values on opposite corners (top-left = topValue, bottom-right = bottomValue, rotated 180°).
- **Pill buttons:** Rounded-full shape. Primary actions (Show, Scout) in bright emerald #00A859 with white label text. Neutral actions (End Turn, settings) in off-white #F0F4F1 with dark label text. No gradient, no shadow.
- **Chip tokens:** Small circular tokens (36–44px diameter) with a bold solid-fill colour per chip type: Scout Chip = amber #F59E0B, Show Chip = sky blue #38BDF8. Monochrome etching-style SVG icon centered inside.
- **Typography:** Recoleta (Google Fonts) for all headings, round numbers, and the game title. Inter for all labels, scores, chip counts, and body text. Both loaded via `<link>` in `index.html`.
- **Accent colours for badges:** Yellow (#FBBF24) for round badge, Cyan (#22D3EE) for turn indicator, Coral Red (#F87171) for AI score, Emerald (#00A859) for player score.
- **Iconography:** Monochrome vector line-art in pastel roundels (SVG inline, no emoji, no icon font).
- **Animation feel:** Smooth, physical, and purposeful — cards arc in from above on deal (spring curve), flip with a Y-axis rotation showing the topValue/bottomValue swap, scouted cards slide from the table to the hand, score numbers count up, modals fade-scale in and out. Nothing bounces or spins gratuitously.

## What We Do Not Copy

- No casino red/black palette — this is a board game, not gambling.
- No heavy drop shadows or neumorphism — flat with a single subtle inner border only.
- No glassmorphism or frosted blur panels.
- No gradient fills on any surface or button.
- No emoji anywhere — they render inconsistently across devices.
- No rounded boxes inside rounded boxes (no card-inside-a-card layering).
- No dark mode / light mode toggle — the felt green IS the design.
- No busy patterns on card backs that obscure the dual values.
- No brand names, logos, or art copied from the physical Scout board game.

## Visual Mood

Premium tabletop game night. Tactile and physical — every element should feel like it could be picked up. Calm enough to focus on strategy, bold enough that actions feel satisfying. Colours are punchy but grounded by the dark green felt.

## Layout Rules

### Viewport zones (mobile-first, vertical stack)

1. **HUD (top bar):** Fixed height ~56px. Settings icon (left), Round badge + score (centre), Opponent chip count (right). Safe-area inset padding on mobile notches (`padding-top: env(safe-area-inset-top)`).
2. **Opponent Area (top ~25% of remaining height):** Compact row: face-down card count (rendered as small stacked card-back silhouettes), chip tokens for opponent, last played set preview (small). Background: slightly lighter felt (#0F5C32) to differentiate from canvas.
3. **Table Area (centre ~30%):** The active played set rendered as a row of full Card components inside a dashed-border drop-zone frame. An orientation badge (↑ Ascending / ↓ Descending) sits top-right. Empty state: a centred label "No cards played yet" in muted green-white.
4. **Player Hand (lower ~30%):** Horizontally scrollable rack of Card components. Selected cards have a 2px emerald ring. Flip button on each card (small rotate icon in top-right corner). Cards can be long-press-dragged to reorder.
5. **Action Bar (fixed bottom):** Three pill buttons: Show (emerald, disabled if selection is invalid), Scout (emerald, disabled if no card scoutable), End Turn (off-white). Above them: player's chip tokens inline.

### Desktop (≥ 900px)
- Max-width container centred at 960px, felt green bleeds edge to edge.
- Opponent Area and Table Area share the top half side-by-side (Opponent left, Table right).
- Player Hand and Action Bar fill the bottom half.

### Modal overlays
- Full-screen semi-transparent dark overlay (#000 at 60% opacity).
- Modal panel: off-white (#F0F4F1), border-radius 24px, max-width 480px, centred vertically.
- No scroll within modal — keep content to one screen height.

## Color / Contrast Rules

| Role | Hex | Notes |
|---|---|---|
| Canvas / felt | #0C4A28 | Full-bleed background |
| Opponent area | #0F5C32 | Slightly lighter felt |
| Card face | #F0F4F1 | Off-white surface |
| Card border | #D8DDD9 | 1px inner border |
| Primary button | #00A859 | Emerald — Show, Scout |
| Primary button text | #FFFFFF | White |
| Neutral button | #F0F4F1 | Off-white — End Turn |
| Neutral button text | #1A2E1F | Dark green-black |
| Scout Chip | #F59E0B | Amber token |
| Show Chip | #38BDF8 | Sky blue token |
| Round badge | #FBBF24 | Yellow |
| Player score | #00A859 | Emerald |
| AI score | #F87171 | Coral red |
| Turn indicator | #22D3EE | Cyan |
| Muted text | #5A7A62 | Labels on felt |
| White text | #F0F4F1 | On dark surfaces |

All text/background combinations meet WCAG AA (4.5:1 minimum). Card face values are #1A2E1F on #F0F4F1 (contrast ~12:1). White text on #0C4A28 (contrast ~9:1).

## Typography Feel

- **Recoleta** (weight 700): game title, round number, score totals, modal headings. Loaded via Google Fonts. Fallback: `'Cooper Black', serif`.
- **Inter** (weights 400, 600): all labels, chip counts, card values, button text, tutorial body. Loaded via Google Fonts. Fallback: `system-ui, sans-serif`.
- Card values: Inter 600, 28px (topValue top-left), 20px rotated 180° (bottomValue bottom-right).
- HUD scores: Recoleta 700, 24px.
- Chip count labels: Inter 600, 14px, tabular-nums (`font-variant-numeric: tabular-nums`).
- Button labels: Inter 600, 15px.
- No italic. No underline except active links.

## Component Style

### Card
- Size: 72px × 104px (mobile), 84px × 120px (desktop).
- Background: #F0F4F1. Border-radius: 12px. Border: 1px solid #D8DDD9.
- topValue: top-left corner, Inter 600 28px, #1A2E1F.
- bottomValue: bottom-right corner, rotated 180°, Inter 600 20px, #5A7A62.
- On flip: Framer Motion `rotateY` 0→180°, front shows topValue prominently, back shows bottomValue prominently (card flipped in hand).
- Selected state: 2px solid #00A859 ring, slight translateY(-4px) lift.
- Card back (opponent hand): solid #1A2E1F with a subtle diagonal SVG hatch pattern.

### Chip Token
- Shape: circle, 40px diameter.
- Scout Chip: #F59E0B fill, white SVG magnifying glass icon (14px).
- Show Chip: #38BDF8 fill, white SVG eye/show icon (14px).
- Spent chip: 40% opacity, grayscale.
- Count badge: small white circle top-right of token cluster showing integer count.

### Action Pills (buttons)
- Height: 48px. Padding: 0 24px. Border-radius: 9999px.
- Primary (Show, Scout): background #00A859, text white, Inter 600.
- Neutral (End Turn): background #F0F4F1, text #1A2E1F, Inter 600.
- Disabled: 40% opacity, cursor not-allowed, no hover effect.
- Hover (enabled): brightness 1.08, transition 150ms.
- Active/press: scale(0.96), transition 80ms.

### HUD Bar
- Background: #0A3D20 (darker felt), height 56px.
- Round badge: Recoleta 700, yellow #FBBF24, inside a 28px pill.
- Player score: Recoleta 700, emerald #00A859.
- AI score: Recoleta 700, coral #F87171.
- Settings icon: 24px monochrome SVG, #A8C5B0.

### Round Summary Modal
- Header: Recoleta 700, 28px, #1A2E1F, "Round N Complete".
- Score rows: Inter 600, 18px, player colour.
- "Begin Next Round" button: full-width emerald pill.
- Modal entrance: fade + scale(0.9→1.0), 240ms ease-out.

### Tutorial Overlay
- Backdrop: #000 at 70%.
- Spotlight: transparent cutout over highlighted element (box-shadow punch-out technique).
- Tooltip card: off-white, border-radius 16px, max-width 320px, Inter 400 15px body.
- Step indicator: dots row, active dot emerald, inactive dot muted.
- Prev / Next / Close: pill buttons.

## Mobile Rules

- Minimum tested width: 375px (iPhone SE).
- HUD collapses opponent chip count to a single token icon + number.
- Player Hand horizontal scroll with momentum (`overflow-x: auto; -webkit-overflow-scrolling: touch`), no visible scrollbar.
- Action Bar fixed to bottom with `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch.
- Cards in hand slightly smaller on mobile (72×104px) vs desktop (84×120px).
- Tutorial tooltip repositions below the spotlight on small screens.
- No horizontal overflow on any zone — test at 375px that nothing is clipped.
- Tap targets minimum 44×44px (WCAG 2.5.5).

## Accessibility Basics

- All interactive elements have `aria-label` or visible label text.
- Focus ring visible on keyboard navigation (2px emerald outline, never hidden).
- Card flip button has `aria-label="Flip card"` and `aria-pressed` state.
- Chip tokens have `aria-label="Scout Chips: N"` / `aria-label="Show Chips: N"`.
- Modal traps focus while open; Escape closes it.
- Motion reduced: `@media (prefers-reduced-motion: reduce)` disables Framer Motion spring animations, uses instant swap instead.
- Colour is not the only differentiator — chip type also distinguished by icon shape.
- Score and round updates announced via `aria-live="polite"` region.

## Anti-Slop Rules

- No fake logos, no fake brand, no fake testimonials, no fake stats.
- No "lorem ipsum" anywhere in the final build.
- No emoji anywhere on the screen — use SVG icons only.
- No box around every section — zones are differentiated by background colour, not borders.
- No pill around plain text that is not a button or badge.
- No heavy drop shadows — inner borders only.
- No gradient fills on cards or buttons.
- No invented game rule not present in Scout (Tapau) — mock data matches the real card distribution.
- All sample data is game data, not user data — no real names, phone numbers, or personal information anywhere.
- Readable and usable at 375px width — test before marking any card done.

## Design Verification Checklist

- [ ] Canvas is felt green (#0C4A28) with noise overlay
- [ ] Cards are off-white (#F0F4F1), border-radius 12px, inner border only (no shadow)
- [ ] Dual values visible on each card (topValue top-left, bottomValue bottom-right rotated)
- [ ] Scout Chips amber, Show Chips sky blue, both with SVG icons
- [ ] Recoleta used for title, round, scores; Inter for labels and card values
- [ ] Pill buttons: emerald for primary, off-white for neutral; no gradients
- [ ] HUD has round badge, player score (emerald), AI score (coral), chip counts
- [ ] Round Summary Modal fades/scales in, has "Begin Next Round" full-width button
- [ ] Tutorial overlay has spotlight cutout + tooltip card + dot step indicator
- [ ] Difficulty selector present on StartScreen with Easy / Standard / Hard options
- [ ] Smooth animations on: deal, flip, scout insert, show play, score count-up, modal open/close
- [ ] No emoji anywhere
- [ ] No drop shadows
- [ ] No gradients
- [ ] Renders cleanly at 375px wide (no horizontal overflow, no clipped text or buttons)
- [ ] All tap targets ≥ 44px
- [ ] Focus rings visible on keyboard navigation
- [ ] `prefers-reduced-motion` respected

## Visual recipe

The build follows this section card by card. The style above sets the colours, typeface and mood; this section fixes what each screen shows and how its surfaces, zones and interactive pieces are built, and wins wherever the two differ.

- **StartScreen:** App title "Tapau" in Recoleta 700, 48px, white, centred. One-line tagline in Inter 400, 16px, muted. Three difficulty option cards (Easy / Standard / Hard): off-white panels, border-radius 16px, no shadow; selected card has a 2px emerald ring and a subtle scale(1.03) lift. "Start Game" pill button below (full-width emerald, 52px height). "How to Play" text link below that (Inter 400, underlined, muted). Canvas is full-bleed felt green.
- **HUD:** Single bar #0A3D20. Left: settings gear SVG in a 40px touch target. Centre: "Round N" in a yellow pill badge (Recoleta 700) flanked by player score (emerald) and AI score (coral), both Recoleta 700 24px. Right: player's chip token cluster (Scout amber circle + Show sky-blue circle, each with a count badge). No border under HUD — felt canvas continues below.
- **Opponent Area:** Slightly lighter felt strip (#0F5C32). A row of small card-back silhouettes (stacked, showing count). Opponent chip tokens beside them. Opponent's last played set shown as miniature cards (40px wide) in a row labelled "Last played" in muted Inter 12px.
- **Table Area:** Centred dashed-border rectangle on the felt (#1A6B3C dashes, border-radius 12px). Active set cards laid out in a horizontal row with even spacing. Orientation badge top-right (↑ or ↓, Inter 600, cyan #22D3EE). Empty state: centred muted label "No set played yet". Cards in the set are full Card components (slightly smaller: 60×88px).
- **Player Hand:** Horizontal scroll rack, no visible scrollbar. Cards slightly fanned/overlapping (negative margin −12px). Selected card lifts with emerald ring. Each card has a small flip-icon button (top-right, 24px touch target). Rack is labelled "Your Hand" in muted Inter 12px above it.
- **Action Bar:** Fixed bottom, #0A3D20 background, safe-area inset. Three pill buttons side by side: "Show" (emerald, left), "Scout" (emerald, centre), "End Turn" (off-white, right). Player's chip tokens shown inline above the buttons as a mini row. Disabled buttons at 40% opacity.
- **Round Summary Modal:** Overlay backdrop #000 60%. Panel off-white, border-radius 24px, max-width 480px, centred. Recoleta 700 28px heading "Round N Complete". Two score rows (player emerald, AI coral), Inter 600 20px. Chips-earned line in Inter 400 16px muted. Full-width "Begin Next Round" emerald pill button. Entrance: fade-in + scale(0.9→1.0) 240ms.
- **Tutorial Overlay:** Full-screen backdrop #000 70% with a transparent spotlight rectangle (box-shadow inset punch-out) over the highlighted component. Tooltip off-white card (border-radius 16px, max-width 320px) positioned near the spotlight. Body Inter 400 15px. Step title Inter 600 16px. Dot indicators (5 dots, active = emerald, inactive = #5A7A62). "Next" emerald pill (right), "Back" off-white pill (left), "✕ Close" top-right.
- **Colour:** Felt green canvas, one primary accent emerald #00A859, chip accent amber + sky-blue, score accents coral + emerald, round accent yellow. Five-colour palette with AA contrast on all surfaces.
- **Surfaces:** At most three distinct surface levels: felt canvas (#0C4A28), zone strips (#0F5C32 / #0A3D20), card/modal off-white (#F0F4F1). Never a box inside a box. No border AND shadow on the same element.
- **Width:** ≥900px: centred 960px max-width container, zones side by side in upper half. <900px: single vertical column, full width.
- **Type:** Recoleta for display numbers and headings; Inter for everything else. Tabular nums on all numeric values (`font-variant-numeric: tabular-nums`). Emphasis by size/weight only.
- **Motion:** Cards spring-deal from a centre point to their hand positions on game start. Card flip: Framer Motion rotateY 180°, 300ms. Scout: card slides from table to hand insertion point, 350ms spring. Show: selected cards arc from hand to table, 300ms. Score count-up: number increments from previous to new value, 500ms. Modal: fade + scale 240ms. Nothing loops or auto-plays. `prefers-reduced-motion`: all transitions collapse to instant swap.
- **No new library beyond Framer Motion:** Tailwind CSS + inline SVG for all decoration. No emoji anywhere.
