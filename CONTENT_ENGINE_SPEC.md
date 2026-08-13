# Content Engine — AI Tool Comparisons

**Written:** 2026-08-13 · **Status:** Spec, agreed. Not built.
**What it is:** Two separate systems. A tool library that fills itself, and a content workflow you trigger by hand.

---

## The whole thing on one page

```
SYSTEM 1 — LIBRARY (always on, no decisions)
  Gmail newsletters ─┐
  Readwise (later) ──┼─► Claude extracts ─► Notion "Tools" database
  Telegram message ──┘                       (you browse it whenever)

SYSTEM 2 — PRODUCTION (only when you say so)
  You: "compare X and Y"   OR   paste long text
        ↓
  Interview — Claude researches for you, then grills you
  (type or dictate via Wispr Flow)
        ↓
  Text draft ─► Pangram check ─► revise if it reads as AI
        ↓
  ┌─ GATE 1: you review the text ─┐
        ↓ approved
  Carousel + caption + article generated
        ↓
  Saved to Notion · sent to Telegram if you ask
        ↓
  ┌─ GATE 2: you amend, back and forth ─┐
        ↓ approved
  Instagram posts automatically
  LinkedIn drafts ready — you post by hand (personal + company)
  Article stays in Notion
```

**Two gates. Text before images. Nothing posts to LinkedIn without you.**

---

## Why two systems, not one

The library has value even if you never post. It's how you learn what's out there. It runs whether or not you're producing content, and it gets better on its own.

Production draws *from* the library when you feel like it. No schedule, no queue pressure, no obligation.

Keeping them separate is what stops this becoming a content treadmill.

---

## System 1 — The library

**Runs:** daily, unattended. Nothing to approve.

