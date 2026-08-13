# Cursor prompt — product registry, single source of truth for courses

**Written 13 Aug 2026.** Small, self-contained. Can be done between larger tasks.

## Why

`legal/TERMS_OF_SERVICE.md` has been restructured so that the body states rules and a Schedule at the end lists the products. Adding a course is now an append to that Schedule rather than a re-drafting of clauses.

The code needs the matching half. Right now, facts about a course are spread across several files: price constants in one place, entitlement logic in another, pricing page copy in a third. Three courses in, they will disagree, and one of the things they will disagree about is a legal commitment.

This repo already solved this twice, and both are worth reading before starting:

- `src/lib/notify/lists.ts` — one registry, every list defined in it, with the reasoning written into the file
- `src/lib/pmq/tiers.ts` — one function per gate, no re-deriving entitlement at the call site

Do the same for courses.

## Task 1 — the registry

Create `src/lib/courses/registry.ts`. One entry per course, holding at minimum:

- `slug` and display name
- `priceCents`, and the Stripe price identifier
- whether the course has any free features, and which
- the list of paid features
- `hasUsedPaidFeature(userId)` — the predicate behind the refund guarantee

Type it so a new course cannot be added with a field missing.

Document at the top of the file, in the same spirit as `lists.ts`, that the Schedule in the Terms of Service is the customer-facing statement of the same facts, and that the two must be changed together. Anyone editing one needs to know the other exists.

## Task 2 — make the registry authoritative

Refactor existing course-specific constants to read from the registry rather than declaring their own values. Prices in particular must have exactly one definition. Do not leave a second copy behind "for convenience".

Do not change behaviour in this task. It is a consolidation, and the tests should pass unchanged.

## Task 3 — the refund predicate

`hasUsedPaidFeature` is the thing that makes the 14-Day Unused Guarantee checkable rather than a matter of trust. It must return true if the user has touched any paid feature of that course.

For the PFQ course that means any of: a lesson opened, a practice question answered, or a mock exam started. For the PMQ course, the equivalent per its own paid features.

The guarantee is deliberately generous, so the predicate should err towards reporting use rather than missing it. A false "unused" costs a refund that was not owed; a false "used" denies a refund that was, which is worse for the customer and for us.

## Task 4 — a consistency test

A test that fails if the registry and the Terms Schedule fall out of step. At minimum, assert that every course in the registry appears in the Schedule and vice versa, by slug or display name.

This will feel like overkill for two courses. It is insurance against the fourth, when nobody remembers that a legal document has to change too.

## Do not

- Do not put prices in the Terms of Service. They live on the course page and at checkout, and duplicating them creates a document that can contradict the price a customer actually paid.
- Do not change any pricing, entitlement rule or refund wording in this task. This is consolidation only. If you find an inconsistency between two existing definitions, report it rather than silently picking one.

## Report back

Append to `BUSINESS_STATE.md`: what was consolidated, any inconsistency you found between existing definitions, and whether the consistency test is passing. Leave Linear at In Review.
