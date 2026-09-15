# Cursor prompt, rewrite the PMQ course overview page

**Version 2, 19 August 2026.** Copy is fully specified in `PMQ_OVERVIEW_PAGE_COPY.md`. Read that first and use it as the source for every string. This prompt covers the build.

**Style constraint for any string you write:** no em dashes or en dashes. Use commas, colons, full stops or parentheses. This applies to copy, comments and commit messages.

## Why

`src/app/(site)/pmq/page.tsx` is the course overview page. It currently has a hero, three feature cards and a CTA, which describes the free tier and nothing else. A visitor cannot see the misconceptions content, the memory aids, the command word coverage, the video or audio overviews, the study pathway, or that Sly exists. The product has roughly nine sellable features and the page shows three of them.

The page also currently leans on plan comparison language in every card body ("Pro adds more...", "Upgrade for extra mocks..."). That is pricing page work. This rewrite moves all plan detail to `/pricing` and lets this page sell features.

Facts live in three files and must not be duplicated into the page:

- `src/lib/pmq/tiers.ts`, what each tier unlocks
- `src/lib/pmq/plans.ts`, what may be claimed, plus `planFeatureValue()`
- `src/lib/pmq/lo-stages.ts`, `LO_STAGE_ORDER` and `PMQ_TOTAL_PROGRESS_UNITS`

## Task 1, remove XP

Do this first, it is independent of the page.

XP per answer has been removed from the product. It is still claimed in two places:

1. `src/lib/pmq/pro-included.ts`, `PMQ_TICKET_SELL_POINTS[0]` currently reads "Streaks + XP that pull you back every day". This is live copy on the courses catalogue card. Rewrite it to sell streaks alone, for example "Daily streaks that pull you back every day".
2. `src/components/pmq/XpStreakBar.tsx` renders an XP pill and a streak pill. Remove the XP pill, the `xp` prop, and the `xp` argument at every call site. Keep the streak pill and the percentage complete.

**Streaks stay.** Do not remove streak tracking or the completion meter. Only XP goes.

`FEATURES.md` has already been updated and carries a note explaining this. Do not re-add XP to any file on the basis of finding it elsewhere in the codebase.

## Task 2, hero

Replace the lead with option A from the copy doc. Keep the eyebrow, title, artwork and `PmqStartLink` as they are.

Change the secondary CTA label to "See What's Included", still pointing at `PMQ_PRICING_HREF`.

Add the trust strip beneath `.actions` using the existing `.note` class.

Remove the `PRACTICE` and `MOCKS` constants at the top of the file. Neither number appears on this page any more, and `planFeatureValue()` throws rather than returning a default, so leaving an unused call is a live error waiting for a plans.ts edit.

## Task 3, positioning block

New section between the hero and the feature grid. A heading and one paragraph, no card chrome, body constrained to about `36rem` so it reads as prose. Add `.pitch`, `.pitchTitle` and `.pitchBody` to `CourseMarketing.module.css`, following the existing type scale: Fraunces for the heading, Figtree for the body.

## Task 4, the feature grid

This is the main change. Replace the three-card `.features` list with a nine-card grid, three across on desktop, two on tablet, one on mobile.

Icons come from `PmqPreviewFeatureIcons`, which already exports `IconCore`, `IconPractice`, `IconMock`, `IconMisconceptions`, `IconMemory`, `IconVideo`, `IconAudio`, `IconSly` and `IconReport`. The command words card has no dedicated icon. Reuse `IconCore` rather than inventing one, or add a matching icon in the same stroke style if you prefer.

Three cards need a tier chip: `Pro` on Video and Audio, `Launching soon` on Sly. Derive Video and Audio from `canAccessMedia()` semantics and Sly from `PMQ_PLANS.ai_pro.status === "waitlist"` rather than hardcoding either. A grid showing nine features where a free account delivers six, with nothing marking the difference, is the claim and delivery mismatch that `pro-included.ts` exists to prevent.

Add the single qualifying line beneath the grid, from the copy doc. It replaces the plan table.

