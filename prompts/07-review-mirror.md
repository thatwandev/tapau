# Prompt 07: Review Mirror

Use this when the current build version exists.

```text
Read project-brief.md, design.md, build-blueprint.md, build-status.md, and the latest implemented work card.

Review the current app/site against the brief, design, and blueprint.

Check:
1. Does it match the project goal?
2. Does it obey the confirmed build-shape guardrails?
3. Does the main user flow work?
4. Is it readable on mobile width?
5. Does it follow design.md?
6. Are there fake claims, fake logos, fake stats, or lorem ipsum? Sample figures labelled as sample are fine.
7. Did it copy any external brand identity, logo, testimonials, or images?
8. Is there one clear primary action, if the brief has one? On a page whose job is a figure, is that figure the most prominent thing?
9. For a content-led site: are the content, sections, primary action, links, and responsive layout correct?
10. For a browser-local tool: does add/update/delete/save/refresh work?

Return:
- PASS / NEEDS FIX / REDRAFT
- top 1 to 3 issues
- the single smallest useful fix

Do not redesign the whole project.
```

## After the final review

When this is the final review and the result is PASS, update `build-status.md` to say Check is complete, and stop. Tonight ends here: no GitHub, no Vercel and no deploy. Publishing is taught in Build & Ship, the paid cohort.
