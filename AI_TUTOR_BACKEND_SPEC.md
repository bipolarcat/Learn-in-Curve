# AI Tutor Backend Spec (LIC-42)

**2026-07-18 implementation note:** Full-mock Gemini grading now counts against
the same £5 fair-usage credit included in the £9.99 Premium bundle. The server
sums tutor usage and persisted `ai_cost_gbp_cents` before each written-answer
grading call; it is not a separate allowance.

Prerequisite for LIC-36 (message cap then lock), LIC-37 (upgrade CTA inside the
chat window), and LIC-40 (Real Mock Exam AI grading — reuses the same API-call
pattern this doc establishes). Written 2026-07-08, revised same day after Sim's
follow-up call on memory/tone/model choice. Sim to review before Cursor builds.

## 0. What already exists — don't rebuild this

`AiTutorPanel.tsx` is a complete UI shell: slide-out panel, locked/unlocked/
coming-soon states, Stripe checkout button (`createAiTutorCheckout` in
`src/lib/pmq/actions.ts`), gated behind `AI_TUTOR_LAUNCHED = false`
(`src/lib/pmq/constants.ts`). `feature_entitlements` table already exists and is
the entitlement check `isUnlocked` already reads. **None of this needs to
change.** What's missing is everything behind the "unlocked" state: no chat UI,
no API route, no live model call anywhere (`src/app/api` only has
`stripe/webhook`).

## 1. Persistent chat history — REVERSES the earlier "no raw storage" plan

**Change of direction, 2026-07-08:** the first draft of this spec followed the
PRD/2026-07-02 decision log's "no raw conversation storage" GDPR constraint and
kept chat state client-side only, lost on refresh. Sim has now explicitly
overridden that: the tutor needs to remember the user across the whole PMQ
course, not reset every session, or it "beats the purpose of having an AI
tutor." Direction confirmed: ignore the PRD on this point, this spec and the
decision log are now the source of truth.

**What this actually requires — not just a schema change:**

New table, real conversation content stored, RLS to the owning user only:

```sql
public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  learning_objective text,
  rating smallint check (rating in (-1, 1)),  -- thumbs down/up, nullable, see §5
  created_at timestamptz not null default now()
)
```

RLS: select/insert only own rows. This becomes the source for (a) rendering
chat history on panel open, (b) the free-tier message cap (`count(*)` replaces
the earlier count-only log design), (c) the improvement-loop review in §5.

**This is a real legal change, not just an engineering one — flagging per the
informal-advisor role, not a rubber stamp:**

- `legal/PRE_LAUNCH_CHECKLIST.md` §4 already has a line anticipating exactly
  this: *"confirm... the 'no raw conversation storage' commitment in
  `PRIVACY_POLICY.md` section 2 is still technically true of whatever gets
  built."* It's now false by design — `PRIVACY_POLICY.md` section 2 needs to be
  rewritten to disclose chat content as a stored data type, with a defined
  retention period, before this ships to real users. I haven't edited that
  document — it's a live legal page real sign-ups are relying on today, and I'd
  rather you explicitly say "yes, update it" (or tell me what retention window
  you want) than have it change under a broader "GDPR can be updated" reading.
  Logged as a new Linear item (see below).
- Data minimization still applies even though storage is now allowed — store
  the message content needed to give the tutor memory, not extra metadata you
  don't need. `learning_objective` above is there because it's genuinely useful
  for weak-area grounding; don't add fields "just in case."
- This is informal guidance, not a solicitor's sign-off — the checklist's
  existing "solicitor review not done" item still applies, more so now that
  there's real conversation content in scope.

## 2. Tone — smart redirect, not a blunt decline

**Change of direction, 2026-07-08:** the first draft had the model hard-decline
off-syllabus questions. Sim's ask: the tutor should be "smart enough to answer
tricky questions in such a way that the user gets a response... does not ask
again," while still reminding them this is exam prep, not a general chat
assistant. Rewrite the system prompt's scope-guard instruction from "refuse"
to a redirect pattern:

1. Briefly, genuinely acknowledge the question (don't ignore it or sound
   robotic about refusing).
2. Answer what's reasonably answerable in one or two sentences if it's
   adjacent to PM/exam knowledge, even if not strictly syllabus-scoped.
