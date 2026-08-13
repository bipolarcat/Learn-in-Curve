# Learn in Curve — Acquisition Plan (13 Aug 2026)

**Status:** Proposal. Supersedes the 8 Aug acquisition doc in Notion on diagnosis; keeps its legal section.
**Constraints given by Sim, 13 Aug:** £0/month budget, 20+ hrs/week of his own time, Reddit appealed with no response, agentic layer to run on n8n *and* Claude.
**Scope:** getting more humans to the site and into accounts. Not pricing, not retention, not product.

---

## 1. The diagnosis has changed

Every number below was pulled live today, not estimated.

### You do not have a sign-up problem

| Measure | Value | Source |
|---|---|---|
| Accounts, all time | 24 | `auth.users`, learn-in-curve Supabase |
| Distinct humans on the live site, last 30 days | ~30 | PostHog, stripping localhost and LAN dev |
| Started at least one section | 16 of 24 (67%) | `section_progress` |
| Attempted a quiz | 11 of 24 (46%) | `attempts` |
| Sat a mock exam | 4 of 24 (17%) | `exam_sessions` |
| Newsletter subscribers | 14 | `newsletter_subscribers` |
| Waitlist | 15 | `waitlist_signups` |

Roughly 30 people reached the site in a month and 22 of them created an account. Whatever the visitor-to-signup rate really is once you account for consent-gated analytics, it is not the bottleneck. Two thirds of everyone who signs up starts studying. The machine works.

**The problem is that nobody is being poured into it.** Sign-ups per day since 4 Aug: 8, 2, 0, 3, 3, 1, 3, 1, 1. That is not a decaying campaign. That is the residue of one LinkedIn post.

### The actual bottleneck, named precisely

Referrers, last 30 days, live host only:

| Referrer | Pageviews | People |
|---|---|---|
| direct | 141 | 15 |
| linkedin.com | 50 | 12 |
| learnincurve.com (internal) | 16 | 2 |
| com.reddit.frontpage | 8 | 1 |
| com.linkedin.android | 5 | 4 |
| Gmail app | 2 | 1 |

Google: zero. Bing: zero. ChatGPT, Perplexity, Gemini, Claude: zero. `site:learnincurve.com` returns nothing. The SERP for "APM PMQ practice questions" is still eight exam-dump farms and a Scribd PDF.

`robots.txt` is clean, the sitemap resolves, `/library` already has eleven guide pages live, `/free-mock-exam` already exists with the email gate on the results. So the content isn't the gap and the crawl isn't blocked.

**However, the thing nobody has written down yet is this: almost nothing on the internet has ever mentioned Learn in Curve.** `llms.txt` is empty. There are no inbound links from any credible domain. LinkedIn links are `nofollow`, so twelve months of posting there would still leave Google with no reason to believe the site exists. Reddit was the one channel that produced real mentions and real referrals — 92 sign-ups in three weeks on the previous version — and that channel is now closed.

That is why growth stalled. Not creative, not copy, not product. The single mechanism that was manufacturing mentions was removed, and nothing replaced it.

### Why "mentions" is the right word, not "backlinks"

An Ahrefs study across 75,000 brands (Aug 2025, extended to ChatGPT and AI Mode in Dec 2025) found **branded web mentions correlate with AI visibility at 0.664 — roughly three times stronger than backlinks at 0.218.** The top three signals are all off-site: web mentions (0.664), brand anchors (0.527), brand search volume (0.392). In the December follow-up, **YouTube mentions were the single strongest individual signal at ~0.737.** Ninety-five per cent of ChatGPT citations come from content published in the last ten months.

So the asset to build is not a link portfolio. It is *the number of places on the internet where someone who isn't you has written the words "Learn in Curve."*

Right now that number is approximately zero, and every option below is judged first on how many of those it manufactures per week.

*Caveat, stated plainly: the Ahrefs figures are vendor-published and correlational, not causal. Treat "off-site mentions matter more than your own pages" as well-supported and directional, and any specific coefficient as unreliable.*

### One correction to an existing doc

`Brand Strategy` in Notion says APM exam windows cluster in spring and autumn, and that autumn is the target. The PMQ is sat on demand — remote-invigilated through Surpass with ProctorExam invigilation, booked when the candidate is ready. There is no window to race. Demand is continuous, which is worse news short term (no seasonal spike is coming to rescue you) and better news long term (an indexed page earns forever, not for six weeks).

