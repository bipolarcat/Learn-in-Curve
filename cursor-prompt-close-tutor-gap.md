# SUPERSEDED — do not action

This prompt was written by Claude on 2026-07-10 for LIC-37/36/52/48, but by
the time it was saved, Cursor had already shipped exactly this work in commit
`375ef9c` ("feat: LIC-37/36/52/48 close AI tutor promise gap") — including an
identically-named prompt file of its own, now at
`cursor-prompts/archive/cursor-prompt-close-tutor-gap.md`.

Verified directly against the git object (`git show 375ef9c`) that the real
work is done: `AiTutorUpgradeCta.tsx`, the free-tier lock routing through
`LockedFeature`, the course-completion summary firing from
`markSectionComplete`, and the restored APM disclaimer in `SiteFooter.tsx`
are all genuinely committed.

See `BUSINESS_STATE.md`'s 2026-07-10 entry and Linear LIC-37/36/52/48
(all moved to **In Review**) for the current, corrected status. Nothing in
this file should be executed — it would just redo already-shipped work.