3. Pivot back to the syllabus with a specific, concrete next step ("here's how
   that connects to what's actually examined..." rather than a vague "let's
   focus on the syllabus").
4. Only for genuinely unrelated content (not PM-adjacent at all) does it give a
   light, friendly reminder of purpose — e.g. "I'm scoped to help you pass the
   PMQ, so let's put that time toward the syllabus" — once, not repeated
   verbatim every time, and never scolding in tone.

The goal stated by Sim: the user shouldn't feel stonewalled and shouldn't need
to ask twice. Write 3-4 example exchanges into the actual system prompt
(few-shot) rather than relying on an abstract instruction — model behavior on
this kind of tone nuance is much more reliable with examples than description
alone.

## 3. Model provider — build behind a thin interface, don't hard-couple to one vendor

Sim asked whether to use Gemini instead of Anthropic. Short answer: **build a
one-function abstraction (`callTutorModel(systemPrompt, messages): Promise<string>`)
so the provider is a swappable implementation, not baked into the route/UI
code.** Whichever you start with, this costs nothing extra to build correctly
and means switching later (or A/B testing) isn't a rewrite.

**On the actual choice, current pricing (verified via web search, July 2026):**

| | Input $/M tokens | Output $/M tokens |
|---|---|---|
| Claude Haiku 4.5 | $1.00 | $5.00 |
| Claude Sonnet 4.6 | $3.00 | $15.00 |
| Gemini 3 Flash Preview | $0.50 | $3.00 |
| Gemini 3.1 Flash-Lite | $0.10 | $0.40 |
| Gemini 3 Pro | $2.00 | $12.00 |

Gemini's Flash/Flash-Lite tier is meaningfully cheaper than anything comparable
from Anthropic — both vendors also offer prompt caching (~90% discount on
repeated system-prompt tokens), which matters a lot here since the syllabus
grounding + weak-area summary in the system prompt is large and mostly
repeated every call.

**Decided 2026-07-08: start with Gemini**, on cost grounds given the margin
risk in §4 — Sim's call. Start on **Gemini 3 Flash** (not Pro) as the default
model; only move up-tier if response quality is the actual complaint in
practice, not preemptively. `callTutorModel` still gets built as a real
abstraction (not just in name) so Claude stays a one-line swap if Gemini's
tone/quality doesn't hold up for the §2 redirect behavior. Needs
`GEMINI_API_KEY` added to `.env.local` / Railway env — **not currently set,
confirm with Sim before Cursor builds this.**

## 4. Fair usage cap — DECIDED 2026-07-08

Real cost check first: modeled against Gemini 3 Flash pricing, 100 messages of
realistic length (syllabus grounding + growing history) costs roughly
$0.17–$0.35 total — a few hundredths of a cent per message. So the margin risk
flagged in the first draft of this spec is smaller in practice than it sounded
in the abstract, but Sim's decided to cap it formally anyway rather than rely
on "probably fine":

**Paid users get AI tutor access up to 50% of the £5 fee in estimated model
cost (~£2.50 / ~$3.15) per course.** Past that, the tutor locks with an
upgrade prompt — same locked treatment as §10's shared component — offering a
**pay-as-you-go top-up for unlimited messaging**. This is a distinct, later
feature (new Stripe charge, not yet spec'd, not needed for launch — track as
a separate low-priority ticket, don't build it now). For now the cap-hit state
just needs to render as locked; the actual PAYG purchase flow can 404/"coming
soon" until that ticket is picked up.

This is a **different cap from LIC-36's 3-free-messages limit** — that one
gates free (unpurchased) users. This one gates paid users past a generous but
real usage ceiling. Don't conflate the two in the build.

**Implementation — track real cost, not just message count**, since cost
varies with conversation length:

```sql
-- add to tutor_messages (§1)
alter table public.tutor_messages
  add column input_tokens integer,
  add column output_tokens integer;
```

Populate both on every assistant-role insert (the model API response includes
usage counts — use those, don't estimate). On each request, before calling
the model: sum `input_tokens * <model input $/token> + output_tokens *
<model output $/token>` across this user+course's rows; if the running total
exceeds the £2.50-equivalent threshold (compute in USD/GBP at request time,
or hardcode a conservative token-budget number derived from current pricing —
either works, pick whichever's less fiddly to implement) and no PAYG
entitlement exists, return the locked state instead of calling the model.

## 5. Continuous improvement — realistic version, not live fine-tuning

Sim's ask: the tutor should get better "as more and more users talk to it."
**Model fine-tuning/retraining is not the right scope for this stage** — it
needs real infrastructure and meaningful data volume neither of which exist
yet, and would be over-engineering for a pre-launch product. The practical
equivalent that's actually buildable now, enabled by §1's persistent storage:

- Add a lightweight thumbs up/down control in the chat UI, writing to
  `tutor_messages.rating` on the relevant assistant message.
- Periodically (manually at this scale — a scripted query, not a dashboard)
  review low-rated exchanges and any messages where the redirect pattern in
  §2 fired, to refine the system prompt or add content to the LO's
  `exam_technique`/`misconceptions` fields where a real content gap shows up.
- This is a human-curated feedback loop, not automatic self-improvement — set
  that expectation now so it isn't read as "the model literally retrains
  itself," which it won't.

## 6. API route — `src/app/api/tutor/chat/route.ts`

POST, authenticated. Request body: `{ courseId, loNumber, message }`.

1. Check `tutor_messages` count for this user/course vs. `feature_entitlements`
   — free tier locks at the agreed cap (was 3 messages; confirm this is still
   the right number now that history persists and re-reading old messages is
   "free" in the sense the user doesn't need to ask again — may not need to
   change, flag if Sim wants to revisit).
2. Build the system prompt: syllabus grounding for the current LO
   (`content/lo{n}.json` — switch to a DB read once all 24 LOs are migrated,
   see `PMQ_NATIVE_MIGRATION.md` open item), weak-area summary from `attempts`
   where `is_correct = false`, and the §2 redirect few-shot examples.
3. Pass recent `tutor_messages` rows (or a compacted summary per §4) as
   conversation history into the model call.
4. Call `callTutorModel` (§3's abstraction).
5. Insert both the user message and assistant reply into `tutor_messages`.
6. Return `{ reply, messagesRemaining }`.

## 7. Frontend — `AiTutorPanel.tsx` changes

- On panel open, fetch and render existing `tutor_messages` for this user/
  course — the chat picks up where it left off, across sessions, per §1.
- Message list, input, send button, thumbs up/down per assistant message
  (§5).
- Free-tier cap UI unchanged in concept from the original draft — lock state
  shows the upgrade CTA (LIC-37).

## 8. Definition of done

- Signed-in user's chat history persists across a page reload and across
  separate sessions (close browser, come back next day, history's still
  there).
- Tone: an off-syllabus question gets a redirect per §2, not a flat refusal —
  test with 2-3 genuinely off-topic questions and confirm it doesn't feel
  stonewalling.
- Model call works through the `callTutorModel` abstraction — confirm by
  checking there's no vendor-specific code outside that one function.
- Thumbs up/down writes to `tutor_messages.rating`.
- `AI_TUTOR_LAUNCHED` flipped to `true` only after this is verified working
  AND after the Privacy Policy update in §1 is actually live (not just
  logged as a todo).

## 10. Course-completion summary — new, added 2026-07-08

Once all 24 `section_progress` rows for a user+course have `quiz_completed_at`
set, the tutor should proactively deliver a one-time summary: where the user
is strong, where they're weak, and customized exam tips — not something they
have to ask for.

- **Trigger:** server-side check after the 24th section completes (wherever
  `section_progress` gets its final update — likely the same action that
  marks LO completion, LIC-32). Don't poll for this client-side.
- **Input:** aggregate `attempts` for this user+course, grouped by
  `learning_objective` and `is_correct` — same weak-area query pattern as §6
  step 2, just run across the whole course instead of one LO.
- **Output:** one AI-generated message via the same `callTutorModel`
  abstraction (§3), inserted into `tutor_messages` as a normal assistant
  message (`role: 'assistant'`) so it shows up in the persistent chat history
  like anything else — no separate UI surface needed.
- **Gating: confirmed paid-only (2026-07-08).** It's part of the AI tutor
  feature, so it's gated behind the same `feature_entitlements` check as the
  rest of the tutor — a free user who completes all 24 LOs sees this locked
  (via `LockedFeature`, §11), not delivered for free.
- Counts toward the §4 fair-usage cap like any other message.

## 11. Locked/de-emphasized pattern for gated paid features — shared component

Sim's requirement, applies beyond just the tutor: **every paid feature visible
to a free-tier user must render locked — lock icon, dotted/dashed outline,
visually de-emphasized (lower opacity or muted colors) — not hidden, not a
full paywall interstitial.** This needs to be ONE shared component, not
reimplemented per feature, since it'll be used in at least: the AI tutor panel
(both the free-tier 3-message lock and the §4 fair-usage cap), the Real Mock
Exam entry point (LIC-40, free users see the Lite exam only, Real is locked
next to it, see `REAL_MOCK_EXAM_SPEC.md`), and eventually the quick-generation
quiz button (LIC-22, post-launch).

**Recommend building this as its own small ticket before Wave 3 starts** —
`src/components/LockedFeature.tsx`, wraps any child content, accepts an
`unlocked: boolean` and renders either the real content or a locked variant
(dashed border, lock icon, reduced opacity, click routes to the upgrade CTA).
`AiTutorPanel.tsx` already has ad-hoc lock styling (🔒 emoji, dashed border on
one info box) — this component should absorb/replace that rather than leaving
two different "locked" visual languages on the same page.

## 9. Open questions for Sim

- ~~Retention window~~ — **decided: 12 months from the last message in a
  conversation, rolling.** `legal/PRIVACY_POLICY.md` sections 2, 4, 5, and 6
  rewritten 2026-07-08 to reflect this plus the Gemini provider choice. Still
  first-draft/not-solicitor-reviewed like the rest of that document (LIC-46).
- ~~Gemini or Anthropic~~ — **decided: Gemini, Flash tier** (see §3).
- Free-tier message cap: keep at 3, or reconsider now that history persists?
- Any real number in mind for §4's soft cap, or park that decision until you
  have actual usage data?
