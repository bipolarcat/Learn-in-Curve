# Cursor prompt — rewrite the PMQ course overview page

**Written 18 Aug 2026.** Copy is fully specified in `PMQ_OVERVIEW_PAGE_COPY.md` — read that first and treat it as the source for every string. This prompt covers the build only.

## Why

`src/app/(site)/pmq/page.tsx` is the course overview page and it currently carries a hero, three feature cards and a CTA. That is enough to describe the free tier and nothing else. A visitor cannot see the study pathway, the mock exam format, the tier ladder, or that Sly exists — so the page asks for an enrolment before it has explained what is being enrolled in.

The activation funnel says 39% of users are lost between the Orient and Learn stages. A visitor who arrives inside the course without knowing its shape is the most likely person to be in that 39%. Showing the pathway *before* signup is the cheapest intervention available.

Three files already hold the facts this page needs, and none of them should be duplicated into it:

- `src/lib/pmq/tiers.ts` — what each tier actually unlocks
- `src/lib/pmq/plans.ts` — what the cards are permitted to claim, and `planFeatureValue()` for reading a figure
- `src/lib/pmq/lo-stages.ts` — `LO_STAGE_ORDER`, `LO_STAGE_COUNT`, `PMQ_TOTAL_PROGRESS_UNITS`

## Task 1 — hero

Replace the lead with option A from the copy doc. Keep the eyebrow, title, artwork and `PmqStartLink` exactly as they are.

Change the secondary CTA label from "View Plans" to "See what's included". Keep it pointing at `PMQ_PRICING_HREF`.

Add a one-line trust strip under `.actions`, using the existing `.note` class: `Free forever · No card · 24 learning objectives`.

## Task 2 — positioning block

New section between the hero and the feature cards. A heading and a single paragraph, no card chrome, constrained to roughly `36rem` so it reads as prose rather than a banner. Add a `.pitch` / `.pitchTitle` / `.pitchBody` trio to `CourseMarketing.module.css` following the type scale already in that file — Fraunces for the heading, Figtree for the body.

## Task 3 — feature cards

Replace the three card bodies with the copy-doc versions. Keep `IconPractice`, `IconMock`, `IconCore` and the `.features` grid untouched.

`PRACTICE` and `MOCKS` currently come from `planFeatureValue("starter", …)`. Card 1 keeps that binding. Card 2's heading becomes "A full mock paper, free" — no interpolated count — so drop the now-unused `MOCKS` constant rather than leaving it dangling.

## Task 4 — the pathway strip

New section rendering the seven stages horizontally, derived from `LO_STAGE_ORDER` — do not hardcode the list, and do not hardcode 168. Read `PMQ_TOTAL_PROGRESS_UNITS`.

`Video` and `Audio` must carry a small "Pro" chip. Derive that from `canAccessMedia()` semantics rather than a hardcoded pair of strings: those two stages are Pro-gated per `tiers.ts`, and a strip that shows seven stages while a free account delivers five is the exact claim/delivery mismatch `pro-included.ts` exists to prevent.

Must wrap gracefully on mobile. A horizontal scroll strip is acceptable; a squashed seven-column grid is not.

## Task 5 — mock exam section

Heading, one paragraph, and three stat figures (40 questions · 90 marks · 2.5 hours). Style the stats like figures, not sentences — Fraunces, large, orange accent on the numeral, consistent with `.featureTitle`.

## Task 6 — Sly section

Heading and one paragraph, then the status line from the copy doc as a visually distinct note.

**The status line is not optional and must not be softened.** `FEATURES.md` records that copy which lets a visitor infer a free account includes the tutor is a misleading omission under the CPRs and generates refunds in practice. If the layout makes it look like fine print, change the layout, not the sentence.

Link the "try it on the homepage" phrase to `/` — the guest Sly panel lives there.

## Task 7 — the ladder

Render `PmqPlanCards` under a "Start free. Upgrade if you want more reps." heading, using the existing `.plans` / `.plansTitle` classes.

Check that the AI Pro card's `status: "waitlist"` badge actually renders in this context. If it only renders on `/pricing`, fix it so it renders here too. An unbadged waitlist card on a page with buy CTAs reads as purchasable.

Add the one-off payment line beneath the cards using `.note`.

## Task 8 — FAQ

Add the four product FAQs from the copy doc **above** the existing `PmqFaqSection` items. Prefer extending `PmqFaqSection` with a `leadingItems` prop over duplicating the accordion — its header comment says the copy is locked, and it should stay that way.

## Task 9 — closing CTA and legal

Retitle the footer CTA block with "Find out what you can't answer yet". Keep both buttons and `analyticsLocation="pmq_overview_footer"`. `APM_DISCLAIMER` stays exactly as it is.

## Task 10 — analytics

Every new CTA and the Sly homepage link need `capture()` events consistent with `src/lib/analytics/events.ts`. Route them through the existing helper — nothing may fire before cookie consent, per `PostHogProvider`.

Add a scroll-depth or section-view event on the pathway strip. It is the section this rewrite is betting on, and without an event there is no way to know whether it worked.

## Do not

- **Do not hardcode any number that has a constant.** Question counts come from `planFeatureValue()`, stage count from `LO_STAGE_ORDER`, progress units from `PMQ_TOTAL_PROGRESS_UNITS`. A figure typed into this page can only ever drift out of agreement with what the gates deliver, and `plans.ts` is explicit that an unprovable count is a misleading commercial practice, not a cosmetic bug.
- **Do not write the Pro price into this page.** It derives from `SLY_UNLOCK_PRICE_CENTS`. `PmqPlanCards` already handles it.
- **Do not put "nearly 1,900" or 1,862 anywhere on this page.** That is the AI Pro ceiling and AI Pro has no checkout. It belongs on the plan card, where the "Launching soon" badge sits next to it.
- **Do not add a pass rate, a "pass first time" claim, or a learner count.** No outcome data exists, and any learner count would have to come from `attempts`/`auth.users` rather than `profiles`, which is under-populated.
- **Do not redesign.** Reuse the existing tokens, type scale, card treatment and stamp CTAs. New classes should look like they were always in `CourseMarketing.module.css`.
- Do not touch `/pricing`, `PMQ_PLANS`, or any entitlement logic. This is a copy and layout task.

## Report back

Append to `BUSINESS_STATE.md`: which sections landed, whether the waitlist badge needed fixing, any place where a copy-doc claim could not be backed by a constant, and the new analytics event names. Flag anything you had to hardcode and why.
