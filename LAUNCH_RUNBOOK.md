# Launch Runbook — first production deploy, payments live

**Created:** 2026-07-31. **Decision:** launch now, free + paid together. Sim has
consciously accepted this over the free-first sequencing recommended earlier —
logged here per the project's own convention: state the decision, don't silently
skip the caution.

**Checklist state going in:**
- Gemini DPA — confirmed by Sim. ✅
- Cookie notice — confirmed fine. Its only open risk was Intercom cookies, and
  Intercom is unconnected (no `NEXT_PUBLIC_INTERCOM_APP_ID`), so the notice's
  existing dormancy language already covers reality. Re-open this the day
  Intercom gets a real App ID.
- Entity/ICO registration and the final end-to-end checklist re-read — Sim is
  deferring these to after launch. Open, not resolved. Do them this week.
- Solicitor review — already a standing deferred risk since 2026-07-06.

**Found and verified during prep — not a blocker:** `courses.exam_config` in
Supabase still has a stale `ai_tutor_price_cents: 999` from the old £9.99 pricing.
Checked the actual checkout code (`src/lib/pmq/actions.ts`) — it never reads this
column. Every Checkout Session is built inline from `SLY_UNLOCK_PRICE_CENTS` (800,
i.e. £8.00), for both the amount charged and the description text shown to the
buyer. So the live charge is correct at £8 regardless. The stale DB value is a
hygiene item, not a customer-facing risk — worth a cleanup migration later, not
today.

---

## Order matters — domain first

Stripe's success/cancel redirect and the live webhook both need your production
URL. Decide it now if you haven't.

---

## 1 — Verify locally (10 min)

```bash
npm ci
npx tsc --noEmit
npm run build
```

`npm run build` runs the hero-assets test before `next build` — if that fails,
stop and fix it before touching Railway.

---

## 2 — Stripe: go live (20–30 min)

**2.1 — Activate the account.** Stripe Dashboard → top-left mode toggle → switch
from Test to Live. If this is the first time, Stripe will ask for business details
and bank account for payouts — complete that now, it can take a few minutes to
verify.

**2.2 — No Product/Price needs creating in the dashboard.** The code builds every
Checkout Session inline (`price_data`, not a stored Price ID) from
`SLY_UNLOCK_PRICE_CENTS` in `src/lib/tutor/constants.ts`. Nothing to configure here
— the amount is controlled entirely by that one constant. Confirm it still reads
`800` before you deploy.

**2.3 — Get the live secret key.** Developers → API keys (make sure you're in Live
mode) → reveal and copy `sk_live_…`. This replaces `STRIPE_SECRET_KEY`.

**2.4 — Create the live webhook endpoint.** Developers → Webhooks → Add endpoint:
- URL: `https://yourdomain.com/api/stripe/webhook`
- Events to send: **`checkout.session.completed`** only — that's the only event
  type the handler consumes (`src/app/api/stripe/webhook/route.ts`). Selecting
  more does no harm but adds noise to your dashboard.
- Save, then reveal the **signing secret** (`whsec_…`). This replaces
  `STRIPE_WEBHOOK_SECRET` — it is different from your test-mode one; the old
  value will not verify live events.

**2.5 — PCI SAQ A.** Dashboard → Settings → Compliance (or the banner Stripe shows
new live accounts) → complete the self-assessment questionnaire. You qualify for
SAQ A because Checkout is Stripe-hosted — you never touch card data directly.
Takes about 10 minutes.

**2.6 — Confirm Stripe's DPA.** Usually bundled into account activation; check
Settings → Legal if it's not shown automatically.

---

## 3 — Railway: create the project and set every env var (20 min)

New Project → Deploy from GitHub → select the repo. Build `npm run build`, start
`npm start`. Don't set `PORT` — Railway injects it.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
RESEND_API_KEY
INTERNAL_EMAIL_FOUNDERS=simsamaarshened@gmail.com,sim.samaar@yahoo.in,sim.samaar@yahoo.com
INTERNAL_EMAIL_DOMAINS=
STRIPE_SECRET_KEY=sk_live_…          ← from step 2.3
STRIPE_WEBHOOK_SECRET=whsec_…        ← from step 2.4, the LIVE one
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**`NEXT_PUBLIC_APP_URL` is not in your current `.env.local` at all** — it isn't set
anywhere yet. Without it, `src/lib/pmq/actions.ts` falls back to
`http://localhost:3000` for Stripe's `success_url` and `cancel_url`. That means a
customer could pay successfully and get redirected to a dead localhost link
immediately after — the charge works, the experience looks completely broken.
This is the single highest-impact variable on this list for a paid launch.

**`INTERNAL_EMAIL_FOUNDERS` / `INTERNAL_EMAIL_DOMAINS`** classify founder and
test signups (`is_internal`) so they never enter list counts, exports, or
marketing sends. Unset founders fall back to the seed list in
`src/lib/email/internal.ts`. Set them on Railway the same as locally. Do not
accept `is_internal` from the client.

**Do not set** `DEMO_SKIP_AUTH`. It's inert (`src/lib/demo.ts` hard-returns
`false`) but has no place in production.

---

## 4 — Supabase: point auth at production (10 min)

Dashboard → Authentication → URL Configuration:
- **Site URL** → your production domain
- **Redirect URLs** → add `https://yourdomain.com/**`

Skip this and confirmation emails link to `localhost:3000` — nobody can finish
signing up. This is the most common first-deploy failure.

---

## 5 — Attach the domain (10 min + DNS wait)

Railway → Settings → Domains → add domain → set the CNAME at your registrar.
Wait for the certificate before testing or announcing anything.

---

## 6 — Smoke test on the real domain, private window, real card (25 min)

- [ ] Home loads, no broken images
- [ ] Sign up with a real email → confirmation link points at your domain → confirms
- [ ] Complete a quiz, progress saves and survives reload
- [ ] Talk to guest Sly, reply streams
- [ ] **Buy the Pro Bundle with a real card.** Confirm: redirected to the real
      domain (not localhost) on success, webhook fires, entitlement unlocks
      immediately, receipt email arrives.
- [ ] Then refund yourself from the Stripe dashboard and confirm the unlock
      reverts cleanly.
- [ ] Cookie banner appears and choice persists
- [ ] Check on a phone

Do not skip the real-card test. It is the only way to prove steps 2–4 actually
connected correctly end to end — a webhook misconfiguration is invisible until
money moves.

---

## 7 — Go

If step 6 is clean, you're live. Announce it.

---

## After launch, this week — not blocking, but real

- Entity decision + ICO registration follow-through
- Full end-to-end re-read of `legal/PRE_LAUNCH_CHECKLIST.md` in one sitting
- Clean up the stale `ai_tutor_price_cents: 999` in `courses.exam_config` so it
  can't confuse a future session even though nothing reads it today
- Solicitor review, when there's budget — standing deferred risk since 2026-07-06

## If something breaks after launch

Railway keeps previous deployments — roll back from the Deployments tab. Supabase
and Stripe config do **not** roll back with the app; they're separate and manual.
If a webhook misfires, check Stripe Dashboard → Developers → Webhooks → your
endpoint → recent deliveries, before assuming the app code is at fault.
