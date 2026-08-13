# Content Engine — AI Tool Comparison Pipeline

**Written:** 2026-08-13
**Status:** Spec. Not yet in Linear, not yet built.
**Scope:** An editorial pipeline that turns AI-newsletter intake + Sim's point of view into three artifact types across four channels. Covers architecture, schema, build phases and dependencies. Excludes topic-level editorial decisions and paid promotion.

---

## 1. Why this exists

Two goals, both real, and they are not the same goal:

1. **Sim's personal brand.** Consistent, opinionated, recognisable output. Measured in reach, follows, inbound conversations — not sign-ups.
2. **Learn in Curve acquisition.** Measured in traffic and sign-ups.

Per `MARKETING_STRATEGY.md` (2026-08-08), LIC currently has **zero search acquisition** and LinkedIn as its only referrer. That single fact sets the priority: the long-form article isn't a nice-to-have, it's the only component of this pipeline that attacks the search problem. Treat all three formats as core.

### The audience

Beginners who **already pay for an AI subscription and aren't getting value from it**. Interested, willing, blocked by information volume. Explicitly **not** software engineers.

This is the single most important constraint in the document. It's easy to drift into generic tool-review content that competes with every AI newsletter on earth. The schema enforces the angle mechanically (see `day_one_use_case`, §4).

### Why "versus" as the format

A comparison is a forcing function. It makes the writer commit to a recommendation, it gives the reader a decision rather than a description, and it produces a repeatable visual template. The format does editorial work that a "here's a cool tool" post cannot.

---

## 2. The core architectural decision

**Content is separated from presentation.**

The pipeline never generates "a LinkedIn post" or "an image". It generates one **Comparison Object** — structured JSON. Renderers are consumers of that object.

```
Newsletters ──► Tool Registry ──► Matchup Queue
   (scheduled)                         │
                                       ▼
                        ┌──────────────────────────┐
                        │  POV interview (Telegram)│ ◄── Sim
                        │  Claude conducts         │
                        └──────────────────────────┘
                                       │
                                       ▼
                          ╔═══════════════════════╗
                          ║  COMPARISON OBJECT    ║
                          ║  (JSON — the contract)║
                          ╚═══════════════════════╝
                                       │
        ┌─────────────┬────────────────┼────────────────┬─────────────┐
        ▼             ▼                ▼                ▼             ▼
   HTML→PNG      LinkedIn         LinkedIn          IG caption     Article
   carousel      (Sim)            (LIC page)                       (blog)
        └─────────────┴────────────────┼────────────────┴─────────────┘
                                       ▼
                          ┌────────────────────────┐
                          │  VALIDATION GATE (code)│  ── fails ──► back to Telegram
                          └────────────────────────┘
                                       │ passes
                                       ▼
                          ┌────────────────────────┐
                          │  Approve (Telegram)    │ ◄── Sim
                          └────────────────────────┘
                                       │
                                       ▼
                                   Auto-post
```

**Why this matters:** the design engine is undecided (HTML→PNG first, Canva and Gamma as live options). Under this architecture that's a cheap uncertainty — swapping renderer means writing one new consumer of the same JSON, not rebuilding the pipeline. The schema is the only thing that must be right up front.

---

## 3. Two clocks

Sim's answer was "manual trigger via agent chat" — no publishing schedule. That splits the system in two, and the split is a feature:

| | Trigger | Runs | Why |
|---|---|---|---|
| **Ingest** | Scheduled, daily | Unattended | Newsletters arrive continuously. The queue must accumulate value passively, or there's nothing to draw from when Sim does sit down. |
| **Production** | Manual, conversational | Sim-initiated | Quality depends on Sim's POV. Forcing that on a schedule produces rubber-stamped, low-conviction content — the exact failure mode that makes this indistinguishable from the newsletters it's sourced from. |

**Consequence:** the value of this system is the *queue depth*, not the posting rate. A well-stocked, well-researched Matchup Queue means Sim can produce on any day he has energy. Optimise ingest for queue quality, not volume.

---

## 4. The Comparison Object

The backbone. Every artifact is a projection of this.

```jsonc
{
  "matchup": {
    "tool_a": "…",
    "tool_b": "…",
    "category": "LLM | video | audio | scraping | design | automation | …",
    "hook": "the one-line reason a beginner should care about this matchup"
  },
  "tools": {
    "a": {
      "one_line": "…",
      "what_it_actually_does": "plain English, no marketing language",
      "best_for": "…",
      "day_one_use_case": "REQUIRED — what a non-engineer opens it and does in the first 10 minutes",
      "pros": ["…"],
      "cons": ["…"],
      "pricing": {
        "free_tier": "…",
        "paid_from": "…",
        "source_url": "REQUIRED",
        "checked_date": "REQUIRED — ISO date"
      }
    },
    "b": { /* same shape */ }
  },
  "verdict": {
    "who_should_pick_a": "…",
    "who_should_pick_b": "…",
    "sim_take": "the opinion — this is the non-commodity part"
  },
  "meta": {
    "sim_used_it": { "a": "yes|no|partially", "b": "yes|no|partially" },
    "confidence": "high|medium|low",
    "sources": ["…"],
    "newsletter_origin": "which newsletter surfaced this, if any"
  }
}
```

