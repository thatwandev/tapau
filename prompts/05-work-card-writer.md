# Prompt 05: Work Card Writer

Goal: create one markdown file per work card under `work-cards/`.

Read:

- `project-brief.md`
- `architecture.md`
- `design.md`
- `build-blueprint.md`

Write exactly these four files. They are the same four for every learner in the room, whatever the build shape, so a trainer can say "Card 02" and mean the same thing at every table:

```text
work-cards/01-project-skeleton.md
work-cards/02-first-visible-version.md
work-cards/03-core-behaviour.md
work-cards/04-save-or-polish.md
```

Do not write a review card or a GitHub or Vercel card. Changes after the cards happen in the Improve phase, and AI Builder Foundations does not publish.

What each card holds:

| Card | Browser-local tool | Content-led site |
|---|---|---|
| 01 Project skeleton | The Vite + React app in this folder; the app's name as a header and one line under it | The same |
| 02 First visible version | The layout and the `## Visual recipe` from `design.md` (header, hero, rows, colour, surfaces, width, type) with the sample data on screen; nothing interactive yet | Every section in order with its real content, built to the `## Visual recipe` in `design.md` (header, hero, rows, colour, surfaces, width, type); a figure or bar that Card 03 works out shows a placeholder such as `RM -` or an empty bar until then, never a value typed in; nothing interactive |
| 03 Core behaviour | Add an item, update or mark it, delete it, all in memory; a refresh may lose changes until Card 04, and the card's test says so | The primary action if the brief has one, and every figure (a total, a count, a figure on each row) and every bar of the `## Visual recipe` worked out in code from the sample data or the user's inputs, never written into the page by hand; working links and honest form behaviour if the page has them |
| 04 Save or polish | Save with `localStorage`, the refresh proof, the empty state, phone width | Phone width, the bars growing from 0 on load, a final check of every line of the `## Visual recipe`, accessibility basics, a final content check; the card says once that a site saves nothing, so this is its polish card |

Card 01 must tell the coding agent how to create the app without deleting anything in this folder:

- Create the Vite + React app in a temporary subfolder: `npx -y create-vite@9.2.1 app-temp --template react --no-interactive`
- Ignore the scaffolder's "cd app-temp" hint. Move everything inside `app-temp`, hidden files included, up into this project folder, next to `START_HERE.md`. Then delete the empty `app-temp` folder.
- Set the `<title>` in `index.html` to the project name from `project-brief.md`, and the `"name"` in `package.json` to the same name in small letters with dashes for spaces, not `app-temp`.
- Run `npm install`, then `npm run dev`.
- Never run a scaffolder with `--overwrite`, and never choose "Remove existing files": that empties this folder and deletes the planning files, `prompts/`, `templates/` and `work-cards/`.

Each work card must use this structure:

```md
# Work Card NN: Title

## Goal

## Inputs

## Files likely touched

## Instructions for the coding agent

## What not to do

## Done when

## Verification steps

## Localhost test before continuing

## Stop condition

## Status
Not started
```

Each Work Card must include a `Design check` line under Verification steps, referencing `design.md`.

Content-led site example:

```text
Design check: first section follows design.md mood, spacing, CTA style (if the page has one), and mobile rules.
```

Browser-local tool example:

```text
Design check: item list, input, update/delete controls, empty state, and mobile stacking follow design.md.
```

Every generated Work Card must also include a `## Localhost test before continuing` section, written for that specific card:

```md
## Localhost test before continuing

After this card, the learner should test:

- [Specific test for this card]
- [Specific test for this card]
- [Specific test for this card]

If all tests pass, reply `continue`.
If anything fails, reply `fix` and paste the error or describe what you see.
```

Work Card 04, the last card, also ends with the section inside this box (not the ``` lines), word for word:

```md
## After this card: tick chapter 03

End your first checkpoint message for this card (the one that gives its localhost tests) with these two lines, exactly, as plain chat text, never inside a code block (or the link cannot be clicked):

**Your cards are built. Next: tick chapter 03 on your class page.**
[Open chapter 03, Build and test](https://learn.theaibuilder.school/courses/ai-builder-foundations/modules/3) and press **I built my cards**. Then come back to this chat.

When the learner replies `continue`, start your reply with the same two lines.
```

Rules for the generated tests:

- If the card scaffolds the app, test that `npm run dev` starts and the app shell/header loads.
- If the card creates visible UI, test that the expected UI is visible.
- If the card adds add/create behavior, test adding a real sample item.
- If the card adds edit/delete behavior, test both edit and delete.
- If the card adds localStorage, test add item -> refresh browser -> item still appears.
- If the card adds styling/responsiveness, test at mobile width and confirm text, buttons, and cards are not cut off.
- If no browser preview exists yet, explicitly say: `No meaningful browser preview yet. Continue after the command/file checks pass.`
- For a content-led site, include checks for factual content, the primary action if there is one, working links, and mobile layout.
- For a sample-data dashboard, Card 03's test names each figure's expected value from the sample data and the rule behind it, from `architecture.md` (for example: a finished item is not counted in the total).
- For a browser-local tool, the complete card set must prove add, update, delete, save, and refresh persistence.

Do not write generic implementation-only cards. Every card includes learner QA.

After writing the cards, update `build-status.md`:

- Current phase: Ready to Build
- Current KDBM Lite stage: Build
- Current work card: `work-cards/01-project-skeleton.md`
- Completed planning phases: all five ticked
- Next instruction for AI:
  `Read build-status.md, build-blueprint.md, design.md, and work-cards/01-project-skeleton.md. Implement only Work Card 01. Stop after verification and update build-status.md.`

Start the message that says the cards are saved with the two lines inside this box (not the ``` lines), exactly as written and as normal chat text, never inside a code block (or the link cannot be clicked). If `git --version` still fails, add one line after them: a trainer helps with Git after class.

```markdown
**Planning is done. Next: tick chapter 02 on your class page.**
[Open chapter 02, Understand and plan](https://learn.theaibuilder.school/courses/ai-builder-foundations/modules/2) and press **My four work cards are written**. Then come back to this chat.
```

End that same message with this one line: `When your trainer starts chapter 03, Build and test, type Start Work Card 01.`

Stop. Do not implement.
