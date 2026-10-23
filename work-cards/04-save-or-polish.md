# Work Card 04: Save or Polish

## Goal

Final quality pass: phone-width QA at 375px, `prefers-reduced-motion` verification, all accessibility attributes, a full sweep of every rule in `design.md`'s Visual recipe, and a complete mock-data test run of the game loop. This card has no new feature code — it is the finishing card that makes everything shippable.

Note: this is a card game SPA — **no `localStorage` is added**. Game sessions are ephemeral by design. This card is the polish card.

## Inputs

- `build-blueprint.md` — proof ladder, guardrails
- `design.md` — Visual recipe, Design Verification Checklist, Mobile Rules, Accessibility Basics, Anti-Slop Rules
- `architecture.md` — verification notes

## Files likely touched

- `src/styles/tokens.css` (fixes to ensure all Tailwind tokens render)
- `src/styles/animations.css` (`prefers-reduced-motion` block, felt noise overlay)
- `src/components/Card.tsx` (aria-labels, focus rings, min tap target)
- `src/components/ChipToken.tsx` (aria-labels)
- `src/components/HUD.tsx` (aria-live region for score)
- `src/components/PlayerHand.tsx` (scrollbar hidden on all browsers, touch scroll)
- `src/components/ActionBar.tsx` (safe-area inset, 44px tap targets)
- `src/components/TableArea.tsx` (empty-state styling, aria-label)
- `src/components/RoundSummaryModal.tsx` (focus trap, Escape key close)
- `src/components/TutorialOverlay.tsx` (focus trap, Escape key close)
- `src/components/SettingsMenu.tsx` (focus trap, Escape key close)
- `src/components/StartScreen.tsx` (mobile layout, aria-pressed on difficulty buttons)
- `index.html` (lang attribute, meta viewport)

## Instructions for the coding agent

### Step 1 — index.html baseline

Ensure `index.html` has:
```html
<html lang="en">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0C4A28">
```

### Step 2 — Verify and fix the felt noise overlay

In `src/styles/animations.css`, confirm the `.felt-noise::after` pseudo-element is applied correctly and the SVG noise pattern renders as a subtle grain. Test by zooming in on the canvas — there should be a faint texture, not a blank solid colour.

If the inline SVG data URI is blocked by CSP, switch to a CSS `background-image: url()` approach with a small repeating CSS pattern using `repeating-conic-gradient` or a tiny Base64 PNG texture instead.

### Step 3 — Mobile layout QA at 375px

Open DevTools → Device Toolbar → set to 375px wide. Check every screen:

**StartScreen:**
- [ ] Title "Tapau" fully visible, not clipped.
- [ ] All three difficulty option cards fully visible, no horizontal overflow.
- [ ] Start Game button full width, not clipped.
- [ ] "How to Play" link visible below button.

**GameScreen:**
- [ ] HUD bar does not overflow. Settings icon, round badge, chip tokens all on one row.
- [ ] OpponentArea fits in one row — card backs + chip tokens, no overflow.
- [ ] TableArea centred, dashed border visible, active set cards fit without overflow.
- [ ] PlayerHand scrolls horizontally. No card is cut off at the right edge — user can scroll to see all 8+ cards.
- [ ] ActionBar: three pill buttons all visible in one row. If they overflow at 375px, reduce button text to "Show" / "Scout" / "End" or reduce padding until all three fit.
- [ ] No content hidden behind the fixed HUD at the top.
- [ ] No content hidden behind the fixed ActionBar at the bottom.

**RoundSummaryModal:**
- [ ] Modal panel fits within 375px with horizontal margin. Text not clipped.

**TutorialOverlay:**
- [ ] Tooltip card fits within 375px.

Fix any overflow or clipping issues found.

### Step 4 — Tap target audit (min 44×44px)

Check every interactive element:
- Card flip button: currently 20px — wrap in a 44×44px touch target div with `padding: 12px` and keep the SVG icon at 16px visually.
- HUD Settings icon: already 40px — bump to 44px.
- Chip token count badge: not interactive, no change needed.
- ActionBar buttons: already 48px height — confirm width is ≥44px on all three.
- Tutorial Next / Back / Close buttons: confirm height ≥44px.
- Difficulty option cards on StartScreen: already large — confirm minimum height ≥44px.

Add `min-w-[44px] min-h-[44px]` or explicit sizing wherever a tap target is under 44px.

### Step 5 — Accessibility attributes sweep

For every interactive element, ensure:

**Cards (in PlayerHand):**
```tsx
<div role="button" aria-label={`Card ${card.topValue}/${card.bottomValue}`}
  aria-pressed={selected} tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
```