### Three fields doing specific work

**`day_one_use_case` — required.** This is the beginner constraint, made mechanical. If the pipeline can't fill it, the matchup isn't ready. Without it, output drifts into feature-list comparison, which is exactly what the audience is already drowning in.

**`sim_used_it` — drives everything downstream.** It changes the interview, the copy, and the validation:

| Value | Interview behaviour | Copy constraint |
|---|---|---|
| `yes` | Extract lived experience: what surprised you, what broke, what you'd tell a friend | First-person experience language permitted |
| `partially` | Extract the bounded experience, research the gaps, present findings, ask for a reaction | Scope claims to what was actually used |
| `no` | Research first, present a briefing, *then* ask what Sim thinks of it | No first-person experience language. "From the docs" / "on paper" framing only |

Honesty here is both a brand asset and the legal safety mechanism. "I haven't used this, but here's what it claims and here's my read" is more credible than fake authority, and it is not a misleading claim.

**`checked_date` on pricing.** AI tool pricing changes constantly. This is by far the most likely factual error the system will make, and the one most likely to be noticed. Staleness is enforced in code (§6).

---

## 5. Model routing — Claude everywhere content is touched

Standing decision: **Claude is the brain for anything content-related.** In n8n this is an Anthropic Chat Model node feeding the AI Agent node. Route by job:

| Job | Model | Why |
|---|---|---|
| Newsletter extraction → Tool Registry | Haiku / Sonnet | High volume, low judgment, structured output. Cost matters here. |
| Matchup suggestion | Sonnet | Pattern-matching over the registry |
| **POV interview** | **Opus** | Conversational judgment, knowing which follow-up to ask, adapting to `sim_used_it`. The quality of the whole pipeline lives here. |
| **Article generation** | **Opus** | Long-form in a specific voice from `VOICE_GUIDE.md` |
| Caption generation | Sonnet | Short, constrained, schema-driven |

Do not economise on the interview. Everything else is downstream of it.

---

## 6. The validation gate

Sim chose fully-automatic posting after Telegram approval. That's a legitimate choice, and it makes this section non-optional.

**Principle, already learned on Sly (see memory: LLM soft instructions unreliable):** hard behavioural constraints go in code, not prompt wording. A prompt saying "only make verifiable claims" holds most of the time. The rest goes public, unattended, under Sim's name, about named commercial companies.

An n8n **validation node sits between generation and publish** and hard-fails the post back to Telegram — never to the platform — on any of:

1. Any pricing claim missing `source_url` or `checked_date`
2. `checked_date` older than 30 days
3. Copy contains denigratory phrasing about a named company (maintained regex banlist)
4. `sim_used_it = no` but copy contains first-person experience language ("I found", "when I used", "in my testing")
5. `day_one_use_case` empty for either tool

Failure returns the *reason*, so the fix is one Telegram message, not a re-run.

### Legal context (informal — not legal advice)

Publicly comparing named commercial products is **comparative advertising**. Permitted under the UK CAP Code, but claims must be objectively verifiable, not misleading, and not denigratory. The rules tighten if affiliate links are ever added — those require clear, prominent disclosure under CAP and CMA guidance.

Practical translation: *"Tool B's free tier caps at 100 credits/month" (checkable, sourced) is fine. "Tool B is a waste of money" is not.* The gate above encodes exactly that line.

**Flag:** an unattended pipeline publishing claims about named companies at volume is worth a real solicitor's review before it runs without a human in the loop. Add to `legal/PRE_LAUNCH_CHECKLIST.md`.

---

## 7. Channels

All four ship in v1. Same Comparison Object, four renderers.

| Channel | Artifact | Voice source | Notes |
|---|---|---|---|
| **LinkedIn — Sim** | Caption + carousel | *Sim's Voice & Style Guide* (Notion) | Proven referrer. First person, personal brand goal. |
| **LinkedIn — LIC page** | Caption + carousel | LIC brand voice | Reworded, not duplicated. LinkedIn suppresses identical cross-posts. |
| **Instagram — LIC** | Carousel + caption | LIC brand voice | Awareness, not traffic — IG has near-zero link affordance. |
| **Blog — learnincurve.com** | Long-form article | `VOICE_GUIDE.md` (Enthusiast register) | **The only channel that attacks the zero-search problem.** |

### Voice guide split

Two documents, both correct, different jobs:

