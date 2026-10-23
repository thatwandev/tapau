# Prompt 04: Build Blueprint Writer

Goal: combine the confirmed planning files into one comprehensive `build-blueprint.md`.

Read these files first:

- `project-brief.md`
- `architecture.md`
- `design.md`

Before writing `build-blueprint.md`, verify `design.md` exists and is specific. If `design.md` is missing or vague, stop and run the Design Coach again.

Create `build-blueprint.md` with this structure:

```md
# Build Blueprint

## Source Files

## Project Identity

## Build Shape

## Version-One Promise

## Scope Lock

### Now

### Later

### Never

## Architecture Summary

## Data / State / Storage Rules

## Design Direction Summary

## Implementation Rules

## File and Folder Expectations

## Work Card Plan

## Review Mirror

## Proof Ladder

## 60-Second Explanation Template

## Guardrails for the Coding Agent
```

In the Design Direction Summary, summarize what the build should borrow from the design inspiration and what must not be copied.

The Work Card Plan lists exactly four cards, in this order, each with one line on what it holds for this project:

1. 01 Project skeleton
2. 02 First visible version
3. 03 Core behaviour
4. 04 Save or polish

`prompts/05-work-card-writer.md` says what each card holds for each build shape. Do not plan a review card or a GitHub or Vercel card: changes after the cards happen in the Improve phase, and AI Builder Foundations does not publish.

Tonight, fill these two sections this way:

- **Review Mirror:** optional tonight, `prompts/07-review-mirror.md`, not a work card.
- **Proof Ladder:** the app running on localhost, improved your way. No GitHub or Vercel.

Guardrails for the Coding Agent must include:

- read `build-status.md`, `build-blueprint.md`, and the current work card before editing;
- implement only the current work card;
- do not jump ahead;
- stop after verification;
- update `build-status.md` after each work card;
- do not add backend/auth/database/API unless the blueprint explicitly allows it;
- do not add secrets or keys to code;
- do not invent claims, testimonials, logos, or real numbers.
- apply the guardrails for the confirmed build shape;
- no action the brief does not have (such as pay, apply or add); a page whose job is a figure makes that figure the most prominent thing;
- for a money brief: work out and show figures only (sums, counts, what is left); never advise, rate or recommend, and never work out interest;
- if a legacy file uses `Build Mode`, treat it as `Build Shape` without stopping;

Then update `build-status.md`:

- Current phase: Work Cards
- Completed: Build Blueprint
- Next instruction: Generate work cards

Stop and ask permission before creating work cards. Tonight, the learner's yes after Design already covers the work cards: go straight on to them.
