# Pre-Launch Legal Checklist — Learn in Curve

**Do not publish the live site to real users until every box below is checked.**
This is the gate referenced in `BUSINESS_STATE.md` — if you're reading this
because you're about to flip the site live, that's exactly the right instinct.

## 1. Entity & registration

**Note (2026-07-06):** the "Coming soon" AI tutor removes payment-compliance
urgency (section 4), but *not* this section — you're collecting real personal
data (email, optional dashboard profile details including company/employer, quiz activity, and course activity used for streak) from the moment sign-up goes live today,
regardless of whether any money moves. ICO registration and the entity
decision below are independent of the payment question.

- [x] **Decided 2026-07-12: sole trader.** Register the Stripe account as an
      individual/sole proprietor under Sim's own legal name — matches the
      data-controller field already in `PRIVACY_POLICY.md`. No Companies
      House registration for launch; revisit and migrate the Stripe account
      later if it makes sense to incorporate as the business grows.
- [ ] ~~If incorporating: register via Companies House...~~ *(N/A — sole
      trader decision above.)*
- [x] If staying a sole trader: replace the entity placeholder in
      `PRIVACY_POLICY.md` with your real legal name. *(Done 2026-07-03 — "Sim
      Samaar Shened" added as the named individual controller. This doesn't
      resolve the incorporate-or-not decision above, just the name field.)*
- [ ] Check the ICO's fee self-assessment tool (ico.org.uk/fee-checker) and
      register + pay the data protection fee if required (~£52–78/year for a
      small business). Non-payment when required carries a fine up to £4,000 —
      cheap to just do.

## 2. Documents — finalize the drafts

- [x] **All remaining placeholder text filled in.** *(2026-07-06 — this was
      flagged as important and done today.)* Specifically: `[date]` /
      "Last updated · Effective from" fields on all four docs now read
      6 July 2026; `PRIVACY_POLICY.md` section 4/5 (international transfers,
      Stripe/Anthropic) rewritten to reflect that neither is actually live yet
      (AI tutor is "Coming soon", no checkout); section 6 retention window set
      to 30 days; `TERMS_OF_SERVICE.md` refund section now states plainly that
      the AI tutor isn't purchasable yet and a refund policy will be published
      before checkout opens; governing law (England & Wales) confirmed correct
      with the user, caveat removed; `RECRUITMENT_PRIVACY_NOTICE.md` retention
      window set to 6 months post-decision.
- [x] **Solicitor review consciously skipped, banners removed (2026-07-10).**
      Sim explicitly chose to finalize all four docs now rather than wait for
      a solicitor review — asked directly, given both options, chose "remove
      the banner, make the final version right now." All four docs had their
      "FIRST DRAFT / not yet reviewed by a solicitor" banners removed and all
      remaining placeholder content replaced with real text (refund policy,
      fair-usage clause, liability cap language — see below). **This is a
      known, informed risk, not a resolved one:** the docs now read as final
      to any user or regulator, without an actual solicitor ever having
      reviewed them. If a dispute arises, "we knew and chose not to check"
      is a materially worse position than "we hadn't gotten to it yet." A
      real review remains worth getting when there's budget for it, even
      after this point — this checkbox tracks that the *conscious decision*
      was made, not that the underlying legal risk is gone.
- [x] `PRIVACY_POLICY.md` — entity name and contact email filled in
      (2026-07-03: Sim Samaar Shened / simsamaarshened@gmail.com).
      International-transfer safeguards and retention window resolved
      2026-07-06 (see above).
      **2026-08-08 Growth Pass 1:** `/free-mock-exam` stores emails in `public.leads`
      (score + optional marketing). Results email = requested service; marketing
      is a separate unticked checkbox + `consent_timestamp`. Confirm Privacy Policy
      § retention / marketing lists mentions this lead path before pushing paid
      traffic at the page (same PECR rule as the newsletter waitlist). No new
      third-party processor — Supabase only.
      **2026-08-13:** newsletter form now records `marketing_consent = true` on
      the server (submitting "Join our newsletter" is the consent act). Five
      existing `false` rows were **not** backfilled — those addresses may only
      receive transactional mail until they consent through the fixed form.
      `is_internal` excludes founder/test rows from counts and sends. Solicitor
      still needed before the first real marketing send (this checklist item is
      capture going forward, not a green light to broadcast). Informal /
      educational, not legal advice.
