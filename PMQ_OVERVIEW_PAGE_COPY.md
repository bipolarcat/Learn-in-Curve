# PMQ in 5 Days, course overview page copy

**Version 2, 19 August 2026.** Replaces the v1 draft.
**Target file:** `src/app/(site)/pmq/page.tsx`
**Register:** Enthusiast, per `VOICE_GUIDE.md` §0. Answer first, no warm-up, no "just", one "however" pivot on the page.
**Style constraint:** no em dashes or en dashes anywhere, in this document or in the copy. Commas, colons, full stops and parentheses only.

## What changed from v1

The page no longer breaks down which plan has how many questions or mock papers. That belongs on `/pricing`. This page sells the features and lets pricing sell the plans. The hero carries no question count at all. XP has been removed everywhere. Streaks stay.

---

## 1. Rules this copy follows

Three constraints, all of them load-bearing.

**The question count is qualified once, then never repeated.** 1,862 is the real ceiling, so "1,800+" is safe because it understates. However, free users get 240, and an unqualified "1,800+" sitting next to an "Enrol for Free" button reads as a free-tier promise. One qualifying sentence on the card solves it without a plan table.

**Sly and the report are on a waitlist tier.** `PMQ_PLANS.ai_pro` has `status: "waitlist"` and no checkout. They can appear as features. They cannot appear as things a visitor can buy today.

**No pass claims, no learner count.** `VOICE_GUIDE.md` §5 rules out pass-rate language, and you have no outcome data. Any learner count would have to come from `attempts` or `auth.users`, not `profiles`.

---

## 2. Hero

**Eyebrow** (unchanged)

> APM Project Management Qualification

**Title** (unchanged)

> PMQ in **5 Days**

**Lead, recommended**

> The PMQ is an application exam, not a memory test. Everything here is built for that: study content for all 24 learning objectives, practice that shows you why you were wrong, and mock papers marked the way the real one is.

**Alternatives**

| | Lead | Tone | Best for |
|---|---|---|---|
| A (recommended) | *The PMQ is an application exam, not a memory test. Everything here is built for that: study content for all 24 learning objectives, practice that shows you why you were wrong, and mock papers marked the way the real one is.* | Confident, opinionated | Visitors who already know they are sitting the PMQ |
| B | *Study content, practice, mock papers and an AI tutor for all 24 APM PMQ learning objectives. Find out what you cannot answer while you still have time to fix it.* | Plain, feature-forward | Cold search and paid traffic |
| C | *Full syllabus coverage for the APM PMQ. Learn it, practise it, sit a mock paper in the real format, and see exactly where the gaps are.* | Sequential, calm | If A tests as too combative |

**Primary CTA:** `Enrol for Free` (unchanged)

**Secondary CTA:** `See What's Included`, replacing "View Plans". "Plans" speaks to someone already sold. This page has not sold them yet.

**Trust strip under the buttons**

> Free forever. No card. All 24 learning objectives.

---

## 3. Positioning block

One heading, one paragraph, no card chrome. This is the part no competitor can copy, because it is an opinion rather than a feature list.

**Heading**

> Most PMQ revision prepares you for the wrong exam

**Body**

> The syllabus reads like a list of things to memorise, so that is usually how people revise it. Learn what goes in a business case, recite it back. However, very little of the paper asks you what something is. It gives you a situation and asks what you would do about it. Every question in here is written that way, because that is the paper you sit.

That "however" is the one on the page. `VOICE_GUIDE.md` §1.1 puts it at roughly one per piece, and this is where it earns its place.

---

## 4. Feature grid, nine cards

Section heading:

> What's in the course

**Row 1**

**Core study content** (`IconCore`)
> Every one of the 24 learning objectives, written from scratch and aimed at the published syllabus.

**1,800+ practice questions** (`IconPractice`)
> Across the full course, each one tagged to the objective it tests. The free plan starts you with a complete set.

**Mock papers in the real format** (`IconMock`)
> 40 questions, 90 marks, sat under exam conditions. Written answers are AI-marked, including on the free paper.

**Row 2**

**Common misconceptions** (`IconMisconceptions`)
> The things most candidates get confidently wrong, corrected before they cost you marks in the exam.

**Memory aids** (`IconMemory`)
> Acronyms and hooks for the lists that keep sliding out of your head the moment you close the book.

**Command words, decoded** (`IconCore`, reused)
> State, Explain, Describe, Compare. Each one tells you how many marks are on offer and what shape the answer needs.