- **`VOICE_GUIDE.md`** (v2, 2026-08-08, built from 171k words of dictation) — governs long-form. Key rule: write in the **Enthusiast** register, not the Professional one. The Professional register is Sim's default when writing about project management and it is dull. Comparing AI tools is *natively* Enthusiast territory, so this pipeline should sit in the right register more easily than `/learn` pages do.
- **Sim's Voice & Style Guide** (Notion) — governs LinkedIn / short-form.

Signature moves worth encoding into the caption and article prompts: the **"however" pivot** (~1 per piece), **always a number or a name** — never a vague quantity, and **teach through one worked instance** rather than abstractly.

---

## 8. Design renderer

**v1: HTML → PNG.** Rationale: `brand/BRAND_KIT_v4.html` already exists as HTML with tokens, so the renderer inherits brand for free. Canva or Gamma would mean re-creating it.

Brand tokens (from v4):

| Token | Hex |
|---|---|
| Gold | `#D9A441` |
| Rust | `#D5501F` |
| Deep teal | `#123F3C` / `#1B6560` |
| Cream | `#FBF3E1` |
| Ink | `#241A12` |

Fonts: **Figtree** (sans), **Fraunces** (serif), **Space Mono** (mono).

Canva and Gamma remain live options as alternate renderers. Because they consume the same Comparison Object, switching later is a contained change. Decide after seeing v1 output side by side.

**Note:** existing Mascot SVGs are raster-wrapped, not true vector (see memory). Don't assume they scale for print-size carousel slides — check before using.

---

## 9. Build phases

**Sequencing principle: build the hardest-to-get-right thing first, with the least machinery around it.** Automating an unvalidated process just produces bad output faster. The risk here is not "can n8n do this" — it obviously can. The risk is "is the content actually good."

### Phase 0 — Prove the content (no automation)

Pick one matchup. Run the POV interview manually in a Claude chat. Produce all three artifacts by hand. Look at them.

Exit criteria: Sim would post all three without editing. If not, fix the schema, the prompts, or the design *before* writing a single n8n node.

### Phase 1 — Renderers + schema

Lock the Comparison Object. Build the HTML→PNG template and the three copy renderers. Still manually triggered, still manually fed.

### Phase 2 — Telegram production loop

n8n AI Agent node (Anthropic model) + Telegram trigger. Conversational: browse queue → select matchup → POV interview → generate → review. Output goes to Notion, not to platforms.

### Phase 3 — Ingest automation

Scheduled Gmail → Claude extraction → Notion Tool Registry → Matchup Queue. This is the least risky part and the easiest to defer.

### Phase 4 — Validation gate + auto-publish

Build the gate *before* wiring the publish APIs, not after. Then LinkedIn, then IG, then blog.

---

## 10. Dependencies and blockers

| Item | Status | Blocks |
|---|---|---|
| Notion connector auth | **Broken** — needs re-auth | Everything. Notion is the store. |
| Canva connector auth | **Broken** — needs re-auth | Only the Canva renderer option |
| `/blog` route on learnincurve.com | **Does not exist** — no route under `src/app/(site)/` | The entire article channel, and therefore the whole SEO rationale |
| LinkedIn API — personal posting | Not set up | `w_member_social` scope; requires app review |
| LinkedIn API — company page | Not set up | `w_organization_social` scope |
| Instagram Graph API | Not set up | Requires IG **Business/Creator** account linked to a Facebook Page |
| n8n instance | Unverified | Phases 2-4 |
| Solicitor review of comparative claims | Not started | Unattended auto-publish only |

**The `/blog` gap is the most consequential.** The article is the only channel that addresses zero search traffic, and there is currently nowhere for it to go. Building the route is a prerequisite, not a follow-up — and it's a Cursor job.

---

## 11. Open questions

1. **Matchup pairing logic** — who decides which two tools go head to head? Claude suggests from the registry and Sim confirms in Telegram, or Sim proposes freely?
2. **Series identity** — does this run under a consistent name/hashtag? A recognisable series compounds; one-off posts don't.
3. **Where does LIC get mentioned?** The link between "helpful AI tool comparisons" and "PMQ exam prep" is not obvious. If every post ends in a PMQ CTA it reads as bait. Needs a deliberate answer, not a default one.
4. **Queue depth target** — how many ready matchups before the system is considered "stocked"?
5. **Does the article get published before or after the social posts?** Publishing the article first and linking to it from social is the only sequencing that sends traffic to the site.

---

## 12. Related documents

- `VOICE_GUIDE.md` — long-form voice, Enthusiast register
- Sim's Voice & Style Guide (Notion) — short-form / LinkedIn voice
- `MARKETING_STRATEGY.md` — acquisition diagnosis, why the blog matters
- `brand/BRAND_KIT_v4.html` — colour and type tokens
- `legal/PRE_LAUNCH_CHECKLIST.md` — add comparative-advertising review