**Inputs, all three:**
1. Gmail — the AI newsletters you already subscribe to (Superhuman, The Rundown, There's An AI For That, Flux, Every)
2. Telegram — you message "add Perplexity" and it researches and adds it
3. Readwise Reader — later, if you set it up

**Output:** one Notion page per tool.

### Fields

**Core** — what does it do (one line) · category · **PM use case** · who it's for · pricing / free tier · website · source · last updated · tried-yet status

**Company background** — founder · founded · funding stage · how it's doing lately

> `PM use case` is the field that makes this yours. Not "video tools" but "tools for writing a status report," "tools for meeting notes," "tools for risk logs." A project manager can act on that. An AI newsletter never gives them it. Every use-case cluster is also a comparison waiting to happen.

> Company background goes stale and is the most likely thing the AI gets wrong. It's there for your learning, not for publishing. Don't put an unverified funding figure in a post.

### Tried-yet status

`not tried → to try → tried`

When you pick a matchup and haven't used a tool, the agent doesn't work around it — **it tells you to go use it first**. That's the point. The content can't be faked, and you learn something every cycle.

You can only publish as fast as you can actually use tools. That's a feature.

---

## System 2 — Production

### Trigger

Telegram, two ways:
- `"compare Notion AI and ChatGPT for meeting notes"`
- paste any long text you've written or dictated → skips to the draft stage

### Interview

**Supportive first, then challenging.** In order:

1. Briefs you on both tools from the library + fresh research
2. Asks open questions about your experience
3. **Then pushes back** — no vague answers, demands a specific example or a number, asks what would make you wrong
4. Won't close while your take is generic

Answers by typing or dictation (Wispr Flow), whichever suits the moment.

### Draft → Pangram → Gate 1

Text draft only. No images yet — generating slides from a draft you don't like wastes the expensive step.

Runs through **Pangram** first. If it reads as AI-written, the agent revises *before* you see it.

You review in Telegram or Notion. Approve or send it back.

### Generate → Gate 2

Once the text is approved:
- **Carousel** — PDF for LinkedIn, PNGs for Instagram
- **Caption** — LinkedIn and Instagram versions
- **Article** — long form

All saved to Notion. Sent to Telegram if you ask for it. You amend, it regenerates, back and forth until you're happy.

### Publish

| Where | How |
|---|---|
| Instagram | **Automatic** — already set up on the account |
| LinkedIn personal | Draft ready in Notion, you post |
| LinkedIn company page | Draft ready in Notion, you post |
| Article | Stays in Notion for now |

No LinkedIn API, no app reviews, no approvals to wait on.

---

## Rating loop

After each piece, three scores on Telegram (5 seconds) plus one line: *what would make this a 10?*

- **Hook** — did the opening earn the scroll-stop
- **Substance** — sharp and specific, or generic
- **Voice** — did it sound like me

Plus a fourth: **rate the interview**. If the questions were weak, everything downstream is weak — and that's the only part with no other feedback.

**What consumes the ratings:**
- Anything scoring **8+** becomes a few-shot example in future generation prompts — the system writes in the style of your own best work
- A complaint that recurs **3+ times** gets promoted to a hard rule in `STYLE_RULES.md`, which sits in the prompt alongside `VOICE_GUIDE.md`

**Ship at 7, not 10.** If everything must hit 10 you'll never publish. Watch the rolling average over 20 pieces — if it's climbing, it's working.

---

## Design

Follow `brand/Cursor brand brief 13.08.txt`. It wins over anything here.

The comparison format and the brand motif are the same shape: **two tickets, dashed perforation down the middle.** Tool A, Tool B. The brand already contains this design — don't invent a new one.

| | |
|---|---|
| Page | cream `#F4E9D6` with dot grid |
| Cards | paper `#FBF3E1`, thin ink border, soft shadow, rounded 12–20px |
| Text | ink `#241A12` |
| Hero accent | orange `#D5501F` — usually one orange word in a Fraunces headline |
| Good / bad | olive `#4F8F2E` / rust `#D03A1F` |
| Type | Fraunces headlines, Figtree everything else, sentence case |

**Never:** purple gradients, white cards on grey, photoreal or 3D, Space Mono, uppercase stamp labels, full-bleed colour bands.

Carousels: **8–10 slides.** Ten-slide carousels get ~22% more reach than three-slide.

---

## Voice

- **`VOICE_GUIDE.md`** → the article. Write in the **Enthusiast** register, never the Professional one.
- **Sim's Voice & Style Guide** (Notion) → LinkedIn and Instagram captions.

Signature moves to keep: the **"however" pivot** (~once per piece) · **always a number or a name**, never a vague quantity · **teach through one worked example**, not abstractly.

---

## Notion — two databases

**Tools** — the library. Fields above.
**Content** — every piece: type, status, the three artifacts, your four ratings, the delta line.

Matchup queue is a *view* on Content, not a third database.

---

## Build order

| # | What | Notes |
|---|---|---|
| 0 | **Hand-run one matchup** | No automation. Interview in a Claude chat, produce all three artifacts manually, look at them. If you wouldn't post them, fix the format before building anything. |
| 1 | Notion databases | Two, as above |
| 2 | n8n workflow A — ingest | Gmail + Telegram → Claude → Tools |
| 3 | n8n workflow B — Telegram agent | Browse, interview, draft, generate, rate |
| 4 | HTML → PDF/PNG renderer | Ticket template, brand brief accurate |
| 5 | Instagram publish | Already working on the account |

**Phase 0 is not optional.** Everything above is theory until one of these exists and you've looked at it.

---

## Legal note (informal, not legal advice)

Comparing named commercial products publicly is comparative advertising. Allowed under the UK CAP Code, but claims must be verifiable and not denigratory.

- "Tool B's free tier caps at 100 credits/month" — fine, sourced and checkable
- "Tool B is a waste of money" — not fine

Practical rules: every pricing claim carries a source and a date; refresh anything older than 30 days; don't publish company/funding figures from the library without checking them. If affiliate links ever appear, they need clear disclosure.

Instagram posts automatically, so it's the one channel with no human gate — keep the claim rules tightest there. Add comparative-advertising review to `legal/PRE_LAUNCH_CHECKLIST.md`.

---

## To do outside the build

- **Claim Pangram** — free to you, expires 28 Jan 2027
- Claim Readwise if you want it as an ingest source — expires 28 Jan 2027
- Decide where articles live, eventually. Deferred for now. If SEO matters later, they need to be on learnincurve.com, not a subdomain.

---

## Related

`brand/Cursor brand brief 13.08.txt` (design, wins over this doc) · `VOICE_GUIDE.md` · Sim's Voice & Style Guide (Notion) · `MARKETING_STRATEGY.md` · Lenny's Product Pass (Notion)