- [x] `TERMS_OF_SERVICE.md` — real refund policy drafted 2026-07-10 (14-day
      no-questions-asked window if unused, case-by-case for genuine faults,
      abuse carve-out) replacing the earlier "not purchasable yet" deferral.
      New fair-usage clause added same day (3 free messages, then generous-
      but-not-unlimited paid allowance, abuse-triggered pause) — the
      user-facing counterpart to `AI_TUTOR_BACKEND_SPEC.md` §4/§11. Liability
      cap (section 9) now has real language (capped at amount paid in the
      trailing 12 months) — drafted by Claude, **not sized or reviewed by a
      solicitor**, published anyway per the 2026-07-10 conscious-risk
      decision above.
- [ ] `COOKIE_NOTICE.md` — **partially stale risk (2026-07-08):** Intercom
      Messenger is now wired (`IntercomProvider` / `SendFeedbackButton`) but
      dormant without `NEXT_PUBLIC_INTERCOM_APP_ID`. Notice + Privacy §3/§4
      already document the dormancy. **2026-07-28:** on-site acknowledgement
      banner shipped (`CookieBanner`) for transparency while cookies remain
      strictly necessary only — not a non-essential consent choice. Before
      putting a real App ID into production: update Cookie Notice for Intercom
      cookies, upgrade the banner to real accept/reject if Intercom's cookies
      are non-essential, and accept Intercom's DPA. Do not treat this item as
      closed just because the code landed.
- [x] `COOKIE_NOTICE.md` baseline (2026-07-06 pass) was accurate for Supabase
      session-cookie-only; Intercom caveat added 2026-07-08 above.
- [x] `RECRUITMENT_PRIVACY_NOTICE.md` — retention period set to 6 months
      post-decision (2026-07-06).
- [x] **Pass-rate inconsistency — resolved 2026-07-14, cleaned up 2026-07-15.**
      Homepage hardcoded "94% pass rate" StatBand removed from landing page
      (`page.tsx`); no longer conflicts with Terms "no guarantee of exam
      success". `StatBand.tsx` component (the only place the stat lived in
      code) has now been deleted from the repo entirely — nothing referencing
      the 94% figure remains in the live product. Linear LIC-47 closed.
- [x] **Numeric quiz-bank claim verified — 2026-07-27.** The free-tier Practise
      CTA says "Unlock 1000+ questions" (`PracticeQuizSection.tsx`, 2026-07-16).
      The missing 1,169 questions were migrated on 2026-07-27; the live table now
      holds **2,022 rows**, verified with no duplicates. The claim is
      substantiated — keep the row count as the evidence if the copy is ever
      challenged, and re-check if the bank is ever pruned.
- [x] **Landing syllabus slides tier-qualified — 2026-07-31.** The new
      `public/Landing page/Learn the full syllabus/` artwork markets video/audio
      overviews and Sly capabilities. `ui/expand-cards` visibly labels slide 6
      “Pro Bundle” and slide 7 “AI Pro · launching soon” so the illustrations do
      not imply those features are part of Starter or already generally
      available. Re-check these qualifiers when AI Pro launches.
- [x] **Contact email swapped to Workspace addresses — 2026-07-30.** All four
      docs (`PRIVACY_POLICY.md`, `TERMS_OF_SERVICE.md`, `COOKIE_NOTICE.md`,
      `RECRUITMENT_PRIVACY_NOTICE.md`) now list `support@learnincurve.com`
      instead of the personal Gmail; `/careers` mailto updated to match. The
      site's "Get in touch" card/page now shows `hello@learnincurve.com`.
      Google Workspace for `learnincurve.com` was set up the same day (admin
      account `sim@learnincurve.com`, `hello@`/`support@` added as aliases on
      that one mailbox). **Note:** the contact-form/feedback-form backend
      (`send-contact-email.ts` / `send-feedback-email.ts`) still delivers to
      the personal Gmail, not `support@` — that's a separate, not-yet-done
      step (repoint `CONTACT_TO`/`FEEDBACK_TO` once Sim wants mail landing in
      Workspace instead). Text/legal-substance itself was not rewritten in
      this pass — see the two items below, still open.
- [ ] Get a solicitor's fixed-fee review of all four documents, at minimum the
      Terms (see the 2026-07-03 conversation on how this is normally scoped —
      a review pass, not a from-scratch drafting engagement). Not done —
      today's publish proceeds without it (see item 5).

