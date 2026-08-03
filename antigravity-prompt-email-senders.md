# Antigravity task — wire email illustrations + centralise sender addresses

Repo: `Learn in Curve`. Two related jobs. Do both in one pass. Do not refactor anything outside the files named.

## Context

All four Resend senders currently hardcode `onboarding@resend.dev`, Resend's shared sandbox address, which can only deliver to the Resend account owner. `learnincurve.com` is being verified in Resend and `NOTIFY_EMAIL_FROM` is being set in Railway. Only `send-confirmation-email.ts` reads that variable; the other three ignore it.

The three list illustrations exist as files but are never referenced, so confirmation emails render an empty reserved box.

---

## Job 1 — one sender module, no hardcoded sandbox addresses

Create `src/lib/notify/senders.ts`:

```ts
/**
 * Every Resend "from" address in one place.
 *
 * EMAIL_DOMAIN_FROM is the verified sending domain (set NOTIFY_EMAIL_FROM in
 * Railway). The onboarding@resend.dev fallbacks are Resend's shared sandbox —
 * they only deliver to the Resend account owner, so they are development-only.
 */
const DEFAULT_DOMAIN = "learnincurve.com";

function sender(label: string, mailbox: string): string {
  const override = process.env.NOTIFY_EMAIL_FROM;
  if (override && label === "Learn in Curve") return override;
  const domain = process.env.EMAIL_SENDING_DOMAIN ?? DEFAULT_DOMAIN;
  return `${label} <${mailbox}@${domain}>`;
}

export const NOTIFY_FROM   = () => sender("Learn in Curve", "hello");
export const CONTACT_FROM  = () => sender("Learn in Curve contact", "hello");
export const FEEDBACK_FROM = () => sender("Learn in Curve feedback", "hello");
export const ALERT_FROM    = () => sender("Learn in Curve alerts", "hello");
```

Note they are functions, not constants — `process.env` must be read at call time, not module load time, or Railway variable changes won't take effect without a rebuild.

Then replace the hardcoded constants in all four files with calls to these:

| File | Current constant | Replace with |
|---|---|---|
| `src/lib/notify/send-confirmation-email.ts` | `DEFAULT_FROM` (line ~14) | `NOTIFY_FROM()` |
| `src/lib/notify/send-contact-email.ts` | `CONTACT_FROM` (line ~9) | `CONTACT_FROM()` |
| `src/lib/notify/send-feedback-email.ts` | `FEEDBACK_FROM` (line ~15) | `FEEDBACK_FROM()` |
| `src/lib/tutor/guest-budget-alert.ts` | `ALERT_FROM` (line ~17) | `ALERT_FROM()` |

In `send-confirmation-email.ts`, delete the local `process.env.NOTIFY_EMAIL_FROM ?? DEFAULT_FROM` line — that logic now lives in `senders.ts`.

Do not change `CONTACT_TO` / `FEEDBACK_TO` (both `simsamaarshened@gmail.com`). Those are correct.

---

## Job 2 — wire the confirmation-email illustrations

Two illustrations already exist at `public/brand/email/confirm-highfive.png` and `public/brand/email/confirm-mailbox.png`. All three `illustrationUrl` fields in `src/lib/notify/lists.ts` are empty strings.

Email clients cannot load `/public` relative paths — they need absolute URLs on a host that permits hotlinking. Per the comment in `lists.ts`, these belong in Supabase Storage.

1. Create a **public** Supabase Storage bucket named `email-assets` if it does not exist.
2. Upload both PNGs to it.
3. Populate `illustrationUrl` in `src/lib/notify/lists.ts` with the resulting public URLs:
   - `newsletter` → `confirm-mailbox.png` (matches its alt text, "A postbox with letters ready to send")
   - `pmq-in-5-days-ai-pro` → `confirm-highfive.png`
   - `pfq-in-2-days` → leave `""` unless a third asset exists; the layout already reserves the space
4. Leave `illustrationAlt` values exactly as they are.

Then verify `renderIllustration` in `send-confirmation-email.ts` emits a plain `<img>` with an absolute `src`, explicit `width`/`height`, and the alt text. No CSS background images — Outlook strips them.

---

## Verify before committing

- `npm run build` passes clean.
- `grep -rn "onboarding@resend.dev" src/` returns **only** the fallback inside `senders.ts`, nothing else.
- Both illustration URLs return HTTP 200 when opened in a browser in a private window (proves the bucket is genuinely public).

## Ship

```bash
git add -A
git commit -m "fix: centralise Resend sender addresses; wire confirmation email illustrations"
git push
```

The pre-commit hook bumps the site version by 0.1. Do not override it.

## Report back

- Confirm the build passed.
- Paste the two public illustration URLs.
- Confirm the grep result.