---

## 2. Four options

All four are £0 in cash. They differ in what they spend your 20 hours on. Effort ratings assume you personally do the work.

---

### Option A — Mark My Answer

**The idea.** A free tool, no login: paste your long-response answer to a PMQ-style question, get it marked. A score out of the marks available, which command verb the question used, whether you actually did what that verb demanded, which points you missed, and one rewritten sentence showing the difference.

**Why this and not another quiz.** Your own listening report ranks the pain in order, and the top five are all the same pain: candidates underestimate exam technique, ignore the command verb, neglect long-response questions that carry 50 of the 90 marks, answer generically instead of to the scenario, and list steps when the verb said explain. Training ByteSize calls the command verb "the single most preventable cause of failed papers I see across cohorts."

Nobody gives you feedback on a written answer until you have already failed. Providers can't — marking costs tutor hours, and that is precisely why it never appears in a free tier. You have Sly, a 2,022-question bank, and guest-mode infrastructure already live. You can give away the one thing that is expensive for everyone else.

**Why it manufactures mentions.** A score is an artefact. "I got 4 out of 10 on a question I was certain I'd nailed" is a screenshot, a LinkedIn post, a message in a cohort WhatsApp group. Nobody screenshots a revision page. People screenshot verdicts. It also earns a *name* rather than a URL — and a named tool is what someone types into ChatGPT, which is how citation starts.

**Effort:** medium. Sly, the question bank, `guest_tutor_usage` and `guest_tutor_budget` all exist. This is a new surface over existing parts, not a new system.
**Mentions per week if it works:** high, and compounding.
**Risk:** AI cost per submission, capped by the guest budget table you already built. Marking quality — if it marks badly, the artefact people share is a bad one.
**Legal:** never describe it as APM marking, examiner-approved, or accurate to the official mark scheme. It is "marked against the command verb and the published syllabus." Keep the existing non-affiliation disclaimer on the page. No pass-rate claim anywhere near it.

---

### Option B — The 143

**The idea.** Not "email training providers and ask them to share the link." Build each provider their own page: `/for/babington`, their logo alongside yours, a free mock exam for their learners, a link back to their programme. You build the template once; each additional provider is twenty minutes.

**Why this is the highest-yield use of £0 and 20 hours.** The government's Find Apprenticeship Training service lists **143 training providers** delivering the Level 4 Associate Project Manager standard. Those apprentices sit the PMQ. Critically, these providers are *not your competitors* — they deliver an apprenticeship, they do not sell PMQ revision material, and they have a real problem you solve for free: their apprentices revise alone and some of them fail.

Commercial ATOs — Parallel Project Training, Training ByteSize, QA — are a different conversation. They sell the thing you give away. Approach them second, and as partnership rather than as a favour.

**Why it fixes the root cause and nothing else does.** A co-branded page on a provider's site is a mention *and* a link *and* a named cohort of motivated candidates, from a `.co.uk` education domain. That is exactly the authority signal Google is missing and exactly the off-site footprint that makes an LLM willing to name you. Ten personalised emails a day is comfortable inside 20 hours a week. Even a 5% conversion is seven providers — seven credible domains, from a standing start of zero.

**Effort:** high, and unglamorous. It is email, follow-up, and twenty-minute page builds. It does not scale and that is the point.
**Mentions per week if it works:** the highest of the four, and the most durable.
**Risk:** slow. Expect six weeks before the first page goes live. Some providers will not reply at all.
**Legal:** B2B outreach to corporate addresses is treatable differently from individual subscribers under PECR, but every email still needs your identity, a real postal or business address, and a working opt-out, and the data handling still sits under UK GDPR. Co-branding needs written permission before you publish anyone's logo. Be careful that co-branding with an APM-accredited provider does not imply *you* are accredited — the disclaimer has to be on the co-branded page too. **[SOLICITOR]** before you sign any written partnership agreement or revenue share.

---

### Option C — The Examiner's Notebook

**The idea.** Publish one canonical reference asset, not fifty blog posts: a plain-English handbook of the PMQ command verbs — what "explain" demands that "describe" doesn't, what a marker can and cannot award, worked before-and-after answers at each mark level. Dated, author-named, licence-clear, and explicitly quotable.

**Why one asset instead of a content calendar.** Trends-and-analysis content gets cited at around 78% versus 12% for educational how-to, and 95% of ChatGPT citations come from pages published within ten months. A steady drip of "how to revise for the PMQ" posts is the 12% category. A single, named, canonical reference that other people quote is the thing that ends up in an answer.