## 3. Site integration

- [x] Turn Privacy/Terms/Cookies into real pages and link them live from the
      footer. *(Done 2026-07-03 — `/privacy`, `/terms`, `/cookies` pages added
      under `(site)/`, rendering `legal/*.md` directly via the existing
      `MarkdownBlock` component so the live pages and the reviewed source docs
      never drift apart. `SiteFooter.tsx`'s "Privacy (soon)"/"Terms (soon)"
      placeholder spans replaced with real links; a Cookies link added
      alongside them.)*
- [x] `/careers` and `/recruitment-privacy` are live (confirmed by reading the
      actual files, not just the prompt) — real "no open roles" copy, mailto
      CTA, and a link to the recruitment notice. Footer's Contact mailto is
      simsamaarshened@gmail.com. *(Confirmed landed 2026-07-04.)*
- [x] Add a "I agree to the Terms and Privacy Policy" checkbox to the sign-up
      flow. *(Done 2026-07-06 — `AuthForm.tsx` now requires the checkbox for
      both email and Google sign-up before either submit path can run; blocks
      with a message if unchecked.)*
- [x] **"Not affiliated with APM" disclaimer on PMQ course overview — 2026-07-30
      (scoped).** History worth knowing: this line was dropped from the UI on
      2026-07-14, restored in commit `375ef9c`, then **silently deleted a second
      time** by one of the footer/homepage redesign passes. Linear LIC-48 was
      closed "Done" on 2026-07-25 on the strength of reading that commit — but a
      fresh grep on 2026-07-30 found the string in **zero** `.tsx` files. Lesson
      recorded in LIC-48: never close a visible-copy ticket from commit
      inspection alone. Wording lives in `src/lib/legal-copy.ts` as
      `APM_DISCLAIMER` (pinned to §2 of `TERMS_OF_SERVICE.md`). Render path:
      `SiteFooter` (`showApmDisclaimer`) → enabled only on
      `/courses/pmq-in-5-days` via `CoursesSiteFooter` (not site-wide, not LO /
      pricing / preview). `tests/apm-disclaimer.test.mjs` fails CI if the
      constant, the gated footer usage, or the matching Terms clause disappears.
      **Outstanding:** one live-page eyeball before LIC-48 is closed. **Note
      (informal):** homepage/pricing still market PMQ material without this line
      on-page — Terms still carry it; revisit if a solicitor wants broader
      surface coverage.
- [x] **PFQ ATP / trademark disclaimer on `/pfq` — 2026-08-13.**
      `PFQ_ATP_DISCLAIMER` in `src/lib/legal-copy.ts` (not an Accredited Training
      Provider; do not sell/administer/invigilate the exam; APM/PFQ trademark
      acknowledgement). Rendered on `/pfq` and mock routes. Guarded by
      `tests/pfq-disclaimer.test.mjs`. No pass-rate or endorsement claims.
      Informal guidance only — solicitor before any paid PFQ product.
- [ ] **PFQ checkout CCR waiver — before live charges (2026-08-13).**
      `createPfqCheckout` + Stripe `consent_collection` built with the required
      unticked waiver; gated by `PFQ_CHECKOUT_ENABLED = false` until Sim confirms
      solicitor/review of the wording. Terms + refund policy already at `/terms`.
      Flip the flag only after that review — educational note, not legal advice.

## 4. Payments & data compliance

**Launch decision (2026-07-30): going live 2026-07-31 with the Pro bundle
purchasable from day one (price now £8.00 via `SLY_UNLOCK_PRICE_CENTS` — keep
Stripe Price + Supabase `exam_config` in lockstep).** Sim was offered a free-tier-only launch today (far
smaller legal surface) and chose paid-tomorrow instead. That makes every item in
this section hard-blocking, not deferrable. Verified same day: `.env.local` still
carries `sk_test` and there is no `.env.production`, so Stripe live mode is
genuinely unconfigured — see Linear LIC-49 for the full dashboard task list.

