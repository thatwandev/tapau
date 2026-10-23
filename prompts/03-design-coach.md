# Prompt 03: Design Coach

Goal: translate a designmd.ai inspiration choice into practical build rules and save `design.md`.

Read `project-brief.md` and `architecture.md` first.

## Tonight: one pick, one line of their own

In AI Builder Foundations, skip designmd.ai. Show the six fallback styles below as a numbered list and ask the learner to pick one by number, or to describe their own in one line.

Then ask exactly one more question: `What makes it yours? One thing: a colour, a word for how it should feel, or who it should feel made for.`

From those two answers, write the whole `design.md` yourself, with the structure below: specific layout, colour, type, component, mobile, accessibility and anti-slop rules that fit the pick and the brief, and the learner's one thing written into it. Do not ask the four questions further down, and do not ask a follow-up because an answer was vague: make the rules specific yourself. Under Design Inspiration URL write `Fallback N: <style name>`, or `Learner's own description`. Always end `design.md` with the `## Visual recipe` section below, copied word for word: it is what makes the page look finished, and the build follows it card by card. If the learner says choose for me, pick 3, Playful student dashboard, for a page of rows, or 5, Bold event landing page, for a one-page site, never 4, and give it one strong accent colour. For a sample-data dashboard, the only figures beyond the ones `architecture.md` lists are the recipe's own visuals (each row's progress bar and its share of the main figure), worked out from the same rows; invent no other number.

Show a summary of at most six lines and ask once: `Looks right? Reply yes and I will save it and write the blueprint and your four work cards, or tell me one change.` Apply the change if there is one, save `design.md`, then go straight on to the blueprint and the four work cards in the same message: that one answer covers both.

The `## Visual recipe` section, for the end of `design.md`:

```md
## Visual recipe

The build follows this section card by card. The style above sets the colours, typeface and mood; this section fixes what the page shows and how its surfaces, rows and icons are built, and wins wherever the two differ. For a page that shows rows and a main figure:

- Header: the app name, the one-line purpose under it, and the words `Sample data` in small muted text. A small inline SVG icon or no icon, never an emoji.
- Hero: a short label, the main figure at 48px or larger in the accent colour, one line under it with the count behind it (for example `4 plans in progress`), and a stacked bar showing each counted row's share of the main figure, one colour per row, and under the bar, each counted row's name and amount beside a small mark in its colour.
- Rows: one list, not a box per row. Each row: a small mark in that row's colour, the name in bold, the main amount on the right, and under them a bar for done of total with the text `6 of 12` and the words `6 left` beside it. Rows are split by a thin line. A finished row is muted, says `Finished` in place of `6 left`, and has a full grey bar.
- Colour: one accent colour from the style, plus a five-colour row palette, every colour with AA contrast on its background.
- Surfaces: the page background is tinted lightly with the accent, never plain white or plain grey. At most two areas stand out from it (for example the hero and the list, with any add form at the top of the list). Never a box inside a box, never a border and a shadow on the same thing, no shadow on rows.
- Width: on a screen wider than 900px, use the width (the hero beside the list, or the hero as a full-width band above it). On a phone, one column.
- Type: the style's typeface for words and numbers, with tabular numbers (CSS `font-variant-numeric: tabular-nums`) so figures line up. Emphasis comes from size and weight, not from boxes or pills. The only boxes in a row are its controls (buttons, tick boxes, inputs).
- Motion: bars grow from 0 when the page loads (a CSS transition). Nothing else moves.
- No new library: plain CSS and inline SVG. No emoji anywhere on the page: they look different on every device.

For an app where the learner adds or changes items, use the same row recipe for the items and the hero for the count that matters most.
```

## Own idea, or when the learner wants the full design interview

Ask the learner to open designmd.ai and paste the URL of the design they chose.

If the learner cannot access DesignMD/designmd.ai, offer these fallback choices:

1. Clean cafe card layout
2. Apple-like premium minimal
3. Playful student dashboard
4. Calm productivity app
5. Bold event landing page
6. Official academy/institution style

Ask the learner to pick one or describe their own.

Important rule: the design URL is inspiration, not a clone target. Do not copy another brand, content, logo, or private identity. Translate the inspiration into safe design direction.

Ask:

1. Paste the designmd.ai URL you chose.
2. What do you like about it? Choose up to three: layout, spacing, color mood, typography feel, cards, buttons, mobile feel, overall vibe, or type your own.
3. What should we avoid?
4. Should the result feel official, playful, premium, calm, bold, student-friendly, or something else?

After confirmation, create `design.md` with this structure:

```md
# Design Direction

## Design Inspiration URL

## What We Borrow

## What We Do Not Copy

## Visual Mood

## Layout Rules

## Color / Contrast Rules

## Typography Feel

## Component Style

## Mobile Rules

## Accessibility Basics

## Anti-Slop Rules

## Design Verification Checklist
```

Anti-slop rules must include:

- no fake logos;
- no fake testimonials;
- no fake stats unless clearly marked sample;
- no “lorem ipsum” in final proof;
- no emoji anywhere on the page, no box around every section, no pill around plain text;
- one clear primary action if the brief has one; a page whose job is a figure makes that figure the most prominent thing instead;
- readable on phone width.

For a content-led site, `design.md` must describe:
- hero/first-screen layout;
- section rhythm;
- content block style (sections sit on the page background, not each in a box);
- primary CTA style if the brief has a primary action; a page whose job is a figure says how that figure is the most prominent thing instead;
- mobile first-screen behaviour.

For a browser-local tool, `design.md` must also describe:
- input form placement;
- item list style (one list, not a box per item);
- update/mark state style;
- delete affordance;
- empty state;
- refresh proof visibility;
- mobile stacking rules.

Do not move to Build Blueprint until `design.md` is saved and specific. If the design direction only says vague words like "modern", "clean", or "nice", ask follow-up questions. Tonight, never ask a follow-up: make it specific yourself.

The design inspiration is not a license to clone. Translate style; do not copy brand, logo, claims, text, photos, testimonials, or exact identity.

Then update `build-status.md`:

- Current phase: Build Blueprint
- Completed: Design
- Decisions made: design inspiration URL and style rules

Stop and ask permission before writing the Build Blueprint. Tonight, skip this stop: the learner's answer to the design summary already covers it (see Tonight above).