**The out-of-the-box part:** license it so other people can reuse it. Let a training provider embed the verb table on their own site with attribution. Let a YouTuber read it out with a credit. You are deliberately giving away the content in order to manufacture the mentions, because the mentions are worth more than the pageviews.

Alongside it, the housekeeping that is currently missing: fill `llms.txt` (it is empty), add `FAQPage` and `Course` schema, put your name and credentials visibly on the pages, and date-stamp everything.

**Effort:** medium. The content largely exists inside your question bank and the exam-technique rewrite draft.
**Mentions per week:** low at first, then step-changes when someone quotes it.
**Risk:** slow burn with no early feedback. Easy to abandon at week three.
**Legal:** the verbs and syllabus structure can be described, but do not reproduce APM's syllabus wording verbatim. Original explanations only.

---

### Option D — Mark it with me

**The idea.** Two or three short videos a week. You take a real candidate answer — submitted through Option A, with permission — and mark it on screen, out loud. "Here's what they wrote. Here's the verb. Here's where the marks went."

**Why YouTube specifically.** In Ahrefs' December 2025 extension of the 75,000-brand study, **YouTube mentions were the strongest single predictor of AI visibility measured — ~0.737, higher than web mentions overall and more than three times backlinks.** That is the empirical case for video, and it is stronger than the one I would have made from intuition.

It is also the only verifiably active APM PMQ surface with no gatekeeper. Parallel Project Training runs a full PMQ podcast series mapped to learning objectives; Training ByteSize publishes PMQ exam-tips content. That proves the audience is there and consuming. There is no moderator to approve you, no domain filter, no algorithm hostile to a new entrant on long-tail queries. YouTube is indexed by Google and surfaced heavily in AI answers, and a video description is a followed link you control.

It is also the only option that builds the thing the brand actually rests on: *just a fellow project manager who went first.* That does not come across in a schema-marked-up FAQ page.

**Effort:** high and recurring. Realistically 4–6 hours a week including editing.
**Mentions per week:** medium, growing.
**Risk:** you may hate being on camera, and consistency is everything. Screen-recording with voiceover avoids the face problem entirely.
**Legal:** get explicit written permission before using anyone's submitted answer, even anonymised — build the consent checkbox into Option A on day one. No pass-rate claims in titles or thumbnails; "pass first time" in a thumbnail is a CAP Code problem with no outcome data behind it.

---

### What I am deliberately not recommending

**A build-in-public series or a Product Hunt launch.** Both would get attention. The attention is from builders and PM-tool people, not from someone three weeks out from a PMQ exam. Attention that doesn't convert is the most expensive thing a solo founder can buy with time, because it feels like progress.

**Building PFQ in 2 Days as a second product.** Same reasoning as the 8 Aug doc, and it still holds: 24 sign-ups is a distribution problem, and a second product doubles your maintenance surface while solving none of it. A free PFQ practice test as a lead magnet is fine. A second course is not.

**A new Reddit account.** Ban evasion breaches Reddit's own terms and puts the domain at further risk. Do not do it. What you *can* do is diagnose which layer the block sits at — a per-subreddit domain filter and a sitewide filter have completely different fixes — and that diagnostic is in the 30-day plan below.

---

## 3. The recommendation

**Run A, B and D as the spine. C is the amplifier.**

- **A (Mark My Answer)** is the artefact people talk about.
- **B (The 143)** is the distribution that reaches people who cannot find you.
- **D (Video)** is the highest-correlating mention surface measured, and the founder layer that makes the rest credible.
- **C (The Notebook)** is what an LLM quotes once people are talking.

I had D as a nice-to-have until the YouTube correlation figure came back. On the evidence it belongs in the spine, not the amplifier.

Split your 20 hours roughly: 7 to B, 4 to D, 4 to A (spec and review — Cursor builds it), 3 to C, 2 to running the agents.

Doing all four properly is possible at 20 hours a week. Doing all four badly is the failure mode, and the tell is that week three arrives and none of the 143 emails went out because building felt easier.

---

## 4. The agentic layer

You asked for agents working 24/7. The honest framing: **agents cannot manufacture mentions for you — that is what got the Reddit account banned.** What they can do is remove every hour of work that isn't the irreplaceable human bit, so that your 20 hours are all spent on the parts only you can do.

