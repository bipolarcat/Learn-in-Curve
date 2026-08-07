# Analytics Playbook — how to actually read PostHog

Written 2026-08-07. Companion to `ANALYTICS_SPEC.md` (which says *what* we
track); this says *what to do with it*. Aimed at Sim, first time using an
analytics tool.

---

## The one idea that makes analytics useful

Most people open an analytics tool, look at a big number going up, feel good,
and close it. That is not analytics, that is a mood ring.

Analytics is useful only when you write down the question **first**. A metric
you cannot act on is decoration. Before opening PostHog, finish this sentence:

> "If this number is low, I will change ______."

If you cannot finish it, do not go looking for the number.

The industry shorthand for this is **actionable vs. vanity metrics**. Total
pageviews is a vanity metric — it goes up when you tweet, and tells you nothing
about whether the product works. "Percentage of signups who complete LO1" is
actionable — if it is bad you know exactly which screen to go fix.

---

## Where you actually are right now

Be honest about the stage, because it changes which numbers mean anything.

- **6 distinct people** have visited `www.learnincurve.com` since tracking went
  live on 2026-08-06.
- 65 of your 92 pageviews are **you**, from localhost and your LAN IP.

At n=6, **every percentage is noise.** A "33% conversion rate" is two people. Do
not make a single product decision from a chart at this volume, and be
especially wary of the feeling that a chart is telling you something — it is
very easy to see a trend in four data points that does not exist.

**What you do instead at this stage:** use analytics to find out *what happened
to a specific person*, not what happens on average. Watch individual sessions.
Read individual funnels. At single-digit users, the qualitative "why did this
one person stop on LO2" beats any aggregate. Aggregates start being real at
roughly a few hundred users per step in a funnel.

This is a genuine startup skill, not a limitation to apologise for: early-stage
founders who do things that don't scale — including reading their data one
human at a time — learn faster than ones who wait for statistical significance.

---

## The four PostHog views worth your time, in order

### 1. Funnels — "where do people fall out?"

A funnel is an ordered list of events; PostHog shows how many people made it to
each step. **This is the single most valuable view you have** and it is what
`ANALYTICS_SPEC.md` §5 says the build is done when you can see.

Your core funnel:

```
$pageview (homepage)
  → quiz_demo_question_answered
    → quiz_demo_completed
      → signed_up
        → quiz_attempt_submitted
          → lo_completed
```

**How to read it:** ignore the total. Look for the **biggest single drop between
two adjacent steps.** That gap is your highest-leverage fix, because everything
downstream is capped by it. Improving a step *after* your worst drop-off is
wasted effort — you are optimising a room nobody reaches.

**The decision it drives:** the step before the biggest drop is what you work on
next sprint. That is it. That is the whole ritual.

A caution: a big drop is not automatically a problem. People who bounce off your
homepage in 3 seconds were never going to buy a PMQ course. Drop-off *deep* in
the funnel — someone who signed up and started LO1 and then stopped — is far
more alarming than drop-off at the top, because that person told you they wanted
it and the product still lost them.

### 2. Retention — "do they come back?"

Retention shows: of people who did something in week 1, what fraction did it
again in week 2, week 3, etc.

For LIC this is **the** number that matters long-term, and specifically it is
the honest test of whether Gamification Phase A (streaks and XP) is doing
anything. A streak feature that does not move retention is decoration you paid
for with engineering time. The `streak_incremented` event exists precisely so
you can split retention by "users who ever hit a streak" vs "users who did not"
and see whether the curve is different.

**Important caveat you should hold on to:** that comparison is *correlational,
not causal*. People who build streaks are probably more motivated learners
anyway — the streak might be a symptom of engagement rather than a cause of it.
The only way to know for sure is an experiment (turn the feature off for a
random half). Do not let a nice-looking retention split convince you a feature
works when it might just be identifying your keen users.

**Retention is currently broken for you.** See "Fix these first" below.

### 3. Trends — "how much of X, over time?"

The simplest view: a count of an event over time, optionally broken down by a
property. Good for `quiz_attempt_submitted` broken down by `lo_number` — that
instantly shows you which Learning Objective people stall on.

**Use trends for monitoring, not discovery.** They tell you something changed;
they almost never tell you why. When a trend moves, your next move is a funnel
or a session recording, not more staring at the trend.

### 4. Session recordings — "watch someone use it"

