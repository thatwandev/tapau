# Prompt 02: Architecture Coach

Goal: turn the confirmed brief into a practical structure and save `architecture.md`.

Read `project-brief.md` first. Use its confirmed Build Shape. If the shape is not confirmed, return to Prompt 01 before continuing.

## Tonight: propose, then confirm once

In AI Builder Foundations, do not interview. Work out the architecture for the confirmed build shape yourself, with the default stack below, and show a summary of at most six short lines (for a sample-data dashboard, the figures line may list every rule and value in one longer sentence):

- the stack;
- for a browser-local tool: the one data type and its 3 to 5 fields; for a content-led site: the sections in order, and for a sample-data dashboard the rule behind each number shown and its value from the sample data;
- where it is saved (the `localStorage` key for a tool, nothing for a site);
- the app lives in this project folder, beside `START_HERE.md`;
- what is not built tonight.

Ask once: `Looks right? Reply yes, or tell me one change.` Apply the change if there is one, then save `architecture.md`. The confirm list below is what the file must cover, not a list of questions.

After saving, go straight on to Design in the same message: do not stop to ask permission.

## Own idea, or when the learner wants to discuss it

Ask only what is needed for that shape.

## Content-led site architecture

Confirm:

- section order and factual content needed;
- one primary action, if the brief has one;
- repeated cards or content blocks;
- navigation, links, and any non-submitting form behavior;
- responsive behavior and mobile first screen;
- whether a sample-data dashboard is clearly labelled as sample;
- for a sample-data dashboard: the rule behind each number shown, and its value from the sample data.

## Browser-local tool architecture

Confirm:

- the one data type or list;
- no more than 3 to 5 fields per item;
- add behavior;
- update, mark, or edit behavior;
- delete behavior;
- `localStorage` key name;
- empty state;
- refresh-persistence test.

## Scope rescue

If the requested structure needs auth/login, payments, database, backend, live API, secret key, multiple data tables, uploads, admin access, or multi-user sync, propose a browser-only substitute. Do not expand unless the trainer explicitly approves it.

After confirmation, create `architecture.md`:

```md
# Architecture

## Build Shape

## Stack Decision

## Structure Overview

## Component Map

## Data / State Model

## Storage Logic

## User Flow

## File Expectations

## Constraints

## Technical Non-Goals

## Verification Notes
```

Default stack unless the trainer says otherwise:

- Vite;
- React;
- plain CSS, or Tailwind only when the session is using it;
- `localStorage` only when browser-local persistence is part of the confirmed shape;
- no backend, auth, database, payment, or live API without explicit trainer approval.

Then update `build-status.md`:

- Current phase: Design
- Completed: Architecture
- Decisions made: stack, structure, data/storage decision

Stop and ask permission before moving to Design. Tonight, skip this stop: go straight on to Design (see Tonight above).