**Card flip button:**
```tsx
<button aria-label="Flip card" aria-pressed={card.orientation === 'flipped'}>
```

**ChipToken:**
```tsx
aria-label={`${type === 'scout' ? 'Scout' : 'Show'} Chips: ${count}`}
```

**HUD score — add aria-live region:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Your score: {human.score}. Opponent score: {ai.score}.
</div>
```

**ActionBar buttons:** already have `aria-label` — confirm they are present.

**RoundSummaryModal — focus trap:**
Use `useEffect` to focus the "Begin Next Round" button when the modal opens:
```tsx
const btnRef = useRef<HTMLButtonElement>(null);
useEffect(() => { btnRef.current?.focus(); }, []);
```
Add `onKeyDown` on the modal backdrop that calls `onClose` when `Escape` is pressed.

**TutorialOverlay — focus trap:**
Same pattern: focus the "Next" button on mount. `Escape` calls `onClose`.

**SettingsMenu — focus trap:**
Focus the first settings option on open. `Escape` calls `onClose`.

**StartScreen difficulty buttons:**
Confirm `aria-pressed={difficulty === d.id}` is on each button.

### Step 6 — Focus ring visibility

Ensure `outline` is never globally removed. In `tokens.css`, add:
```css
:focus-visible {
  outline: 2px solid #00A859;
  outline-offset: 2px;
}
```

Remove any `outline: none` or `focus:outline-none` classes that are not paired with a custom focus style.

### Step 7 — prefers-reduced-motion final check

In `src/styles/animations.css`, confirm:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

In Framer Motion components, add `useReducedMotion()` hook and set `transition={{ duration: 0 }}` when `shouldReduceMotion` is true:

```tsx
import { useReducedMotion } from 'framer-motion';

function Card(...) {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24 };
  // apply to all motion.div animate props
}
```

Test in DevTools: Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce` → all animations should be instant.

### Step 8 — Visual recipe final sweep

Go through every item in `design.md ## Visual recipe` and confirm each is implemented:

- [ ] **StartScreen:** "Tapau" in Recoleta 700 48px white; tagline in Inter 400 16px muted; three difficulty cards (off-white, border-radius 16px, emerald ring on selected); "Start Game" full-width emerald pill 52px; "How to Play" underlined muted link; full-bleed felt canvas.
- [ ] **HUD:** #0A3D20 bar 56px; settings gear SVG; "Round N" yellow pill badge Recoleta 700; player score emerald, AI score coral, both Recoleta 700 24px; chip token cluster right side; no border under HUD.
- [ ] **Opponent Area:** #0F5C32 strip; card back silhouettes (stacked look); chip tokens; last-played label in muted Inter 12px.
- [ ] **Table Area:** centred dashed border rectangle; orientation badge cyan; cards as Card components (60×88px); empty-state muted label.
- [ ] **Player Hand:** horizontal scroll, no scrollbar visible; cards with -12px negative margin overlap; selected card lifts with emerald ring; flip icon button each card; "Your Hand" label muted Inter 12px.
- [ ] **Action Bar:** #0A3D20 fixed bottom; safe-area inset; chip tokens above buttons; Show + Scout emerald pills; End Turn off-white pill; disabled at 40% opacity.
- [ ] **Round Summary Modal:** backdrop #000 60%; panel off-white border-radius 24px max-width 480px; Recoleta 700 28px heading; score rows colour-coded; full-width emerald pill; fade+scale 240ms entrance.
- [ ] **Tutorial Overlay:** backdrop #000 70%; tooltip off-white border-radius 16px max-width 320px; dot indicators; Next emerald pill; Back off-white pill; Close button.
- [ ] **Colour:** all tokens match design.md hex values exactly.
- [ ] **Surfaces:** three distinct levels only — no box inside a box.
- [ ] **Width:** ≥900px uses centred 960px container. <900px single column full width.
- [ ] **Type:** Recoleta for display; Inter for everything else; tabular-nums on all scores and counts.
- [ ] **Motion:** all five animation types present and smooth (deal spring, flip rotateY, modal fade-scale, settings slide, score count-up).
- [ ] **No emoji anywhere on screen.**
- [ ] **No drop shadows anywhere.**
- [ ] **No gradients on any surface or button.**

Fix any recipe item not yet implemented before marking this card done.

### Step 9 — Anti-slop final check

