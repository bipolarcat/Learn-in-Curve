# Cursor prompt — LIC-42: AI tutor real chat backend

Full spec is `AI_TUTOR_BACKEND_SPEC.md` at the repo root — follow it exactly,
section numbers referenced below map to that doc. `GEMINI_API_KEY` is now set
in `.env.local`. Don't run this in the same session as the two content/LO
prompts if you can help it — this one's a genuinely different surface area
(new API route, DB migration, frontend chat UI) and benefits from a clean
context, but it doesn't touch the same files so parallel is technically safe
if you're capacity-constrained.

## Build order

1. **DB migration** — `tutor_messages` table per §1, plus the `input_tokens`/
   `output_tokens` columns per §4. RLS: owner-only select/insert. Use
   `apply_migration` via Supabase MCP if you have it, or a numbered migration
   file matching however this repo's existing migrations are structured —
   check for a `supabase/migrations/` folder first.
2. **`callTutorModel` abstraction** — §3. Real one-function interface, Gemini
   3 Flash as the implementation. No vendor-specific code anywhere outside
   this function — that's the definition-of-done check in §8.
3. **System prompt** — syllabus grounding + §2's redirect-not-refuse tone
   with the 3-4 few-shot examples written into the prompt itself, not just
   described abstractly.
4. **API route** — `src/app/api/tutor/chat/route.ts` per §6, all 6 steps
   including the §4 fair-usage cost check (real `input_tokens`/`output_tokens`
   summed and compared against the £2.50-equivalent threshold, not a flat
   message count).
5. **Frontend** — `AiTutorPanel.tsx` changes per §7: load history on open,
   message list/input/send, thumbs up/down writing to `tutor_messages.rating`.
   Don't rebuild the panel shell, entitlement check, or Stripe button — those
   already exist per §0.
6. **Course-completion summary** — §10. Server-side trigger on the 24th
   `section_progress` completion, paid-gated, delivered as a normal assistant
   message in the existing chat history.
7. **LockedFeature adoption** — `src/components/LockedFeature.tsx` already
   exists (LIC-53, shipped Wave 2). Replace `AiTutorPanel.tsx`'s ad-hoc lock
   styling (🔒 emoji, one dashed box) with it, for both the free-tier cap and
   the §4 paid fair-usage cap.

## Two open calls — use these defaults, don't block on them

Per §9: free-tier message cap stays at **3** (unchanged from the original
design), and the §4 soft-cap number is whatever a genuine £2.50-equivalent
token budget computes to at current Gemini 3 Flash pricing ($0.50/$3.00 per M
tokens in/out) — hardcode a conservative token count derived from that rather
than doing live currency conversion. Flag in your status report if either
feels wrong once it's built, but don't stall the build waiting on it.

## Definition of done — §8, verify all of these before reporting complete

- Chat history persists across reload and across sessions for a signed-in
  user.
- An off-syllabus test question (try 2-3 genuinely unrelated ones) gets a
  redirect, not a flat refusal.
- No vendor-specific (Gemini) code exists outside `callTutorModel`.
- Thumbs up/down writes to `tutor_messages.rating`.
- **Do NOT flip `AI_TUTOR_LAUNCHED` to `true`.** That's gated on the Privacy
  Policy update actually being live (it already is — `legal/PRIVACY_POLICY.md`
  was rewritten 2026-07-08) plus Sim's explicit go-ahead once this is verified
  working. Leave the flag as `false` and say so clearly in your report — this
  is a launch decision, not a build one.

## When done

Log to `BUSINESS_STATE.md` per the documentation-discipline rule. Move
LIC-42 to **In Review** (not Done) in Linear — same for LIC-36/37 if this
build happens to close their scope too (check before assuming).