- [x] **Consumer Contracts Regulations 2013 — cancellation-right consent at
      checkout (added 2026-07-30).** A UK consumer normally has 14 days to cancel
      a distance contract for any reason. For digital content supplied
      immediately, that right is only lost if the consumer (a) expressly consents
      to immediate supply, (b) acknowledges losing the right to cancel, and (c)
      receives confirmation in a durable medium — *all before delivery starts*.
      Miss any one and they keep the full 14-day unconditional right **even after
      consuming the content**, whatever Terms §5 promises. `createAiTutorCheckout`
      and `createSlyTopUpCheckout` now both send a shared
      `DIGITAL_CONTENT_CONSENT` block (`consent_collection.terms_of_service:
      "required"` plus custom acknowledgement wording), and Stripe records the
      acceptance on the Session as evidence.
      **Hard dependency:** Stripe rejects session creation unless a Terms of
      service URL is set under Settings → Business → Public details. Checkout
      therefore fails loudly if that's missing rather than quietly dropping the
      waiver — deliberate. Set it before launch.
      *Wording drafted by Claude, not solicitor-reviewed (see §2 / §5).*

**Status update (2026-07-10): `AI_TUTOR_LAUNCHED` is now `true`** in
`src/lib/pmq/constants.ts` — flipped for Sim's own trial testing (verified via
Supabase: 1 distinct user, 2 messages, all same day). **No public checkout CTA
exists yet (LIC-37, not yet built)**, so no real customer can currently pay —
that's the only reason this section isn't fully blocking today. The instant
LIC-37 ships and a real customer can click "buy," every item below becomes
blocking. Don't treat the flag being `true` as equivalent to "still gated" —
re-read this whole section before LIC-37 goes live, not just before some
future flag flip.

- [ ] Confirm Stripe is in live mode (not test keys) with a real bank account
      connected, before any real payment can succeed.
- [ ] Complete Stripe's PCI SAQ A self-attestation in the Stripe dashboard (you
      qualify for SAQ A because Checkout is hosted by Stripe — see the
      2026-07-03 conversation). Quick, self-administered, not a lawyer task.
- [ ] Confirm you've accepted Supabase's and Stripe's Data Processing Agreements
      (both offer one in-dashboard, no negotiation needed for a business your
      size).
- [ ] Once the AI tutor is actually wired up: confirm **Google (Gemini)** DPA is
      accepted (was Anthropic in original draft — provider changed 2026-07-08).
      `PRIVACY_POLICY.md` section 2 was rewritten 2026-07-08 to disclose stored
      chat content + 12-month rolling retention — **no longer "no raw conversation
      storage."** Re-check before flipping `AI_TUTOR_LAUNCHED` to true.
      **2026-07-17:** homepage guest Sly trial is now live (3 messages per hashed
      IP → Gemini). That is a **public, cost-bearing** Gemini path even for
      unsigned visitors — do not treat “no public checkout” as “no Gemini
      traffic.” Gemini DPA + transfer safeguards remain blocking before real
      public marketing traffic is pushed hard at this CTA.
      **2026-07-31 UX update:** the decorative scripted conversation was
      removed; `SlyTutorWindow` now opens directly to suggested questions and
      the real composer. This changes discovery, not processing: only a
      visitor's deliberate click/send reaches Gemini, and the same three-message
      cap, hashed-IP control and disclosures remain.
      **2026-07-17 (clarification):** Sim proposed giving the guest/demo Sly
      its own separate knowledge base, not linked to real student data, as a
      way to satisfy this. **That doesn't close the gap — different problem.**
      The DPA obligation is triggered the moment a visitor's typed message +
      hashed IP is sent to Google's Gemini API for processing at all; it does
      not depend on whether the answer is grounded in a demo knowledge base or
      the real course content, or on whether the session is ever linked to a
      real account. Knowledge-base separation is good practice (purpose
      limitation, smaller blast radius if breached) but doesn't touch the
      controller/processor relationship with Google. **Actual gate, unchanged:**
      confirm Cloud billing is enabled on the Google Cloud project behind
      `GEMINI_API_KEY`, then accept the Data Processing Addendum in that
      console. Also note: this isn't guest-CTA-only exposure — the signed-in
      course tutor (LIC-42) has been sending real student prompts to Gemini
      since 2026-07-08, so the DPA gap may already be live today, not just a
      gate for future guest/marketing traffic.
      **2026-07-18:** paid Mock Exams 2–4 send a learner's written answer plus
      the relevant question/marking rubric to Gemini for structured scoring,
      then store the score and feedback. Free Exam 1 is self-assessed and does
      not send written responses to Gemini for marking. The Privacy Policy and
      Terms disclose both paths. Do not enable Pro AI marking for real learners
      until the same Gemini DPA/transfer gate is closed. Integrity migration
      `20260718180000_mock_exam_integrity.sql` is now live; apply
      `20260718220000_mock_exam_sets.sql` and verify each paper has exactly
      40 questions / 90 marks with complete written rubrics before enabling
      Exams 2–4.
      **2026-07-18 interface follow-up:** mock sessions now also persist the
      learner's current question and flagged-question state, and starting a
      paper consumes its single lifetime attempt. This remains ordinary course
      activity under the existing disclosure; no new processor is introduced.
      Apply `20260718234500_mock_exam_parts_navigation.sql` only after its
      duplicate-session preflight succeeds. *(Done 2026-07-19 — migration
      applied and verified, see BUSINESS_STATE.md.)*
      **2026-07-19 (sharper diagnosis):** confirmed `callTutorModel.ts` /
      `callExamGrader.ts` both call the plain Gemini Developer API endpoint
      (`generativelanguage.googleapis.com/...?key=`) — the same endpoint used
      by both Google AI Studio's free tier and the paid tier. Which tier
      actually applies depends entirely on whether Cloud Billing is enabled on
      the Google Cloud project behind `GEMINI_API_KEY`. Per Google's current
      terms, the free tier permits using submitted content to improve/train
      products and allows human reviewer annotation — explicitly not meant for
      sensitive/personal data. If billing hasn't been enabled on this project,
      real student tutor conversations and written exam answers sent so far
      may have been exposed to that free-tier usage, not just "no DPA yet."
      This is self-service but requires Sim's own Google account and a
      payment method — an agent cannot complete it. Steps: (1) find the GCP
      project behind the live key in Google AI Studio's API keys page, (2)
      confirm/enable Cloud Billing on that project, (3) accept the Cloud Data
      Processing Addendum under IAM & Admin in that same project. See LIC-50.
      **Done 2026-07-19:** Sim confirmed Cloud Billing was already enabled on
      "Default Gemini Project" (`gen-lang-client-0081607460` — Paid 1 tier,
      real card on file, charges since at least June 2026, so this project
      was never actually on the free tier) and personally reviewed and
      accepted the Cloud Data Processing Addendum via IAM and admin → Privacy
      and security in that project's Google Cloud Console. Gemini DPA gap
      closed for both the AI tutor and the Mock Exam 2-4 AI-grading path.
