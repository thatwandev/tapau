# Prompt 06: Build Runner

Use this after planning is complete.

Paste this into the implementation model:

```text
Read build-status.md, build-blueprint.md, design.md, and the current work card listed in build-status.md.

Implement only the current work card.

Rules:
- Follow design.md. If design.md is missing or vague, stop and ask me to complete the Design phase first.
- Do not copy external brand identity, logos, testimonials, stats, or images.
- Do not start the next work card.
- Do not change the project scope.
- Do not add backend, auth, database, API, payment, or secrets unless the blueprint explicitly allows it.
- Apply the guardrails for the confirmed build shape.
- Run the verification steps from the work card.
- After finishing, update build-status.md with what changed, what passed, what failed, and the next work card.
- Stop and wait for my approval.
```

Recommended model strategy:

- planning: strongest available model;
- implementation: cheaper/faster model is okay because the files are now the source of truth.

## Required output after every Work Card

After completing a Work Card, do not just stop. Output this learner checkpoint:

### Work Card NN complete

**What changed**
- Briefly list what was created or updated.

**Local preview**
- If the dev server is not running, tell the learner to run:
  `npm run dev`
- Tell them to open the localhost URL shown in the terminal, usually http://localhost:5173. Write it as a plain link, never in backticks, or it cannot be clicked.
- If the dev server is already running, tell them to refresh the browser.
- If this Work Card has no meaningful browser preview yet, say so clearly and explain what command/file check proves it passed.

**Test before moving on**
- Give 2 to 5 specific tests for this Work Card.
- The tests must match the feature or setup completed in this card.
- Do not say only "check that it works."

**Choose next action**
- If all tests pass, say: `continue`
- If anything fails, say: `fix` and paste the error or describe what you see.

Do not start the next Work Card until the learner chooses `continue`.

On the last Work Card (04), end its first checkpoint message with the chapter 03 block from the section below, so the learner sees it while they test. Do not repeat it after a `fix` round.

## Required output after the final Work Card

When the learner replies `continue` to the last Work Card's tests, or stops building cards (the room moved on, or they ask what is next), start your message with the two lines inside this box (not the ``` lines), exactly as written and as normal chat text, never inside a code block (or the link cannot be clicked), so the learner ticks the class page:

```markdown
**Your cards are built. Next: tick chapter 03 on your class page.**
[Open chapter 03, Build and test](https://learn.theaibuilder.school/courses/ai-builder-foundations/modules/3) and press **I built my cards**. Then come back to this chat.
```

If the learner stopped before the last Work Card, the block is all: say in one line that the next chapter, Vibing Starts Now, carries on from the card they are on, and stop there. After the last Work Card, output:

### All Work Cards are complete

**Final localhost review**
- Run or refresh localhost.
- Test the full main flow from start to finish.
- Check mobile width.
- Check there is no red error screen.
- Check there are no pasted secrets/API keys.
- Check there are no fake claims, fake stats, fake logos, or fake testimonials. Sample figures labelled as sample are fine.
- Check the main action works, if the brief has one. On a page whose job is a figure, check that figure is the most prominent thing and matches its expected value in `architecture.md`.
- For browser-local tools: add an item, update it, delete an item, then add one and refresh the browser to confirm it stays.

**Next: Improve**
Tell the learner the next chapter on the school page is Vibing Starts Now: they keep improving the app with you, one change at a time.

Update `build-status.md` to the Improve stage and stop. No GitHub, no Vercel and no deploy tonight: publishing is taught in Build & Ship, the paid cohort. If the learner asks for a review, use `prompts/07-review-mirror.md`.