Walk through the Anti-Slop Rules in `design.md`:
- [ ] No fake logos, no fake brand, no fake testimonials.
- [ ] No "lorem ipsum" text anywhere.
- [ ] No emoji anywhere on screen.
- [ ] No pill around plain text (only pills on buttons/badges).
- [ ] No heavy drop shadows — inner borders only on cards and modals.
- [ ] No gradients on surfaces or buttons.
- [ ] No invented game rules — mock data uses real Scout card distribution.
- [ ] All values shown are from the mock dataset, not typed-in static numbers.
- [ ] Readable at 375px — confirmed in Step 3.

### Step 10 — Complete mock-data test run (proof ladder)

Run through the full Proof Ladder from `build-blueprint.md`:

1. `npm run dev` → StartScreen renders on dark felt canvas with "Tapau" in serif.
2. Pick Standard, press Start Game → cards deal with spring animation.
3. Select cards with consecutive values, press Show → cards arc to table, orientation badge updates.
4. Press Scout → card slides from table to hand.
5. Wait → AI takes its turn, card animates to table.
6. Play until round end → RoundSummaryModal fades in, scores reflect chips used.
7. Press Begin Next Round → modal closes, new cards deal, round counter increments.
8. Open Tutorial from StartScreen → 5 steps work, closes cleanly.
9. Open Settings, change to Hard, press Restart → new game with Hard AI.
10. Open at 375px → no overflow, all zones usable, buttons reachable.

All 10 steps must pass before marking this card done.

### Step 11 — TypeScript and console check

Run:
```bash
npm run build
```

Fix any TypeScript errors surfaced by the production build. After a clean build:
- Open `http://localhost:5173` in the browser.
- Open DevTools → Console.
- Confirm: zero red errors, zero `console.error` or `console.warn` related to prop types or missing keys.

## What not to do

- Do not add `localStorage` — game sessions are ephemeral by design.
- Do not add any new features, pages, or components not already built.
- Do not change game rules or AI logic — only fix bugs found during QA.
- Do not add a backend, API, or network call.
- Do not add emoji, gradients, or drop shadows.
- Do not invent new design tokens not in `design.md`.

## Done when

- `npm run build` completes with zero TypeScript errors.
- All 10 proof-ladder steps pass.
- All items in the Visual recipe checklist are ticked.
- All accessibility attributes are in place.
- App is fully usable at 375px wide with no overflow or clipped content.
- `prefers-reduced-motion` collapses all animations to instant.
- Zero red console errors in the browser.
- No emoji, no drop shadows, no gradients visible anywhere.

## Verification steps

1. `npm run build` — exits with code 0, no TypeScript errors.
2. Open http://localhost:5173 — StartScreen loads cleanly.
3. Resize to 375px — check every screen at mobile width, no overflow.
4. Tab through the StartScreen with keyboard only — all elements reachable, focus rings visible (emerald outline).
5. Tab through GameScreen with keyboard — all cards, buttons, chip tokens focusable or have accessible aria-labels.
6. Open DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → start a game → all animations instant.
7. Open Console — zero red errors after a full game loop.
8. Manually verify no emoji appears anywhere in the UI (search `src/` for emoji characters to be sure).
9. Verify chip counts decrease when Scout/Show actions are taken.
10. Verify RoundSummaryModal shows chip-based scores (not 0/0 always).
11. Design check: every item in `design.md ## Design Verification Checklist` is ticked. Compare the browser screenshot against the Visual recipe — every zone matches its description.

## Localhost test before continuing

After this card, the learner should test:

- Open the app at 375px width (mobile DevTools). Navigate StartScreen → GameScreen → play one turn → open Tutorial → open Settings. Nothing overflows or is clipped on any screen.
- Tab through the page with keyboard. Every button and card is reachable with Tab key and shows a visible green focus ring.
- In DevTools Rendering, enable `prefers-reduced-motion: reduce`. Start a new game — all card animations are instant (no spring or slide).
- Open the browser Console — no red errors after a full game loop.
- `npm run build` in the terminal — exits cleanly with no TypeScript errors.

If all tests pass, reply `continue`.
If anything fails, reply `fix` and paste the error or describe what you see.

## After this card: tick chapter 03

End your first checkpoint message for this card (the one that gives its localhost tests) with these two lines, exactly, as plain chat text, never inside a code block (or the link cannot be clicked):

**Your cards are built. Next: tick chapter 03 on your class page.**
[Open chapter 03, Build and test](https://learn.theaibuilder.school/courses/ai-builder-foundations/modules/3) and press **I built my cards**. Then come back to this chat.

When the learner replies `continue`, start your reply with the same two lines.

## Stop condition

If `npm run build` produces TypeScript errors that cannot be resolved in five minutes, put up your hand for a trainer. Do not mark this card done until the build is clean and all proof-ladder steps pass.

## Status
✅ Done
