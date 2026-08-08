# Learn in Curve — Acquisition Strategy

**Written:** 2026-08-08
**Status:** Proposal. Not yet executed, not yet in Linear.
**Scope:** How to get organic (and selectively paid) sign-ups for learnincurve.com. Excludes pricing, retention, and monetisation.

---

## 1. The diagnosis, from actual data

Everything below is measured, not estimated. Where a number is soft, it says so.

### Traffic (PostHog, project 219047)

PostHog has only been collecting since **6 Aug 2026** — three days of data. Full history:

| Referrer | Host | Pageviews | People |
|---|---|---|---|
| direct | www.learnincurve.com | 74 | 7 |
| direct | localhost:3000 | 56 | 2 |
| www.linkedin.com | www.learnincurve.com | 30 | 8 |
| direct | 192.168.1.147:3000 | 18 | 1 |
| com.reddit.frontpage | www.learnincurve.com | 5 | 1 |
| com.linkedin.android | www.learnincurve.com | 4 | 3 |
| www.learnincurve.com | www.learnincurve.com | 3 | 1 |

Stripping local dev, the live site saw **~116 pageviews from ~16 distinct humans in three days.**

Two things matter more than the smallness of that number:

1. **Zero visits from Google, Bing, or any AI assistant.** Not "few" — zero. There is no search acquisition channel at all right now.
2. **LinkedIn is currently the only real referrer** (11 of 16 people), and it produced almost no sign-ups. That is after paid boost.

*Caveat:* PostHog is consent-gated (nothing fires before the cookie banner Accept), so these are floor numbers, not totals. Anyone who declines cookies is invisible. Fixing measurement is a prerequisite for everything in §5.

### Sign-ups (Supabase)

`learn-in-curve` project, `auth.users`, all time:

| Week beginning | Sign-ups |
|---|---|
| 2026-06-29 | 1 |
| 2026-07-27 | 1 |
| 2026-08-03 | 15 |

**17 users total, ever.** The `PMQ in 5 days` Supabase project has zero auth users.

### Email list (Resend)

**Zero contacts.** The "blast out to your 190+ users" line in *Gemini's Marketing Blueprint (5th Aug)* does not correspond to anything that exists in Resend, Supabase, or PostHog. Treat that plan's audience assumption as unverified before building automation on top of it.

### What the data actually says

The two days of LinkedIn boost worked *as advertised* — it bought reach. Reach converted to roughly eleven humans and near-zero sign-ups. That is not a creative problem or a copy problem. **It is a channel-intent problem.**

LinkedIn shows your post to people scrolling a professional feed. Almost none of them woke up that morning intending to buy PMQ revision. Exam prep is one of the most *search-driven, high-intent* categories that exists — people go looking for it, urgently, on a deadline. You are broadcasting into a channel where the intent isn't, and absent from the channel where it is.

That is the whole problem in one sentence, and it is fixable.

---

## 2. Why LinkedIn was never going to work the way you were using it

Not opinion — structural:

- Company page organic reach fell **60–66% between 2024 and 2026** ([Socialinsider](https://www.socialinsider.io/social-media-benchmarks/linkedin), [tryordinal](https://www.tryordinal.com/blog/the-declining-reach-of-linkedin-company-pages)).
- Company pages now reach roughly **2–6% of their own followers** organically, and company-page posts make up about **2% of what appears in feeds**.
- **Employee/personal reshares travel ~561% further** than the same content from a company page.

So: the Learn in Curve *company page* is close to the worst possible place to spend effort. Your *personal* profile is the only LinkedIn asset with real distribution — which matches what you observed (the personal post got reach, the company page didn't).

LinkedIn groups aren't rescuing this either. Moderated groups reject promotional posts by design, and even when accepted, group posts don't get feed distribution.

**Verdict:** demote LinkedIn from "growth channel" to "credibility surface." Keep posting from your personal profile because it builds founder reputation and it's free. Stop paying to boost. Stop treating the company page as an acquisition bet.

---

## 3. The strategic bet: own the moment of intent, in both search engines

There are exactly two places a UK project professional decides they need PMQ help:

1. They type "APM PMQ practice questions" into Google.
2. They ask ChatGPT "how do I pass the APM PMQ?"

You are invisible in both. That's the gap, and it's unusually cheap to close for two reasons.

### Reason 1 — the incumbents in search are junk

The first page for "APM PMQ practice questions / free mock exam" is dominated by exam-dump content farms: pass4success, marks4sure, certkillers, p2pexams, certshero, certempire, plus a Scribd PDF. There is **no credible, well-built PMQ study product ranking for its own core query.**

This matters twice over. Those sites are beatable on quality signals — and they are structurally *un-citable* by an AI assistant, because dump sites carry weak trust signals and legally dubious content. An LLM asked "best way to revise for the PMQ" has almost nothing good to point at. That vacuum is your opening.

### Reason 2 — AI referral traffic is the highest-converting traffic anyone currently measures

- ChatGPT accounts for **~92% of trackable LLM referral traffic**, up **12.8x over 19 months** ([Search Engine Land, 6.77M sessions analysed](https://searchengineland.com/chatgpt-ai-referral-traffic-sessions-data-481630)).
- AI referral traffic grew **~527% year-over-year** and is projected at **20–28% of total referral traffic by end of 2026** ([thestacc](https://thestacc.com/blog/ai-search-referral-traffic-stats/)).
- AI-referred visitors convert at **4.4x–23x** organic search visitors. Ahrefs' own data: **0.5% of sessions produced 12.1% of sign-ups**. Webflow reports **8% of sign-ups from LLM traffic at 6x Google's conversion rate** ([AirOps](https://www.airops.com/blog/ai-referral-traffic-conversion-rates), [Pixis](https://pixis.ai/blog/why-ai-search-traffic-converts-at-4-5x-what-the-data-actually-shows/)).

The mechanism is obvious once stated: someone who arrives from ChatGPT has already had the product explained and pre-qualified by the assistant. They arrive at the bottom of the funnel, not the top.

**This — Answer Engine Optimisation — is the "modern 2026 SaaS outreach" answer you asked for.** It is not a trend piece; it's a measurable traffic source with a documented conversion premium, and almost no UK certification-prep player is optimising for it yet.

*Evidence caveat, stated plainly:* the AEO conversion multiples come from vendor-published analyses (AirOps, Pixis, Semrush/Ahrefs/Seer syntheses). Directionally consistent across independent sources, but not peer-reviewed. Treat "AI traffic converts substantially better" as well-supported, and any specific multiple (4x vs 23x) as unreliable.

---

## 4. The plan, in priority order

Effort allocation, deliberately lopsided: **~70% into Tier 1.** Doing all of Tier 1 badly beats doing all three tiers thinly.

### Tier 1 — build the intent-capture engine (weeks 1–8)

**1a. A content hub at `/learn`, not a blog.**

Your instinct about articles is right; the framing is wrong. A "blog" implies chronological posts you must keep feeding. What you want is a **permanent, structured answer library** — one page per question a PMQ candidate actually types.

Three page types:

- **Syllabus pages** — one per PMQ learning objective. "APM PMQ LO 2.3: Business Case — explained, with exam-style questions."
- **FAQ pages** — one per real question. "How hard is the APM PMQ?" "How many marks to pass the PMQ?" "PMQ vs PFQ — which should I take?" "How long does PMQ revision actually take?"
- **Pain-point pages** — from your existing *20 Pain Points* research. Cluster 3 (AI & tech in PM) and pain points 14, 15, 20 are your genuine white space; you flagged that yourself and you're right.

**The leverage nobody else has:** you already own 2,022 questions, 47 illustrations, and full syllabus coverage. This is a *repurposing* job, not a writing-from-scratch job. That is why this plan is realistic for one person.

**1b. Free full-length mock exam, results gated.**

40 questions / 90 marks, matching the real format, free and open — no sign-up wall to *start*. The wall goes at the **results page**: score, breakdown by learning objective, and what to revise next, in exchange for an email.

Why gate at the end and not the start: you capture the email at the moment of peak motivation (they just found out they'd fail), not at the moment of peak scepticism (before they've seen anything of value). This is the single highest-converting mechanic in exam prep, and it's also the natural landing page for every piece of Tier 1a traffic.

**1c. Make the site machine-readable.**

- `FAQPage`, `Course`, `Article`, and `Organization` schema on every hub page.
- Answer-first structure: the direct answer in the first 40 words, then the detail. AI assistants extract the top of the page.
- Visible author identity — you, named, with credentials. E-E-A-T signals drive citation.
- An `llms.txt` at the root describing what the site is and what it covers.
- **Freshness discipline:** 83% of AI citations come from pages updated in the last 12 months, 60%+ within six ([CXL](https://cxl.com/blog/answer-engine-optimization-aeo-the-comprehensive-guide/)). Date-stamp pages and genuinely revise them.

**1d. Fix measurement first.** None of this is manageable if you can't see it. Before publishing: UTM discipline on every link, a `signup_completed` event in PostHog, and a referrer breakdown that isolates `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai`. Right now you cannot tell a working channel from a broken one, and that's why this doc had to start with three days of data.

### Tier 2 — seed the sources AI assistants and humans both read (weeks 3–12)

**2a. Reddit, as a participant.** r/projectmanagement has ~188k members. Answer PMQ questions properly — genuinely useful, no link, for weeks. Reddit is also disproportionately weighted in LLM training and citation, so a helpful answer thread does double duty. Note you already have one real Reddit referral in the PostHog data with no deliberate effort.

**2b. LinkedIn, personal profile only.** Build-in-public and PM/AI pain-point posts, 2–3 a week, from your account. Free, reputational, occasionally a spike. Not the growth engine.

**2c. The company page and Instagram** — keep for brand consistency (the Gamma assets are good and on-brand), post the same content, expect no acquisition. Zero incremental effort, don't measure them for sign-ups.

### Tier 3 — only once Tier 1 exists (week 8+)

**3a. Newsletter — own the list, don't rent it.** Resend is already wired in. Send to your own domain list. **Do not start on Substack.** Substack's discovery network is built for culture, politics, and tech commentary; it delivers close to nothing for UK project-management certification, so you'd be building on rented land in a niche the platform doesn't serve. If you want reach *and* ownership, run a **LinkedIn Newsletter** for distribution (LinkedIn notifies followers on publish, which is real, free reach) and mirror it to your own Resend list. The Resend list is the asset. The LinkedIn one is the megaphone.

**3b. Paid: Google Search, not LinkedIn boost.** If you spend money, spend it on exact-match intent terms ("apm pmq practice questions", "apm pmq mock exam", "how to pass apm pmq"). £10–20/day for 30 days as a demand test, not a growth plan. Google search ads intercept intent; LinkedIn boost interrupts attention. You already ran the interruption experiment and have the result.

---

## 5. On "PFQ in 2 days"

**Don't build it as a second paid course yet.** You have 17 sign-ups. That's not a product problem — you have a working product — it's a distribution problem, and a second product doubles your content maintenance surface while solving none of it. The classic first-time-founder failure mode is building a second thing because the first thing isn't selling.

**But there's a smarter version of the same instinct.** PFQ is the easier, higher-volume entry qualification. So build **a free PFQ practice test as a lead magnet feeding PMQ**, not a paid PFQ course. You capture people earlier in their career, at higher search volume, at zero pricing risk, and you own the relationship by the time they need PMQ 12 months later. Same content investment, no new SKU, no new support burden.

Revisit paid PFQ when PMQ sign-ups are compounding month-over-month from a channel you can name.

---

## 6. What to stop doing

- **Paid LinkedIn boosts.** Measured, didn't convert.
- **LinkedIn group posting.** Structurally throttled.
- **Treating the company page as acquisition.** ~2–6% follower reach.
- **Manual DM outreach** — already your position, and it's the right one. Also worth knowing: unsolicited B2C-style marketing DMs sit awkwardly under UK PECR. Your instinct is both strategically and legally sound.

---

## 7. How you'll know it's working (90 days)

Leading indicators, in the order they should move:

| Week | Signal | Target |
|---|---|---|
| 2 | Pages indexed by Google | 20+ |
| 4 | First non-zero organic search session | >0 |
| 6 | First AI-assistant referral (chatgpt.com etc.) | >0 |
| 8 | Free mock exam completions / week | 25 |
| 8 | Mock exam → email capture rate | >35% |
| 12 | Organic + AI sessions / week | 250 |
| 12 | Sign-ups / week from non-LinkedIn sources | 20 |

Track the *ratio* of AI-referred sessions to sign-ups separately from organic. If the published multiples hold even weakly, that ratio is your most important number and the thing that tells you to double down.

A self-test to run monthly: ask ChatGPT, Perplexity, and Gemini "how should I revise for the APM PMQ?" and see whether you're mentioned. Right now you won't be. That transition is the whole strategy in one observable event.

---

## 8. Legal and compliance flags

*Informal, educational guidance — not legal advice, and not a substitute for a solicitor. Items marked **[SOLICITOR]** should be reviewed before you act on them.*

**8.1 — Do not use exam dumps. Ever.** The sites currently ranking for your keywords are republishing what appear to be real exam questions. That is almost certainly copyright infringement of APM's material, and in some jurisdictions a breach of candidate agreements. Your questions must be original, written from the published syllabus. *Why it matters beyond ethics:* the moment you rank, you become visible to APM. Being the clean operator in a dirty SERP is a competitive advantage — right up until you aren't.

**8.2 — Trademark: "APM" and "PMQ".** You may use them *nominatively* — to accurately describe what your product prepares people for. You may **not** imply endorsement, affiliation, or accreditation. Practically: a clear, persistent disclaimer ("Learn in Curve is not affiliated with, endorsed by, or accredited by the Association for Project Management") in the footer and on every syllabus page. Nominative use is a real defence; implied endorsement is not. **[SOLICITOR]** before any heavy "APM PMQ"-branded advertising spend.

**8.3 — Newsletter consent (UK GDPR + PECR).** This bites directly on the §4.1b mechanic. A gated results page that *automatically* subscribes someone to marketing email is non-compliant. You need:
- A **separate, unticked** marketing-consent checkbox, distinct from account creation.
- A privacy notice at the point of collection stating who you are, what you'll send, and the lawful basis.
- A working unsubscribe in every single email.
- A record of when and how consent was given.

Legitimate interest can sometimes cover B2B email, but for individuals studying for their own certification you should assume **consent** is the required basis and design for it. Getting this right at build time costs an hour; retrofitting it costs your whole list.

**8.4 — Advertising claims (CAP Code / ASA).** "Pass in 5 days" and anything resembling a pass-rate claim must be substantiable *before* publication. You currently have no outcome data at all. Until you do, frame claims as structure and method ("a 5-day revision plan covering the full syllabus"), never as an outcome ("pass in 5 days"). The ASA is complaint-driven and competitors complain. Also relevant: the AI tutor. Do not claim it is "trained by APM," "examiner-approved," or similar.

**8.5 — Reddit disclosure.** If you post as the founder, say so. Undisclosed promotion breaches most subreddit rules and, where it functions as advertising, the CAP Code's rules on identifiability of marketing communications.

---

## 9. Honest limits of this analysis

- **Three days of PostHog data**, consent-gated. Every traffic figure is a floor, and the sample is far too small to draw conclusions about anything except the *absence* of search traffic — which is the one conclusion it does support, robustly.
- **No keyword volume data.** Ahrefs is in your tool stack but not authorised in this session. The claim "no credible incumbent ranks for PMQ terms" comes from reading the live SERP, which is solid. The claim "there is meaningful search volume" is inferred from the category, not measured. **Get actual volumes for `apm pmq` head terms before committing to the full page build** — that's the one number that could change the plan.
- **AEO conversion multiples come from vendor blogs.** Consistent across sources, but directional.
- Whether learnincurve.com is currently indexed by Google at all was **not** conclusively verified. Check Search Console directly — if the site isn't indexed, that's the first fix and it's a one-day job.

---

## 10. First five things to do

1. Check Google Search Console: is learnincurve.com indexed? Fix if not.
2. Pull real search volumes for `apm pmq` head terms (Ahrefs).
3. Ship `signup_completed` + UTM discipline + AI-referrer breakdown in PostHog.
4. Build the free full-length mock exam with the gated results page (with the §8.3 consent checkbox built in from the start).
5. Publish the first 10 `/learn` pages from existing question-bank content.

Then log all five in Linear under a `Growth` label with the same Status / Decided / Next-action structure as everything else.
