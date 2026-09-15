# Cursor: PFQ AI Pro price change, £15 -> £20

**Ticket:** LIC-157 (PFQ pricing page)
**Branch:** `wip-2026-08-19`
**Decided by Sim 2026-09-15.** Supersedes the £15 figure in
`cursor-prompt-pfq-commerce-tiers.md`, which has been updated in place.

## The change

| | Before | After |
|---|---|---|
| PFQ Pro | £10 | £10, unchanged |
| PFQ AI Pro | £15 | **£20** |
| Pro -> AI Pro upgrade | £5 | **£10** |

Both moved together on purpose. At £20 with a £5 upgrade, buying Pro and then
upgrading would cost £15 against £20 for buying AI Pro outright, so every buyer
would take the two-step route and the £20 headline would be decorative. Pro plus
upgrade must equal AI Pro exactly. `tests/course-registry-terms.test.mjs` now
asserts that, so the build fails if the two ever drift apart again.

**PMQ AI Pro stays at £15.** Do not touch `src/lib/pmq/plans.ts`, the philosophy
pages, `PMQ_PRO_BUNDLE_SPEC_SHEET.md`, or `cursor-prompt-launch-fixes-2026-07-31.md`.
The £15 figures in those are PMQ's and are correct.

## Already done by Claude (verify, do not redo)

- `src/lib/courses/registry-data.ts`: `aiProPriceCents: 2000`,
  `aiProUpgradePriceCents: 1000`.
- `src/lib/pfq/constants.ts`, `src/lib/pfq/tiers.ts`: doc comments updated.
- `tests/course-registry-terms.test.mjs`: pins 2000 / 1000 and asserts
  `priceCents + aiProUpgradePriceCents === aiProPriceCents`.
- `docs/roadmap.md` and `cursor-prompt-pfq-commerce-tiers.md` updated.
- `npx tsc --noEmit` clean, 28/28 build tests pass.
- Repo swept: no PFQ-context `£15` or `£5 upgrade` string remains.

## Stripe: nothing to do

There is no AI Pro Stripe Price, in either mode, and there must not be one until
the £10 upgrade path is built. `aiProStripePriceId` and
`aiProUpgradeStripePriceId` stay `null`. The PFQ Pro Price
(`price_1UFuLmEClgppvApr09UCGO8N`, £10) is unaffected.

## Your tasks

1. **Confirm the card renders from the registry, not a literal.** The AI Pro
   card should now read £20 with a "£10 if you already have Pro" note, with no
   code change, because `PFQ_PLANS` derives both from
   `registry-data.ts`. If it still shows £15 anywhere, something is hardcoded:
   find it and make it derive. Never patch the display value on its own, a page
   that advertises a price the registry does not hold is a misleading price
   indication under the CPRs, not a cosmetic bug.
2. **Sweep the surfaces a grep cannot reach.** Any baked-in price in an OG or
   social share image, a screenshot in the marketing pages, a PDF, or the PFQ
   AI Pro waitlist email template (`PFQ_AI_PRO_NOTIFY_KEY` in
   `src/lib/notify/lists.ts`, currently price-free, keep it that way).
3. **Re-run `npm run build`** and confirm the four invariant tests pass.

## Done means

- AI Pro card: £20, upgrade note £10, still a Join Waitlist button with no
  checkout.
- No £15 visible anywhere in a PFQ context, rendered or in source.
- `npm run build` green.
