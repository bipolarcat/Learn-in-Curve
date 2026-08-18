# PFQ in 2 Days — Course Spec

**Decided 13 Aug 2026 with Sim.** Supersedes both the mock-only scope in `cursor-prompt-pfq-mock.md` (shipped, stays) and the three-tier draft of this spec earlier the same day.

Companion docs: `PFQ_RESEARCH.md` (evidence), `PFQ_DAY_PLAN.md` (LO split), `PFQ_TRAP_SCHOOL.md`, `PFQ_LANDING_COPY.md` (needs rewrite — see §6), `pfq-questions.json` (bank), `lessons/` (teaching content).

---

## 1. Product shape

**Pro Bundle £6. No free course slice. AI Pro (£12) is a waitlist card only — not purchasable, not an entitlement.**

Updated 18 Aug 2026: the public marketing ladder matches PMQ's card design (Pro + AI Pro waitlist). Enforcement in `src/lib/pfq/tiers.ts` is unchanged: starter (absence) vs pro. Do not add `ai_pro` there until it is actually granted.

| Included at Pro (£6) |
|---|
| 59 lessons — one per learning outcome, split Day 1 (LO1–5) / Day 2 (LO6–10) |
| ~300 practice questions, tagged per learning outcome |
| 1 full mock exam — 60 questions, 60 minutes, one per outcome + one duplicate |
| Coverage map — "you can currently answer N of 59 outcomes" |
| Trap School — exam format training |

**Still dropped:**

- The free 10-question taster mock / any free course slice
- Sly on PFQ — not on the waitlist card as a named product; AI Pro copy is personalised practice, launching soon

**Consequence:** there is still no free surface on PFQ. "Enrol for Free" on `/pfq` creates an account only. Lessons, practice, mock, coverage map and Trap School stay behind Pro.

### Tier model

Reuse `tiers.ts`'s structure, collapsed to two states:

- **starter** — the absence of an entitlement row. Sees marketing pages only.
- **pro (£6)** — everything in the table above.

Keep starter as an absence rather than a stored value. That property is load-bearing: a failed payment write leaves someone unpaid rather than half-provisioned.

Marketing may show an AI Pro waitlist card. That is not a third enforcement tier.

---

## 2. Question bank — ~300, capacity-led

Counts are **per learning outcome**, not per objective, because capacity is set by how many examinable facts sit inside an outcome. A single-term definition supports about four honest questions; past that you are rewording. A named list supports one question per item.

| Outcome type | Questions | Example |
|---|---|---|
| Single-term definition | 4 | 7.1 define risk |
| Named list / process | 6–7 | 5.8 configuration management activities |
| Discrimination pair | 6 | 7.7 issue vs risk |
| Multi-item outline | up to 7 | 3.1 — seven named roles, one question each |

Resulting distribution:

| LO | Questions | | LO | Questions |
|---|---|---|---|---|
| 1 | 28 | | 6 | 30 |
| 2 | 22 | | 7 | 42 |
| 3 | 7 | | 8 | 30 |
| 4 | 56 | | 9 | 26 |
| 5 | 42 | | 10 | 22 |
| | | | **Total** | **~300** |

**The mock's 60 come out of the 300**, flagged `mock_suitable` — one shared bank, drawn two ways. Same pattern as `questions.mock_suitable` in the PMQ schema.

**Every question carries `learning_outcome` (e.g. `4.10`).** The mock draws one per outcome and the coverage map keys off it. Objective is derived from the outcome, never the reverse.

### Accepted trade-off

Practice questions and the mock share a bank, so someone who works the full 300 will have seen the mock's 60 already. The mock therefore measures recall of the bank rather than blind readiness. Accepted deliberately to keep authoring at 300. If it becomes a complaint, reserve the 60 mock-flagged questions from practice draws — a flag change, not a re-authoring.

---

## 3. The mock

- 60 questions, 60 minutes, pass mark 36, one question per outcome plus one duplicate.
- Duplicate outcome chosen at random per attempt. Not hardcoded to 10.4.
- Unlimited re-sits, but re-sits draw the same 60 (only one question per outcome is mock-flagged). If re-sit realism matters later, flag a second question per outcome as mock-suitable — the bank will already contain them.

## 4. Lessons

59 lessons, one per outcome. House format (sample: `lessons/LO1-lessons.md`, **still awaiting Sim's approval**): ~150–250 words, three beats — what it is, what it's tested against, what catches people out. Plus a one-screen compression table per objective. Nothing included for interest; only what can be examined.

## 5. Legal — created by charging

- **Consumer Contracts Regulations:** 14-day cancellation right on digital content, plus a required, unticked checkbox at checkout consenting to immediate access and acknowledging loss of that right. Without it the right survives the full fortnight even after the course has been fully consumed. **Solicitor review before the first real payment.**
- T&Cs and refund policy live and linked from checkout.
- Stripe hosted checkout. Never handle card data.
- VAT on digital services — Sim to confirm registration status; decides whether £6 is inclusive.
- `PFQ_ATP_DISCLAIMER` and the trademark notice appear on the pricing page as well as the course.
- No pass-rate, guarantee, or implied-accreditation wording anywhere near a price.

## 6. Copy that must be rewritten

`PFQ_LANDING_COPY.md` was written around a free mock — the hero CTA, the "no account, no card" line, and the entire "what you get" section assume a free entry point. All of it needs replacing now the product is paid-only. Claude to rewrite before Cursor builds `/pfq`.

## 7. Decisions and open items

**Settled:**

1. **Question bank: 306 written**, against a ~300 target. Approved and delivered.
2. **Trap School is gated** behind the Pro unlock (decided 13 Aug 2026). It is part of the course, not a free surface.
3. **Lesson format approved** (13 Aug 2026), objective 1 as the pattern. All 10 objectives written to it.
4. **Lesson checkpoints stay off the coverage map.** Checkpoints are self-assessed; the headline number stays measured from practice and mock only. Ticking a box cannot claim an outcome.

**Still open:**

5. **Solicitor review** of the restructured Terms and Schedule, then `PFQ_CHECKOUT_ENABLED` to true. The only thing blocking sale.
6. **Diagrams.** Four places would justify one: life cycle phases, breakdown structures, change control, configuration management. Not decided, not blocking.
7. **Distribution.** With Trap School gated there is now no free surface at all on PFQ. Prior strategy work in this repo concluded the binding constraint on this business is distribution rather than product, and PFQ has one waitlist signup. A paid-only product converts traffic it does not yet have. Flagged deliberately and repeatedly, because it is the risk most likely to be discovered late — Sim's call, made with eyes open.