- [x] Publish the AI tutor refund policy — done 2026-07-10, real terms now
      live in `TERMS_OF_SERVICE.md` §5 (see section 2 above for detail).
- [x] **Sly pricing copy (2026-07-14 / updated 2026-07-30):** Unlock / Premium
      bundle is **£8.00** with **£5** fair-usage credit included; top-ups credit
      70% of payment (30% platform fee, not “tax”). UI + checkout use
      `SLY_UNLOCK_PRICE_CENTS` (800). **Still required before live charges:**
      Stripe Price object + Supabase `exam_config` must match — do not advertise
      £8 while charging £9.99. Solicitor review still recommended for payment
      flows.

## 5. Final sign-off

- [ ] Every box above checked, **or** explicitly accepted as an open risk per
      the two logged 2026-07-06 exceptions below — not silently skipped.
- [x] Solicitor review (section 2) either completed, or a conscious, informed
      decision made to launch without it and get one shortly after.
      **2026-07-06: launching without it — logged, not resolved. 2026-07-10:
      decision reaffirmed and extended — all draft banners removed and docs
      published as final, still without review. The underlying legal risk
      is unchanged; only the "we know we haven't checked" language is what
      disappeared. Get a real review when there's budget for it regardless
      of this checkbox being ticked.**
- [x] Pass-rate stat inconsistency (section 2) either fixed, or consciously
      deferred. **2026-07-06: deferred, to be amended with other staff shortly
      after launch — logged, not resolved. 2026-07-14/15: resolved — stat
      removed from the homepage and the component deleted from the repo. No
      longer an open risk.**
- [ ] Entity decision and ICO registration (section 1) — still genuinely open,
      not addressed by today's session.
- [ ] You've re-read this whole list once, end to end, in one sitting,
      immediately before publishing — not weeks earlier.

---
*Created 2026-07-03. Update this list if new data types, payment flows, or
third-party processors get added before launch — it should reflect the site
as it will actually ship, not the site as it looked the day this was written.*
