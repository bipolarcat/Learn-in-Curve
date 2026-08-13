# The Portfolio Strategy — Learn in Curve as case study

**Written:** 2026-08-13
**Supersedes:** the option weighting in `ACQUISITION_PLAN_AUG_2026.md`. That document's *diagnosis* still stands and is not repeated here — read §1 of it first. This one replaces its recommendation.
**Sim's split, stated 13 Aug:** 45% PMQ sign-ups and revenue, 55% brand-building and learning the full product lifecycle.
**Answers given 13 Aug:** brand outcome deliberately left open (optionality); community to live inside Learn in Curve, audience TBC; photography and design to become separate micro-products; build shape a mix of LIC features, tools on the LIC domain, and genuinely separate products.

---

## 1. Start with the honest problem

You have named six workstreams: improve PMQ in 5 Days, ship Mark My Answer, build an AI-generated YouTube channel, build photography and design micro-products, start a community, and keep posting on LinkedIn. Against 20 hours a week, that is roughly three hours each.

Three hours a week is enough to *start* six things and not enough to *finish* any of them. This is the most common way a first-time founder loses a year, and it doesn't feel like a mistake while it's happening — it feels like momentum, because there is always something being built.

**However, the answer is not "do less."** Your objective genuinely is breadth: you said the value is in learning the whole lifecycle, and optionality is the point. Narrowing to one thing would serve the 45% and starve the 55%.

The answer is a structure where the six things stop being six things.

---

## 2. The through-line

The mistake would be to treat project management, AI, design and photography as four subjects. They aren't, and if you present them as four subjects the brand reads as unfocused.

They are four *domains*, and one *skill*: **you are a project manager who builds.** The subject rotates. The demonstrated capability doesn't. That is a real position — most PMs write about AI in theory, very few ship with it and show the work — and it is the one thing that makes a PMQ course, a photo tool and a design utility belong to the same person rather than looking like a scattered hobby.

Everything below is built so that one hour of building produces artefacts on several layers at once.

```
LAYER 0   PMQ in 5 Days gets better              45%   → KPI: sign-ups, activation
LAYER 1   The Build Log (automated capture)       —    → KPI: artefacts/week
LAYER 2   Surfaces: LinkedIn, YouTube, Instagram  —    → KPI: brand mentions
LAYER 3   Micro-products on the LIC domain        —    → KPI: shipped + learned
LAYER 4   The community, inside LIC               —    → KPI: not yet. See §7.
```

Layer 1 is the load-bearing one. It is what makes six workstreams cost less than six workstreams.

---

## 3. The thing I need you to be honest with yourself about

Your theory is: build more things → traffic → convert to PMQ sign-ups.

**The traffic will not convert to PMQ, and you should stop justifying the micro-products that way.** Someone who finds an AI photography tool is not sitting an APM exam. You said this yourself and then partly talked yourself out of it. The conversion rate will be close to zero and you should plan for zero.

**They are still worth building**, for three reasons that are real:

1. **Domain authority pools.** If the tools live on `learnincurve.com`, every link and mention they earn strengthens the domain that `/library` and `/free-mock-exam` sit on. That directly addresses the actual bottleneck from the acquisition plan — a domain nothing on the internet has ever linked to.
2. **Mentions accrue to the brand name.** The Ahrefs finding was that branded web mentions predict AI visibility at 0.664 against 0.218 for backlinks. A mention of "Learn in Curve" earned by a photo tool still teaches the models that the name exists and what it's attached to.
3. **They are the 55%.** Learning the lifecycle *is* the stated objective. It does not need a conversion story to be justified.

**So: measure each layer on its own KPI.** If you judge the photography micro-product on PMQ sign-ups, you will correctly conclude it failed and kill something that was doing exactly what it was supposed to. This is the single most likely way this plan goes wrong.

**One structural condition attached to your "mix of 1, 2 and 3":** put the standalone products on the Learn in Curve domain — `learnincurve.com/tools/…` or a subdomain — unless there is a specific reason not to. You picked "genuinely separate products with their own identity" and I pushed back on that before you answered; here is the pushback restated in one line, then I'll drop it. A separate domain starts from zero authority, splits your mentions across two names, and doubles your maintenance surface — and you have already seen what a domain with no authority looks like. Separate *identity* is fine. Separate *domain* costs you the compounding. Your call, and it's a reversible one either way.

---

## 4. Layer 0 — Learn in Curve keeps getting better (45%, ~9 hrs/week)

