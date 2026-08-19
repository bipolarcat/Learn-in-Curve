# PMQ in 5 Days — course overview page copy

**Written:** 18 August 2026
**Target file:** `src/app/(site)/pmq/page.tsx`
**Register:** Enthusiast (per `VOICE_GUIDE.md` §0) — answer first, real numbers, one "however" pivot, "essentially" to land it. No throat-clearing, no passive voice, no "just".
**Numbers verified against:** `src/lib/pmq/tiers.ts` (entitlement) and `src/lib/pmq/plans.ts` (advertised claims), 18 Aug 2026.

---

## 0. Read this before you approve any of it

### The claim table — every number on this page, and what backs it

`plans.ts` says it plainly: *"An unprovable count is a misleading commercial practice."* So here is every figure, with its source. If a figure isn't in this table, it doesn't go on the page.

| Claim | Real value | Source | Tier | Safe to headline? |
|---|---|---|---|---|
| Practice questions, free | 240 | `PMQ_PLANS.starter` | Starter | ✅ Yes |
| Practice questions, Pro | 1,200 (240 + 960) | `PMQ_PLANS.pro` | Pro — **buyable** | ✅ Yes |
| Practice questions, ceiling | 1,862 → say **"nearly 1,900"** | `plans.ts` comment, DB-verified 2026-07-30 | AI Pro — **waitlist** | ⚠️ Only with the tier named |
| Mock papers | 1 free / 3 Pro / 4 AI Pro | `mockExamCountForTier()` | all | ✅ Yes |
| Mock paper format | 40 questions, 90 marks | `FEATURES.md`, confirmed | all | ✅ Yes |
| Learning objectives | 24 | `PMQ_SECTION_COUNT` | all | ✅ Yes |
| Stages per LO | 7 (Orient → Checkpoint) | `LO_STAGE_ORDER` | all | ✅ Yes |
| Total progress units | 168 | `PMQ_TOTAL_PROGRESS_UNITS` | all | ✅ Yes |
| XP per answer | 10 | `FEATURES.md` | all | ✅ Yes |
| Pro price | **do not hardcode** | `SLY_UNLOCK_PRICE_CENTS` | Pro | ✅ via constant only |
| Learner count | **unverified** | — | — | ❌ Not until counted |

### Three things I've deliberately not done

1. **No pass-rate or "pass first time" claim anywhere.** `VOICE_GUIDE.md` §5 forbids it and you have no outcome data. This is the single easiest way to get an ASA complaint upheld against an education provider.
2. **No learner count.** `project_profiles_row_gap` says counts must come from `attempts`/`auth.users`, never `profiles`. Until you run that query, any number is a guess. Social proof is the biggest thing this page is missing — see §10 — but a wrong number is worse than none.
3. **"Nearly 1,900" never appears without its tier attached.** You chose the understated figure, which is right. However, 1,862 is the **AI Pro** ceiling, and AI Pro is `status: "waitlist"` — no checkout exists. `tiers.ts` warns in its own comments that advertising an unbuyable thing "reads as a broken feature rather than a future one." So every time the big number appears, "AI Pro Bundle — launching soon" appears with it. Non-negotiable if you want this page to stay clean.

---

## 1. Hero

**Eyebrow** (unchanged)
> APM Project Management Qualification

**Title** (unchanged)
> PMQ in **5 Days**

**Lead — recommended**
> The PMQ paper is 40 questions and 90 marks, and most of them hand you a scenario rather than ask for a definition. Everything here is built for that exam — 240 practice questions and a full mock paper, free.

**Alternatives**

| | Lead | Tone | Best for |
|---|---|---|---|
| **A (recommended)** | *The PMQ paper is 40 questions and 90 marks, and most of them hand you a scenario rather than ask for a definition. Everything here is built for that exam — 240 practice questions and a full mock paper, free.* | Confident, specific | Visitors who already know they're sitting the PMQ |
| B | *Find out what you cannot answer while you can still do something about it. 240 practice questions and a full 40-question mock, mapped to all 24 learning objectives. Free, no card.* | Blunt, benefit-led | Paid traffic and cold search |
| C | *Free practice questions, a full mock paper, and core content for all 24 APM PMQ learning objectives. Upgrade only when you want more reps.* | Plain, low-friction | If A/B test shows the scenario framing loses people |

**Primary CTA:** `Enrol for free` (unchanged — verb-first, matches the outcome)
**Secondary CTA:** `See what's included` — *changed from "View Plans"*. "Plans" is a pricing word aimed at someone already sold; this page hasn't sold them yet.

**New: trust strip under the CTAs** (small, one line)
> Free forever · No card · 24 learning objectives

*Why:* removes the two objections that stop a click, at the moment of the click.

---

## 2. The positioning block — the most important new section

This is what makes the page yours rather than any revision site's. One heading, one short paragraph, nothing else.

**Heading**
> Most PMQ revision prepares you for the wrong exam

**Body**
> The syllabus reads like a list of things to memorise, so that's how it usually gets revised — learn what goes in a business case, recite it back. However, almost no question on the paper asks you what something is. It gives you a situation and asks what you would do about it. Every question in here is written that way, because that's the paper you sit.

*One "however" pivot — the signature move from `VOICE_GUIDE.md` §1.1. One per page, and this is where it earns its place.*

---

## 3. What you actually get — three cards (keep the existing grid)

Same `.features` grid, same three icons. Copy replaced.

**Card 1** — `IconPractice`
> ### 240 practice questions, free
> Every one mapped to a learning objective. Answer wrong and you see why immediately, not at the end of a set.

