# Work Card 00: Setup Gate

## Goal

Confirm the learner has a capable coding workspace and the local tools before planning. Tonight this takes under two minutes: the learner ran the school's setup line in chapter 01, or installed Node by hand, and AI Builder Foundations needs no GitHub, Vercel or git identity.

## Coding workspace checklist

Use VS Code, Antigravity, Cursor, or an equivalent workspace.

- [ ] The workspace opens this entire project folder.
- [ ] Its AI agent can read `START_HERE.md`.
- [ ] Its AI agent can create or update a markdown file in this folder.
- [ ] A terminal opens inside this project folder.
- [ ] A browser is available for localhost tests.

## Local tools checklist

- [ ] Node.js v20.19+ on 20, or v22.12+ (LTS recommended).
- [ ] npm working.
- [ ] Git installed (can wait tonight).

## Accounts checklist

The learner's KrackedDevs account was done on the school page. Do not ask about any account tonight: not KrackedDevs, not GitHub, not Vercel.

## Command checks

Run these yourself in the project terminal and read what they print. Do not ask the learner to type them.

```bash
node -v
npm -v
git --version
```

Each command must print a version number, and Node must be v20.19 or newer on 20, or v22.12 or newer (tonight's app needs it). An older Node: point the learner to the by-hand Node install on their tab of chapter 01 (Set up), step 2, then close and reopen VS Code (on Windows, then run the Set-ExecutionPolicy line below). If you cannot run terminal commands, ask the learner once to paste what the three commands print.

When Node and npm pass (Git can wait, see below), start your message with the two lines inside this box (not the ``` lines), exactly as written and as normal chat text (never inside a code block, or the link cannot be clicked), then go straight on to the Project Brief in the same message:

```markdown
**Your tools are ready. Next: tick chapter 01 on your class page.**
[Open chapter 01, Set up](https://learn.theaibuilder.school/courses/ai-builder-foundations/modules/1) and press the big button on any step not ticked yet. Then come back to this chat.
```

Git can lag behind tonight and that is fine: nothing tonight uses it. On a Mac it comes with Apple's command line tools, the slow download: if `git --version` prints an `xcrun` error or a developer tools window opens, they are still downloading, so do not ask for the setup line again; tell the learner in one line that Git is still downloading: if a developer tools window is open, click Install (never Get Xcode) and leave it; nothing tonight needs Git. On Windows, a setup line that stopped at github.com means GitHub is limiting the room's wifi. Either way, go on to the Project Brief with Node and npm passed. When the Work Cards are saved, check `git --version` again. If Git still does not work, add one line: a trainer helps with Git after class.

## Git identity

Not needed tonight: nothing is committed. Skip it.

## Install rescue

If npm or npx says running scripts is disabled (Windows PowerShell), ask the learner to run this once in the terminal and answer Y if asked, then try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

If Node or npm is missing and you do not know where the setup line stopped, ask the learner once whether it said Node.js installed. If it stopped before that, point the learner to the by-hand Node install on their tab of chapter 01 (Set up), step 2, then close and reopen VS Code (on Windows, then run the Set-ExecutionPolicy line above). Otherwise ask them to run the school's setup line again, then close and reopen VS Code. Git missing is not a reason to stop: see above. On Windows, if the setup line stopped at github.com, GitHub is limiting the room's wifi; go on, and Git is set up after class or at home.

- Windows, in PowerShell: `irm https://learn.theaibuilder.school/setup/windows.ps1 | iex`
- Mac, in Terminal: `curl -fsSL https://learn.theaibuilder.school/setup/mac.sh | bash`

## What not to do

- Do not start app code.
- Do not scaffold a project or install packages.
- Do not initialize Git.
- Do not deploy.
- Do not ask about any account, or about git identity.
- Do not skip missing file access, terminal access, Node or npm. Git is the one thing you go on without tonight.

## Done when

- The workspace can read/write markdown files and run terminal commands in this folder.
- `node -v` and `npm -v` work, and `git --version` works or Git is still on its way (see above).
- Results are recorded in `build-status.md`.

## Stop condition

If the workspace, Node or npm cannot be fixed in five minutes, tell the learner to put a hand up for a trainer and to sit with a neighbour for the evening.

## Status

Not started
