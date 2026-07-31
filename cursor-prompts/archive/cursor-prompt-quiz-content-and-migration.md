# Cursor prompt — LIC-28 quiz content audit + finish the 24-LO migration

Two connected jobs. Do them in this order — the second depends on the first
being correct, and both are launch-blocking (most LO-page tickets, LIC-39/40,
LIC-21, and the dashboard completion % can't be truly verified until real
data exists for all 24 LOs, not just LO1).

Can run in parallel with `cursor-prompt-wave2.md` in a separate Cursor
session/tab if you have the capacity — they touch different files (content
JSON + a migration script vs. React components).

## Part 1 — LIC-28: rebuild lo2.json–lo24.json

**Confirmed scope (2026-07-08):** each LO needs ~10 questions, MCQ + dropdown
(select-from-list) only. Strip every `long_form`/`short_recall` item — retired
2026-07-02 per `content/_schema.json`'s own note, quiz is auto-marked only
now. `lo1.json` (in `PMQ in 5 days/content/`) is the already-correct template
— match its structure and question count.

**Sourcing rule, non-negotiable (2026-07-02 decision log):** new/replacement
questions must come strictly from that LO's own existing structured content —
`key_definitions`, `core_content`, `misconceptions`, `exam_technique` — not
general PM knowledge, not internet search. This keeps everything traceable to
material already reviewed, and avoids non-APM terminology drift. If an LO
doesn't have enough source material to reach ~10 clean MCQ/dropdown questions
after removing the legacy items, flag it rather than inventing content to hit
the number.

**Per file:**
1. Remove every question with `"type": "long_form"` or `"type": "short_recall"`.
2. Check remaining count — top up to ~10 with new MCQ/`scenario_mcq`/dropdown
   questions sourced per the rule above, if short.
3. Leave `"acronym"`-type items alone (not a quiz question type, a different
   content field — don't touch it thinking it's in scope).
4. Spot-check `content/_schema.json` still validates against the result.

Do all 23 files (lo2–lo24) in this pass, not a subset.

## Part 2 — finish the native migration (all 24 LOs into Supabase)

Currently only LO1 is in the `sections`/`lessons`/`questions` tables (verified
2026-07-08 — 1 row / 11 questions). All 24 LOs were greenlit for native
migration 2026-07-04 (`PMQ_NATIVE_MIGRATION.md` §7) but never finished — the
2026-07-04 log entry itself flags this as unverified. Full field mapping
(lo\*.json → sections/lessons/questions, including the quiz-type mapping) is
already documented in `PMQ_NATIVE_MIGRATION.md` — follow it exactly, don't
re-derive the mapping from scratch.

1. Run the migration for lo2–lo24 using the same approach LO1 was seeded
   with (check for an existing migration script from that pass before writing
   a new one from scratch).
2. Use the **rebuilt** JSON from Part 1 as the source, not the pre-audit
   files — do Part 1 first.
3. After migration, verify counts: `sections` should have 24 rows (one per
   LO, `day`/`theme` populated), `questions` should have roughly 24×10 rows,
   `lessons` should have 24 rows.
4. Spot-check 2-3 LOs beyond LO1 render correctly on their native page
   (`/courses/pmq-in-5-days/lo/{n}`) before calling this done.

## When done

Log to BUSINESS_STATE.md per the documentation-discipline rule — this closes
a real open item from that file ("Open questions" section: 24-LO migration
verification). Update `docs/roadmap.md` if it references migration status.
No Linear tickets to move for Part 2 (it's not a numbered LIC ticket) — Part 1
is LIC-28, move to In Review when the content rebuild is done (migration can
finish after).