This stays the spine, because it's the only layer with revenue in it and because a community hosted inside a mediocre product is a mediocre community.

**Mark My Answer ships first.** It is the highest-value feature you can add, for the reasons in the acquisition plan: exam technique is the #1 documented failure cause, long-response carries 50 of 90 marks, and nobody gives free feedback on written answers because marking costs tutor hours.

### On gating — you suggested IP-based, one free use

Right instinct, wrong mechanism on its own. Three problems with IP:

- **It doesn't work well.** Mobile networks and CGNAT put thousands of people behind one address; a shared office blocks colleagues; a VPN resets it in one click. You will simultaneously block real users and fail to stop determined ones.
- **An IP address is personal data under UK GDPR.** Storing it for rate-limiting is defensible on legitimate interests, but it needs to be in the privacy notice, needs a retention period, and needs a reason you couldn't do it with less data.
- **You already have better infrastructure.** `guest_tutor_budget` and `guest_tutor_usage` exist and are doing this job for guest Sly.

**Recommended shape — a progressive gate, not a wall:**

1. **First marking free**, no account. Tracked by a client-side token plus a **salted hash** of the IP (store the hash, never the raw address, short TTL — that's the "less data" answer).
2. **Second and third** in exchange for an email — with the marketing checkbox separate and unticked, per `cursor-prompt-list-hygiene-and-consent.md`, and the marking itself delivered as a transactional message.
3. **Unlimited** with an account, inside the existing tier structure.
4. **A hard global spend cap** on top, reusing the guest budget pattern, so a bad day costs a known amount.

The reason to gate progressively rather than at one use: the whole point of the tool is that the *verdict* is the shareable artefact. A wall at use one means nobody ever sees a verdict, and you have built a lead magnet nobody can talk about.

---

## 5. Layer 1 — The Build Log

This is the piece that makes the rest affordable, and it's the one to build first.

**The principle:** you already generate the raw material for every post you'd ever want to write. Git commits, Linear tickets moving, Wispr Flow dictation, bug logs, decision records, screenshots. Today that material dies in the tools. The Build Log captures it automatically and turns it into drafts.

**How it runs — n8n for the plumbing, Claude for the judgement:**

- **Capture (n8n, continuous):** git commits on the LIC repo, Linear issues moving to Done, new Wispr transcripts, new decision-log entries — all routed into a `Raw` database in Notion.
- **Synthesise (Claude, weekly):** reads the week's raw material and identifies the two or three things that were genuinely interesting — a decision with a trade-off, a bug with a real root cause, something that didn't work. Not everything is content, and the agent's main job is throwing most of it away.
- **Draft (Claude):** each selected item becomes a LinkedIn post in the register in `VOICE_GUIDE.md` — answer first, real numbers, one "however" pivot, one worked example — plus a video script and an Instagram frame where the visual carries.
- **Gate (you, Notion):** status moves to Approved. Nothing publishes without that.
- **Publish (n8n):** official APIs only. Never automated commenting, never automated community posting. That distinction is the whole reason to build it this way.

**Why this earns its place:** it converts work you are already doing into artefacts on three surfaces, at a marginal cost of your review time. Without it, six workstreams means six content jobs. With it, it means one.

It is also, conveniently, the single best portfolio piece available to you. "I built an agentic pipeline that turns my own build history into multi-channel content, with a human approval gate" is a stronger demonstration of the skill you're claiming than any post about AI could be.

---

## 6. Layer 2 — Surfaces

### YouTube, AI-generated, and the constraint you have to design around

You want automated, AI-generated, no speaking. That is achievable, with one hard rule.

**YouTube renamed its "repetitious content" policy to "inauthentic content" on 15 July 2025.** AI-generated and AI-assisted video remains fully eligible for monetisation. What gets demonetised and eventually removed — three strikes: warning, 90-day suspension, permanent YPP removal — is mass-produced, template-driven output: recycled clips, slideshows with no narrative, scripts read verbatim by TTS, the same format on repeat. Synthetic content also requires the disclosure toggle in Studio.

**So the pipeline can do 90% of the work, but each video needs one piece of genuine original input.** Not your face, not your voice — your *thinking*. Concretely, every video is built around one real thing:

- a real answer you marked, and why it scored what it did
- a real build decision and the trade-off you took
- a real bug and its root cause

The AI does everything else: visuals, voiceover, edit, thumbnail, upload, description. That is compliant, and it is also just better content — a video with one real insight beats fifty templated ones on every metric that matters.

**Your tools for this, and their actual status:**

| Job | Tool | Status |
|---|---|---|
| Video generation | **Higgsfield** | ⚠️ **Not claimed** — deadline 28 Jan 2027 |
| Video generation (alt) | **Runway** | ⚠️ **Not claimed** — 28 Jan 2027 |
| Editing | **Supercut** | ⚠️ **Not claimed** — 28 Jan 2027 |
| Voice | ElevenLabs | ✅ Claimed |
| Video (alt) | Google AI Pro | ✅ Claimed |
| Stills, thumbnails, brand | Canva | ✅ Claimed |
| Carousels, decks | Gamma | ✅ Claimed |
| Orchestration | n8n | ✅ Claimed |
| Orchestration (alt) | **Gumloop** | ⚠️ **Not claimed — 28 Sep 2026, ~6 weeks** |
| Capture | Wispr Flow | ✅ Claimed |
| Research | Manus | ✅ Claimed |

**Leonardo.ai is not in the Product Pass.** If you have it, it's a separate paid subscription — worth confirming before the plan depends on it. You do have a `Claude Code + Higgsfield` workflow page in Notion referencing NanoBanana 2 and Seedance 2.0, so you may have Higgsfield access outside the Pass. Check.

**Action this week:** claim Higgsfield, Runway, Supercut and Gumloop. They are free to you and they are exactly the tools this plan runs on. Gumloop's window is six weeks. This is already `LIC-138`.

### LinkedIn — personal profile, unchanged

The only channel currently producing humans: 12 of ~30 visitors in 30 days. It stays personal-profile-only. Company page organic reach is 2–6% of followers; employee and personal reshares travel roughly 561% further. The Build Log feeds it 2–3 times a week.

### Instagram — earns its place now

It didn't before, and this is a real change: design and photography micro-products produce visual work, and Instagram is where visual work belongs. It stops being brand-consistency box-ticking and becomes the natural home for one of the four domains. Same Build Log, different cut.

---

## 7. Layer 4 — The community, and why it isn't week one

You want it inside Learn in Curve, and you said the audience is TBC. Taking that at face value: **"TBC" is the reason not to build it yet, and there is a disciplined way to resolve it rather than guessing.**

Communities fail from emptiness, not from bad software. A Discord with nine people in it is worse than no Discord, because it is public evidence that nobody came — and you cannot un-launch it.

### What the fact-check actually found

**Exists and is crowded — for AI *product* managers:** Build Club, AI Tinkerers (30+ city chapters), MLOps Community (20,000+ members with an active `#product-management` channel), Mind the Product. Note these serve *product* managers, a different profession from yours. Do not read their existence as your gap being filled.

**Exists for *project* managers:** The Digital Project Manager's paid Slack — 1,000+ paying members against a ~35,000 audience. APM's own *AI and Data Analytics* Interest Network — members-only and explicitly bans self-publicity. PMI's ProjectManagement.com. A full conference circuit including PMXPO and the APM Project Management Conference.

**Does not appear to exist:** a free, open space for project managers who want to *build* with AI rather than read about it. The demand signal is documented — the top barrier to AI adoption in project management moved from "resistance to change" (26%) in 2025 to **"lack of understanding" (32%) in 2026**. That is a shift from *won't* to *can't*, and "can't" is what a learning community is for.

*Confidence: moderate. Private Slack, Discord and WhatsApp groups are invisible to search, so I can evidence that no prominent open community exists, not that none exists at all.*

### The trigger, instead of a launch date

Don't schedule it. Set a condition, and let your own audience tell you who they are:

> **When a single post or video produces 20+ inbound replies or DMs asking "how did you build that," the audience has named itself. Build the community for the people who asked.**

Until then, do the two things that cost nothing and make the eventual launch survivable:

1. **Run a LinkedIn Newsletter.** LinkedIn notifies your followers on publish — real, free distribution — and mirror every issue to your own Resend list. The Resend list is the asset; LinkedIn is the megaphone. This is the cheapest possible test of whether the audience exists, and it produces the seed list for day one.
2. **Keep a waiting list** on the LIC site, gated behind one question: *what are you trying to build?* Those answers are the audience definition you currently don't have.

If the trigger never fires, that is a real answer and it saved you from running an empty room.

---

## 8. How the 20 hours split

| Layer | Hours/week | What it buys |
|---|---|---|
| **0 — PMQ in 5 Days** | 9 | Mark My Answer, then the Linear backlog. The 45%. |
| **1 — Build Log** | 2 | Front-loaded: ~8 hrs in weeks 1–2, then ~1 hr/week of review. |
| **2 — Surfaces** | 4 | LinkedIn 2–3/wk, YouTube 1–2/wk, Instagram on visual work. |
| **3 — Micro-products** | 4 | One shipped every 4–6 weeks. Not one started every week. |
| **4 — Community** | 1 | Newsletter only, until the trigger fires. |

**The rule that makes this hold: one micro-product at a time, finished before the next starts.** Four hours a week is enough to ship something small every four to six weeks. It is not enough to run two in parallel, and the temptation to start the second before finishing the first is the specific failure mode to watch for. Optionality comes from a shelf of finished things, not a folder of half-built ones.

---

## 9. First 30 days

**Week 1**
1. Claim Higgsfield, Runway, Supercut, Gumloop (`LIC-138`). Confirm whether you have Leonardo.ai outside the Pass.
2. Ship the consent + `is_internal` fix (`cursor-prompt-list-hygiene-and-consent.md`). Blocks every email you'll ever send.
3. Fill `llms.txt`; confirm indexing in Search Console.
4. Start the LinkedIn Newsletter, mirrored to Resend.

**Weeks 2–3**
5. Build the Build Log capture and draft pipeline. This is the multiplier — it comes before the things it multiplies.
6. Spec Mark My Answer with the progressive gate; hand to Cursor.

**Week 4**
7. First three YouTube videos, each built on one real marked answer, disclosure toggle on.
8. Pick micro-product #1 — photography or design — and scope it to something shippable in four weeks. Write the one-page spec before writing any code.

---

## 10. What to measure, per layer

Separate scoreboards. Never one number across all of it.

| Layer | Metric | 90-day target |
|---|---|---|
| 0 | PMQ sign-ups/week from non-LinkedIn sources | 20 |
| 0 | Mark My Answer completions/week | 40 |
| 1 | Approved artefacts published/week | 4 |
| 2 | Referring domains to learnincurve.com | 8+ |
| 2 | Assistants naming Learn in Curve (of 25 test questions) | 1+ |
| 3 | Micro-products shipped and live | 2 |
| 4 | Newsletter subscribers with recorded consent | 100 |
| 4 | Inbound "how did you build that" replies | trigger at 20 |

**Referring domains is still the number that matters most**, exactly as in the acquisition plan. Everything else is downstream of the domain being known to exist.

---

## 11. Legal flags on the new material

*Informal, educational guidance, not legal advice. **[SOLICITOR]** marks items to check before acting.*

**11.1 — AI content disclosure.** Use YouTube's altered-or-synthetic-content toggle where realistic synthetic media appears. Separately, under the CAP Code, marketing must be *obviously identifiable as marketing* — a video that is really an ad for LIC needs to read as one.

**11.2 — IP addresses are personal data.** If you rate-limit Mark My Answer by IP, that goes in the privacy notice with a lawful basis (legitimate interests), a retention period, and — the reason to hash it — a demonstration that you used the least data that would work.

**11.3 — Reusing candidate answers.** Explicit, separate consent at submission, before any answer appears in a video or page. Anonymisation is not consent. Build the checkbox in on day one.

**11.4 — Generative tool licensing.** Higgsfield, Runway, Leonardo and Canva each have their own terms on commercial use and output ownership, and they differ. Read the commercial-use clause of any tool whose output goes into something you might charge for. **[SOLICITOR]** before output from a generative tool becomes part of a paid product.

**11.5 — Community hosting.** The moment you host a community you are processing member data and moderating user content: privacy notice, community rules, a moderation and takedown route, and a named person responsible. This is a real reason not to launch it casually. **[SOLICITOR]** on the terms before it opens.

**11.6 — Unchanged and still binding.** No pass-rate claims anywhere. APM nominative use plus the disclaimer on every new surface, including video descriptions and micro-product pages. No exam dumps. Agents draft, humans post.

---

## 12. Honest limits

- **The community gap is moderate-confidence, not high.** Private groups are invisible to search.
- **"Optionality" is a legitimate answer and a costly one.** Not choosing between a job, clients and an audience means optimising for reusable artefacts rather than for any one of them, which is slower than picking. Worth revisiting at 90 days once you've seen which layer you actually enjoy.
- **The 45/55 split will not hold naturally.** Layer 0 is the least novel work and will be the first thing dropped when something more interesting appears. If sign-ups matter at all, the 9 hours are the ones to defend.
- **Six workstreams is still six workstreams**, even structured well. If something has to give at week six, give up a micro-product, not the Build Log — the Build Log is what makes everything else visible.
