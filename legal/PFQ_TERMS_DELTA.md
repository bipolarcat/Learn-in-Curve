# Terms of Service — changes required before PFQ can be sold

**Written 13 Aug 2026.** Educational drafting, not legal advice. Sim to have a solicitor review before `PFQ_CHECKOUT_ENABLED` is flipped true in production.

## Why this exists

`TERMS_OF_SERVICE.md` currently contains no mention of PFQ. It was written for PMQ in 5 Days, and two of its clauses are actively wrong for the PFQ product:

1. **§5 states that core course content, standard quizzes and Mock Exam 1 are free.** That is true of PMQ. PFQ has no free tier at all. A customer reading the current terms could reasonably believe some part of PFQ is free.
2. **§7's 14-Day Unused Guarantee defines "unused" in PMQ terms** — not messaging the AI tutor, not opening a paid quiz set, not starting Mock Exams 2 to 4. None of those events exist in PFQ. As written, a PFQ buyer could complete the entire course and still satisfy the literal definition of "unused", because they never did any of the three listed things.

Point 2 is the commercially significant one. The guarantee is generous by design, but it needs a definition that maps to the product being sold.

The good news: the machinery is already right. `src/lib/pfq/checkout.ts` reuses the same required, unticked digital-content consent block as PMQ, and it is gated behind `PFQ_CHECKOUT_ENABLED = false` pending this review. Nothing needs rebuilding.

---

## Change 1 — §5 Access, Paid Features, and Payments

**Replace the "Free Access" bullet** so it is scoped to PMQ rather than the platform:

> - **Free Access (PMQ in 5 Days):** Core course content, standard quizzes, and Mock Exam 1 for "PMQ in 5 days" are free. This is a permanent product decision, not a temporary introductory offer.

**Add a new bullet** after the Pro Bundle bullet:

> - **PFQ in 2 Days:** A separate one-time purchase of £5.00, which unlocks the whole course: all 59 lessons, the practice question bank, the full mock exam and the coverage map. There is no free tier for this course, and no part of it is available without purchase.

Rationale: "Future Courses" in §5 already anticipates separately purchasable courses, so this is a specific instance of an existing principle rather than a new commercial model. Making the absence of a free tier explicit is what protects against a reasonable-expectation complaint.

---

## Change 2 — §7 Refunds and Digital Content Waiver

The existing waiver paragraph needs no change. It is product-neutral and already correct.

**Replace the 14-Day Unused Guarantee paragraph** with a version that defines "unused" per product:

> ### Our 14-Day Unused Guarantee
>
> We want you to be happy with your purchase. If you buy a paid product but have not used any of the paid features within 14 days of purchase, email support@learnincurve.com and we will issue a full refund, no questions asked.
>
> "Unused" means:
>
> - **PMQ in 5 Days (Pro or AI Pro):** you have not sent a message to the paid AI tutor, opened a paid extra quiz set, or started Mock Exams 2 to 4.
> - **PFQ in 2 Days:** you have not opened a lesson, answered a practice question, or started the mock exam.
>
> If you have used a paid feature and encounter a genuine technical fault that we cannot promptly fix, we will review refund requests case by case. We reserve the right to decline refunds where we reasonably suspect abuse, for example heavily using the platform to study and then requesting a refund.

**Note for the solicitor and for Sim:** this definition is checkable in the database rather than taken on trust. A PFQ purchase with no rows in `pfq_practice_answers`, no `pfq_attempts` and no lesson checkpoint activity is genuinely unused. That makes the guarantee cheap to honour honestly and hard to abuse, which is why it is worth keeping generous.

---

## Change 3 — the statutory position, unchanged

Nothing in the Unused Guarantee replaces the statutory right. Under the Consumer Contracts Regulations 2013 a UK consumer loses the 14-day cancellation right for digital content **only if** all three of the following happen before supply begins: they expressly consent to immediate supply, they acknowledge losing the right, and they receive confirmation in a durable medium.

The checkout consent block in `src/lib/pfq/checkout.ts` covers the first two. The third depends on the purchase confirmation email actually being sent and containing the acknowledgement — worth verifying against `send-purchase-email.ts` before going live, because a consent captured at checkout and never confirmed in writing leaves the right intact.

If any of the three fails, the buyer keeps the full 14-day unconditional right **even after consuming the course**, whatever §7 says.

---

## What still needs a human

1. **Solicitor review** of the two clause changes above, and specifically of whether the per-product "unused" definition holds up.
2. **Confirm the durable-medium step** — that the purchase email is sent and carries the acknowledgement.
3. **VAT position.** PFQ is £5 to UK consumers. Whether that £5 is VAT-inclusive depends on registration status, which is Sim's to confirm. It affects the price displayed, not just the accounting.
4. **Then, and only then**, flip `PFQ_CHECKOUT_ENABLED` to true.

Update `legal/PRE_LAUNCH_CHECKLIST.md` §4 with a PFQ line once the above is done, so the checklist stays the single gate before any launch decision.