**Row 3**

**Video overview per objective** (`IconVideo`)
> A recap for every objective, for the days when reading is not going to happen.

**Audio overview per objective** (`IconAudio`)
> The same content to listen to, on the commute or the walk.

**Sly, your AI tutor** (`IconSly`)
> Reads how you are getting things wrong and points at the objective that needs the work. Scoped to the APM PMQ, so revision stays on the exam.

**Underneath the grid, one line only**

> The free plan includes the study content, practice questions, a full mock paper, misconceptions and memory aids for all 24 objectives.

That single sentence carries the honesty burden the plan table used to carry. It states what is free without turning the page into a comparison chart.

**Tier chips.** Video, Audio and Sly are not on the free plan. Each needs a small chip: `Pro` on Video and Audio, `Launching soon` on Sly. A chip is not a plan breakdown, and without one the grid promises nine free things and delivers six.

---

## 5. The five days

**Heading**

> What five days actually looks like

**Body, one line**

> 24 learning objectives, each running the same seven stages, with your place saved as you go.

**Stage strip, not prose**

> Orient, Learn, Video, Audio, Apply, Quiz, Checkpoint

**Footnote**

> Five days is the pace, not a deadline. Streaks track daily, and nothing expires.

This is the section aimed at your activation problem. 39% of users are lost between Orient and Learn. Someone who has already seen the pathway before signing up is not meeting it cold on the first screen inside.

---

## 6. Sly

**Heading**

> When you want a tutor rather than another question

**Body**

> Sly reads how you are getting things wrong and points at the objective that needs the work. It stays on the topic in front of you, framed for the APM PMQ rather than general chat, so revision does not wander.

**Status line, required**

> Sly is part of the AI Pro Bundle, which is not on sale yet. You can try it on the homepage without an account.

`FEATURES.md` is explicit that copy allowing a visitor to infer a free account includes the tutor is a misleading omission under the CPRs, and that in practice it generates refunds. Two sentences about Sly with no status line is that omission. If the layout makes this look like fine print, change the layout rather than the sentence.

There is also a commercial reason. Guest Sly has been live since 17 July and has cost you nothing, because nobody has found it. This is the signpost.

---

## 7. Pricing handoff

No plan cards on this page. One band, one line, one button.

**Heading**

> Start free. Upgrade when you want more

**Body**

> The free plan is not a trial and does not expire. Paid bundles are a single payment with no subscription and nothing that renews.

**CTA:** `See Plans and Pricing`, linking to `PMQ_PRICING_HREF`.

Being straight about money is a documented part of your voice (`VOICE_GUIDE.md` §1.6), and "nothing renews" removes the main objection to a small one-off purchase.

---

## 8. FAQ

Keep the five existing questions in `PmqFaqSection` exactly as they are. They cover the qualification and they work for search. Add three product questions above them.

**Is it actually free?**
> Yes. The free plan does not expire and does not ask for a card. You get study content for all 24 learning objectives, a full set of practice questions, a complete 40-question mock paper, misconceptions and memory aids.

**Is this official APM material?**
> No. Learn in Curve is not affiliated with or endorsed by APM. Everything here is written from scratch and aimed at their published syllabus.

**How long do I really need?**
> Five days is the pace this is built around, and it assumes you are already working in a project environment. Starting from further back is fine. Nothing expires and your progress saves.

I have deliberately dropped the "what does Pro add" question. That is a pricing page question and putting it here rebuilds the comparison table you asked me to remove.

---

## 9. Closing

**Heading**

> Find out what you cannot answer yet

**CTAs:** `Enrol for Free` and `See Plans and Pricing`

**Legal:** `APM_DISCLAIMER`, unchanged.

---

## 10. What the page still lacks

Three gaps the copy cannot close.

**No social proof.** Not a testimonial, a count, or a review anywhere. This is the largest single difference between this page and one that converts. The cheapest version is a real count from `attempts` or `auth.users` plus two sentences from existing users.

**No screenshots.** `QuizDemo`, `HeroPmqMacDemo` and `SlyMacConsole` already exist. A visitor currently cannot see the thing they are being asked to enrol in. Dropping one of them into section 4 or 5 would do more than any sentence in this document.

**No named author.** Your own positioning line is "just a fellow project manager who's been exploring AI tools and wants to help other professionals out there". That is the most trust-building sentence in your entire corpus and it appears nowhere on this page.

Those three are worth more than this rewrite. The copy is the prerequisite, not the win.
