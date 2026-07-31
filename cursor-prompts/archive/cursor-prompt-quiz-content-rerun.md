# Cursor prompt — LIC-28 quiz content rebuild, clean re-run

Your first attempt at this (documented as "done" in an earlier status report)
did not actually complete. All 23 files (`lo2.json`–`lo24.json`) were left as
truncated, invalid JSON — cut off mid-sentence, no closing braces — and never
committed. `git log` shows nothing landed; `git status` showed them as
uncommitted working-tree changes with mtimes from 2026-07-02/03, meaning the
process was interrupted (crash, timeout, or context limit) partway through
and never resumed or retried before being reported as complete.

Claude has already reverted all 23 files to the last good commit (`1e76b0e`)
— they're back to the pre-rebuild state (still has `long_form`/`short_recall`
items) and are valid JSON again. Start clean from there. `_schema.json` and
`lo1.json` were also touched in that same pass and are valid — leave them as
they are, don't re-touch unless this pass needs to.

## The task (unchanged scope)

**Confirmed scope (2026-07-08):** each LO needs ~10 questions, MCQ + dropdown
(select-from-list) only. Strip every `long_form`/`short_recall` item — retired
2026-07-02 per `content/_schema.json`'s own note, quiz is auto-marked only
now. `lo1.json` is the already-correct template — match its structure and
question count.

**Sourcing rule, non-negotiable:** new/replacement questions must come
strictly from that LO's own existing structured content — `key_definitions`,
`core_content`, `misconceptions`, `exam_technique` — not general PM knowledge,
not internet search. If an LO doesn't have enough source material to reach
~10 clean questions after removing the legacy items, flag it rather than
inventing content to hit the number.

**Per file:**
1. Remove every question with `"type": "long_form"` or `"type": "short_recall"`.
2. Top up to ~10 with new MCQ/`scenario_mcq`/dropdown questions sourced per
   the rule above, if short.
3. Leave `"acronym"`-type items alone — different field, not a quiz question.
4. Validate the file is well-formed JSON immediately after writing it —
   `node -e "JSON.parse(require('fs').readFileSync('content/loN.json','utf8'))"`
   or equivalent — before moving to the next file. Do not proceed to the next
   LO if the current one doesn't parse.

## What's different this time — process, not scope

1. **Commit incrementally.** Commit after every 4-5 files, not once at the
   end. If something interrupts the run, the loss is a few files, not all 23.
2. **Validate before you report done.** Run a full JSON.parse pass across all
   23 files as the literal last step, and paste the pass/fail output into
   your status report. "I rebuilt the files" is not evidence they're valid —
   show the validation output.
3. **Check `content/_schema.json` still validates** against the result once
   all 23 are done.

Do all 23 files (lo2–lo24) in this pass, not a subset.

## When done

Log to `BUSINESS_STATE.md` per the documentation-discipline rule, including
the validation-pass output. Move LIC-28 to **In Review** in Linear (not Done).
Do not attempt the Supabase migration (Part 2 of the old combined prompt) —
Claude is running that directly via the Supabase MCP once this content is
confirmed valid, no service-role key needed.