**Card 2** — `IconMock`
> ### A full mock paper, free
> 40 questions, 90 marks, sat under exam conditions. Written answers are AI-marked, so you get a score and feedback rather than a self-assessment sheet.

**Card 3** — `IconCore`
> ### All 24 learning objectives
> Full syllabus coverage. Command words decoded, common misconceptions flagged, and memory aids for the parts that keep sliding out of your head.

*Why these beat the current cards:* the current set describes the free tier while gesturing at Pro in every body line ("Pro adds more…", "Upgrade for extra mocks…"). Three upsells before a visitor knows what the product is. These state what's free, confidently, and let §7 handle money.

---

## 4. How the five days work — new section

**Heading**
> What five days actually looks like

**Body** (one line only)
> 24 learning objectives, each running the same seven stages. 168 steps, one progress bar, and it saves where you left off.

**Then a horizontal stage strip — not prose:**
`Orient → Learn → Video → Audio → Apply → Quiz → Checkpoint`

**Footnote under the strip**
> Five days is the pace, not a deadline. Streaks track daily, and every answer is worth 10 XP.

*Why:* this is the section that fixes your orient→learn leak. 39% of people drop between those two stages because they open the course with no idea what shape it is. Showing the pathway before signup means the first screen inside is one they've already seen.

**Note on Video/Audio:** those two stages are Pro-gated (`canAccessMedia`). The strip shows the full pathway, so add a small marker on those two — `Video` and `Audio` get a subtle "Pro" chip. Showing a seven-stage pathway and delivering five to a free user is exactly the mismatch `pro-included.ts` was written to prevent.

---

## 5. The mock exams — new section

**Heading**
> Four papers. The first one's free.

**Body**
> Each paper is 40 questions and 90 marks in the real format — multiple response, select from a list, short response, and long response — with the same optional break the real exam gives you. Every written answer is AI-marked, including on the free paper.

**Three small stats beneath** (numbers, not sentences)
> **40** questions · **90** marks · **2.5** hours

*Why:* the free AI-marked written answer is your strongest single differentiator and it's currently invisible on this page. Most free PMQ practice is auto-marked multiple choice, because marking written answers costs money. You eat that cost on the free tier. Say so.

---

## 6. Sly — new section, carefully worded

**Heading**
> Sly, when you want a tutor rather than a question

**Body**
> Sly reads how you're getting things wrong and points at the topic that needs the work, framed for the APM PMQ rather than general chat. It stays on the objective in front of you, so revision doesn't wander.

**Status line — required, not optional**
> Sly is part of the AI Pro Bundle, which isn't on sale yet. You can try it on the homepage without an account.

*Why the status line is mandatory:* `FEATURES.md` is explicit — *"Marketing copy must not let a visitor infer that a free account includes the tutor — that would be a misleading omission under the CPRs, and in practice it generates refunds."* Two sentences of Sly with no status line is that exact omission.

*Commercial upside:* per `project_guest_sly_live_but_undiscovered`, the guest taster has been live since 17 July and cost you nothing because nobody found it. This section is the signpost.

---

## 7. The ladder

**Heading**
> Start free. Upgrade if you want more reps.

Render `PmqPlanCards` — it already reads `PMQ_PLANS`, so the numbers stay honest automatically. Do not retype any figure here.

**Required additions:**
- The AI Pro card must carry a visible **"Launching soon"** badge (it already has `status: "waitlist"` — make sure the badge renders on this page, not only on `/pricing`).
- One line under the cards:
> Pro is a one-off payment. There's no subscription and nothing renews.

*Why:* radical transparency about money is a documented part of your voice (`VOICE_GUIDE.md` §1.6) and "one-off, nothing renews" removes the biggest objection to a small purchase.

---

## 8. FAQ

Keep `PmqFaqSection` exactly as it is — those five are about the qualification and they're good for search. Add four **product** questions above them.

**Is it actually free?**
> Yes. Starter is free forever and doesn't ask for a card. You get 240 practice questions, a full 40-question mock paper, and core study content for all 24 learning objectives.

**What does the Pro Bundle add?**
> 960 more practice questions, two more mock papers, and a video and audio overview for every learning objective. One payment, no subscription.

**Is this official APM material?**
> No. Learn in Curve isn't affiliated with or endorsed by APM. The revision material is written from scratch, aimed at their published syllabus.

**How long do I really need?**
> Five days is the pace this is built around, and it assumes you're already working in a project environment. If you're starting from further back, the pathway doesn't expire and your progress saves.

*Note:* that last answer deliberately avoids any claim about outcomes. If you want it stronger, it has to come from learner data you don't have yet.

---

## 9. Final CTA + legal

**Heading**
> Find out what you can't answer yet

**CTAs:** `Enrol for free` · `See what's included`

**Legal:** keep `APM_DISCLAIMER` exactly as-is.

---

## 10. What this page still doesn't have, and what it costs you

Being straight about the gap rather than pretending the copy fixes everything.

1. **No social proof.** Not one testimonial, learner count, or review. It's the single biggest thing separating this from a page that converts. Cheapest fix: pull a real count off `attempts`/`auth.users`, and email your existing users for two sentences each.
2. **No screenshots.** You have `HeroPmqMacDemo`, `QuizDemo` and `SlyMacConsole` already built. A visitor can't see the product they're being asked to enrol in. Reusing one of those in §3 or §4 would do more than any sentence in this doc.
3. **No named author.** Your positioning is *"just a fellow project manager who's been exploring AI tools"* — that's the most trust-building sentence in your entire corpus and it appears nowhere on this page. A one-line byline with a face would carry it.

Those three are worth more than the copy rewrite. The copy is the prerequisite, not the win.