Division of labour: **n8n for plumbing** (scheduled, deterministic, API calls, routing, publishing). **Claude for judgement** (research, drafting in your voice, triage, deciding what's worth your time). Every agent that touches the outside world ends at a human approval gate.

### The seven agents

**1. Citation Scoreboard** — n8n, daily, 07:00
Twenty-five target questions ("how should I revise for the APM PMQ?", "free APM PMQ mock exam", "what does explain mean in the PMQ?") fired at ChatGPT, Perplexity, Gemini and Claude via API. Records whether Learn in Curve is named, and who was named instead. Writes to Supabase, surfaces in Notion.
*Why first:* this is the scoreboard for the entire strategy and nobody in your niche is keeping it. The day that number moves from 0 to 1 is the day the strategy is proven.

**2. Mention Miner** — Claude scheduled task, daily
Searches the open web, YouTube comments and PM forums for people publicly asking PMQ questions in the last 24 hours. Drafts an answer in your voice. Queues it in Notion for you to post *as yourself*, from your own account.
*The compliance line, and it is not negotiable:* the agent finds and drafts. The human posts. Automated posting into communities is exactly the behaviour that produces bans, and you have already paid that price once.

**3. Provider Pipeline** — n8n + Claude, weekly
Watches the Find Apprenticeship Training listing and the APM accredited-provider directory for new and changed providers. Enriches each with a named contact and programme detail. Drafts a personalised co-brand offer referencing their actual programme. Queues it for you to send from your own mailbox, with identity and opt-out built into the template.
*This is the agent that pays for the whole build.* It turns Option B from a research slog into ten minutes of sending.

**4. Content Factory** — n8n + Claude, on trigger
Wispr voice note, or a gap the agent spots in `/library` coverage, becomes a draft written to `VOICE_GUIDE.md` — answer in the first 40 words, real numbers, one "however" pivot, one worked example, "essentially" landing. Lands in Notion at status Draft. Nothing publishes without you moving it to Approved.

**5. Freshness Warden** — n8n, weekly
Flags any `/library` page untouched for 90 days. Given that 95% of AI citations come from content under ten months old, letting pages go stale silently un-does the work. Also verifies `llms.txt` and schema markup are still present after each deploy.

**6. Activation Nudger** — n8n + Resend, daily
Eight of your 24 sign-ups have never started a section. Four have started but not sat the mock. A single well-timed email is the cheapest sign-up you will ever get, because they already signed up. Consent-gated — this runs only against people who ticked the separate marketing box.

**7. Index Watchdog** — n8n, daily
Indexed page count, new referring domains, and any change in the top ten for your five target terms. Alerts on movement. This is how you find out a provider published the co-branded page without telling you.

### Build order

Agents 1 and 3 in week one — the scoreboard and the thing that feeds Option B. Agent 6 in week one too, because it is an hour's work against users who already exist. The rest follow once those three are running clean.

Build them in n8n where the value is the pipeline, and as Claude scheduled tasks where the value is the judgement. You will learn more from wiring agents 1 and 3 by hand in n8n than from any tutorial, because they have real failure modes: rate limits, auth expiry, malformed responses, and a human at the end who will notice if the output is rubbish.

---

## 5. The first 30 days

**Week 1 — instrument and diagnose**
1. Fill `llms.txt`. It is currently empty. One hour.
2. Submit the sitemap in Google Search Console and confirm indexing status directly. If the site genuinely isn't indexed, that is the first fix and it's a day's work.
3. Diagnose the Reddit block: determine whether it is a per-subreddit domain filter or a sitewide one. Different problem, different appeal route. Do not create a new account either way.
4. Ship Agent 1 (Citation Scoreboard), Agent 3 (Provider Pipeline), Agent 6 (Activation Nudger).
5. Add a `signup_completed` event and UTM discipline in PostHog, plus a referrer breakdown isolating `chatgpt.com`, `perplexity.ai`, `gemini.google.com`, `claude.ai`. You cannot manage what you cannot see, and right now you cannot see it.

**Weeks 2–4 — the spine**
6. Spec Mark My Answer, hand to Cursor, ship behind the existing guest budget cap. Consent checkbox for reuse of answers built in from day one.
7. Send the first 100 provider emails. Ten a day, personalised, apprenticeship providers first.
8. Build the `/for/[provider]` template so page number two takes twenty minutes.
9. Record the first four videos.
10. Publish the Command Verb Handbook.

---

## 6. How you'll know it's working

In the order these should move. Anything that moves out of order means something in the diagnosis was wrong.

| Week | Signal | Target |
|---|---|---|
| 1 | Pages confirmed indexed in Search Console | 15+ |
| 2 | Provider emails sent | 100 |
| 4 | Referring domains that aren't yours | 1+ |
| 4 | First non-zero organic search session | >0 |
| 6 | Co-branded provider pages live | 2 |
| 6 | Mark My Answer submissions/week | 40 |
| 8 | First AI-assistant referral | >0 |
| 8 | Citation Scoreboard: any assistant naming you | 1 of 25 questions |
| 12 | Referring domains | 8+ |
| 12 | Sign-ups/week from non-LinkedIn sources | 20 |

**The one number that matters most is referring domains.** Everything else in this plan is downstream of it. If week 12 arrives and it is still zero, the plan failed and you should stop and rethink rather than push harder.

---

## 7. Legal and compliance flags

*Informal, educational guidance — not legal advice and not a substitute for a solicitor. Items marked **[SOLICITOR]** need real review before you act.*

**7.1 — Marking claims.** Mark My Answer must never be described as APM marking, examiner-approved, official, or accurate to the real mark scheme. Describe the mechanism: marked against the command verb and the published syllabus, by an AI, with mistakes possible. The existing Sly disclaimer language is the right register.

**7.2 — Reusing candidate answers.** Any answer you show in a video, a page or a blog needs explicit, separately-obtained consent at the point of submission — not buried in the terms. Anonymisation is not consent. Build the tickbox into the tool on day one; retrofitting means you cannot use anything collected before it.

**7.3 — Provider outreach under PECR and UK GDPR.** Corporate subscribers are treated differently from individuals, but every email still needs a clear sender identity, a genuine business address, and a one-click opt-out, and you must keep a record of what you sent and to whom. Do not import provider contacts into a marketing list; treat outreach as one-to-one business correspondence.

**7.4 — Co-branding.** Written permission before any third-party logo appears on learnincurve.com. The non-affiliation disclaimer must appear on co-branded pages too, or a reasonable person could read the page as implying you are accredited by association. **[SOLICITOR]** before signing any partnership or revenue-share agreement.

**7.5 — Advertising claims (CAP Code / ASA).** You still have no outcome data. Nothing may claim or imply a pass rate — not in a video title, a thumbnail, a provider email, or the co-branded page. Frame everything as structure and method. The ASA is complaint-driven and your competitors are the people most likely to complain the moment you become visible.

**7.6 — APM trademark.** Nominative use only. The disclaimer is already correct on `/free-mock-exam` and `/library` — keep it on every new surface, including `/for/` pages and video descriptions.

**7.7 — Never use exam dumps.** The sites currently outranking you appear to be republishing real exam questions. Being the clean operator in a dirty SERP is a genuine competitive advantage, right up until you aren't one.

**7.8 — Automated posting.** Do not automate posting or commenting into any community platform. It breaches most platforms' terms, and it is the behaviour that most plausibly explains the Reddit block. Agents draft; humans post.

---

## 8. Honest limits of this analysis

- **PostHog is consent-gated and started collecting on 6 Aug.** Every traffic figure is a floor. The sample supports exactly one robust conclusion — the complete absence of search and AI referrals — which happens to be the conclusion the plan rests on.
- **No keyword volume data.** Ahrefs is in your stack but not authorised in this session. "No credible incumbent ranks for PMQ terms" comes from reading the live SERP today and is solid. "There is meaningful search volume" is inferred from the category. Pull real volumes before committing heavily to Option C.
- **The AEO correlation figures are vendor-published.** Directionally consistent across sources, not peer-reviewed.
- **The 143-provider figure and the PMQ apprenticeship requirement need checking at point of use.** The PMQ is mandated in ST0310 v1.3, but a temporary dispensation runs from 19/04/24 to 01/05/2027, meaning apprentices can enter Gateway having attempted but not passed it. That weakens "they must pass it" but not "they must sit it" — verify before you put a claim about it in a provider email.
- **Whether learnincurve.com is indexed at all was not conclusively verified.** `site:` searches through a third-party tool are unreliable. Check Search Console directly in week one.
- **The Reddit block layer is unconfirmed.** Appealed with no response is not the same as diagnosed.