Keep the existing card treatment: same border, radius, shadow and `.featureIcon` orange. Nine cards at the current padding will be tall, so tighten the vertical rhythm rather than redesigning the card.

## Task 5, the pathway strip

New section rendering the seven stages horizontally from `LO_STAGE_ORDER`. Do not hardcode the stage list. Do not hardcode 168, read `PMQ_TOTAL_PROGRESS_UNITS`.

Must degrade well on mobile. A horizontal scroll strip is fine. A seven-column grid squashed onto a phone is not.

## Task 6, Sly section

Heading, one paragraph, then the status line as a visually distinct note.

**The status line is not optional and must not be softened into fine print.** `FEATURES.md` records that copy letting a visitor infer a free account includes the tutor is a misleading omission under the CPRs and generates refunds in practice.

Link the "try it on the homepage" phrase to `/`.

## Task 7, pricing handoff

No plan cards on this page. Do not render `PmqPlanCards`. A single band with the heading, the one-off payment line and a `See Plans and Pricing` button to `PMQ_PRICING_HREF`.

## Task 8, FAQ

Add the three product questions from the copy doc above the existing items. Extend `PmqFaqSection` with a `leadingItems` prop rather than duplicating the accordion. Its header comment says the copy is locked and it should stay locked.

## Task 9, closing and legal

Retitle the footer CTA block. Keep both buttons and `analyticsLocation="pmq_overview_footer"`. `APM_DISCLAIMER` unchanged.

## Task 10, analytics

Every new CTA and the Sly homepage link needs a `capture()` event consistent with `src/lib/analytics/events.ts`. Route through the existing helper so nothing fires before cookie consent.

Add a section-view event on the pathway strip. That section is the bet this rewrite is making, and without an event there is no way to tell whether it worked.

## Task 11, interface guidelines pass

Apply these while building rather than fixing them afterwards. They come from the Vercel Web Interface Guidelines.

- Headings must be hierarchical. The page has one `<h1>`, section headings are `<h2>`, and card titles are `<h3>`. The current page uses `<h2>` for card titles under an `<h1>` with no `<h2>` sections, which breaks the outline once sections are added.
- Decorative icons need `aria-hidden="true"`. The nine card icons are decorative because the card title carries the meaning.
- Images need explicit `width` and `height`, or `fill` with a sized parent, to prevent layout shift. Keep `priority` on the hero art and use `loading="lazy"` for anything below the fold.
- Interactive elements need a visible `:focus-visible` state. Do not use `outline-none` without a replacement.
- Apply `text-wrap: balance` to headings and `text-pretty` to body copy. `.title` and `.lead` already do this, so match it on the new classes.
- Use `tabular-nums` on the mock exam stat figures.
- Links use `<a>` or `<Link>`, never a div with an onClick, so middle-click and Cmd-click work.
- Title Case on buttons, sentence case on section headings. That matches the copy doc.

## Do not

- **Do not hardcode any number that has a constant.** Stage count from `LO_STAGE_ORDER`, progress units from `PMQ_TOTAL_PROGRESS_UNITS`, question counts via `planFeatureValue()` if you need one at all.
- **Do not put the Pro price on this page.** It derives from `SLY_UNLOCK_PRICE_CENTS` and belongs on `/pricing`.
- **Do not add a plan comparison, a feature matrix, or per-tier counts.** That is the specific thing this rewrite removes. The one qualifying line under the grid is the whole of it.
- **Do not write "1,862" or "up to 2,000".** The approved claim is "1,800+", once, on the practice card, with its qualifying sentence.
- **Do not add a pass rate, a "pass first time" claim, or a learner count.**
- **Do not redesign.** Reuse existing tokens, type scale, card treatment and stamp CTAs. New classes should look like they were always in `CourseMarketing.module.css`.
- Do not touch `/pricing`, `PMQ_PLANS`, or any entitlement logic.

## Report back

Append to `BUSINESS_STATE.md`: which sections landed, where XP was found and removed, any copy claim you could not back with a constant, and the new analytics event names. Flag anything you had to hardcode and why.