Replay of a real visit. At your user count this is **worth more than every chart
combined**. Ten minutes watching one confused learner will teach you more than a
month of dashboards.

Yours is already recording (12 sessions), with aggressive masking — all typed
text and input content is stripped in the browser before it is sent, so you see
where someone clicked and moved, not what they wrote. That masking is a
deliberate privacy decision and should stay.

---

## Fix these first — three things blocking real analysis

### 1. No `identify()` call exists — you have no person profiles

The provider is set to `person_profiles: "identified_only"`, which means PostHog
only builds a profile for a user once the code calls `identify()`. Nothing in
the codebase ever calls it.

**Consequence:** retention, cohorts, and any "what did *this user* do across
sessions" question are impossible right now. If someone visits on Monday and
again on Thursday, PostHog has no idea it is the same person.

Fixed by Task 1 in `cursor-prompt-analytics-events.md`. **Do this one first** —
it is the difference between analytics that answer questions about people and
analytics that only count clicks.

### 2. Your own dev traffic is 70% of your data

47 pageviews from `localhost:3000`, 18 from `192.168.1.147:3000`, 27 from the
real site. Every number you look at is currently mostly you testing.

Fix: in PostHog, **Project Settings → filter out internal/test users**, adding
rules for `$host` = `localhost:3000` and your LAN IP. Do this before you read
any chart, or you will spend a month drawing conclusions from your own clicking.

### 3. Session replay is ON, and your spec says it should not be

`ANALYTICS_SPEC.md` §6 explicitly deferred session replay as a deliberate
follow-up decision. It is nonetheless recording (12 sessions in the last 30
days) — PostHog enables it at the *project* level, so it turned on without a
code change.

**This is not a legal problem** — your published Cookie Notice already discloses
session replay and describes the masking accurately, and consent gates it. It is
a *documentation* problem: your spec and your reality disagree, which is how
teams end up accidentally shipping something nobody signed off on.

Two valid resolutions, pick one: turn it off in PostHog project settings to
match the spec, or amend §6 of the spec to record that replay is intentionally
live as of 2026-08-06. Given how useful replay is at 6 users, keeping it and
amending the doc is the better call — but **make it a decision, not a drift.**

---

## What to actually look at each week, once events are flowing

Fifteen minutes, Monday. In order:

1. **New signups this week** (trend on `signed_up`). Context, not a target.
2. **The core funnel, last 7 days.** Find the biggest step-to-step drop. Write
   it down. Compare to last week's biggest drop — is it the same one? If you
   fixed something and the drop moved elsewhere, that is progress.
3. **`quiz_attempt_submitted` broken down by `lo_number`.** Where do people
   stall? An LO with a sharp fall-off is either too hard, too boring, or broken.
4. **Watch one session recording end to end.** Not a highlight, a whole one.
   Pick a user who dropped out.
5. **One `ai_tutor_unlock_clicked` check.** People clicking a paywall they don't
   convert on is your clearest early demand signal for pricing.

Then write one sentence: "This week I am changing X because of Y." If you can't,
the week's data did not tell you anything, and that is a fine and normal outcome
— it does not mean you should invent a conclusion.

---

## Vocabulary you'll hear and should use correctly

- **Funnel** — ordered steps, measures drop-off.
- **Cohort** — a named group of users defined by behaviour or property ("users
  who completed LO1"). Reusable as a filter everywhere.
- **Retention curve** — repeat usage over time. Flattening out (rather than
  going to zero) is the sign of product-market fit people look for.
- **Vanity metric** — goes up, changes nothing. Pageviews, total signups.
- **North Star metric** — the single number that best proxies delivered value.
  For LIC, plausibly *weekly active learners who complete at least one LO*, not
  signups and not revenue. Worth choosing deliberately at some point.
- **Autocapture** — PostHog recording clicks automatically without you writing
  code for each. On for you. Good for exploration, bad as a permanent substitute
  for named events, because autocaptured clicks break silently whenever you
  restyle a button.
- **Statistical significance** — the check on whether a difference between two
  groups is real or luck. You are nowhere near having enough users for this to
  apply. Be suspicious of anyone (including yourself) claiming an A/B result at
  double-digit sample sizes.

---

*Informal guidance, not legal advice. The consent-gating and replay-disclosure
points here touch UK PECR and UK GDPR; `legal/PRE_LAUNCH_CHECKLIST.md` remains
the gate before any real launch, and anything material there wants a real
solicitor's eyes.*
