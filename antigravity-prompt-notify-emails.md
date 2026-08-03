# Antigravity task — ship the three notify confirmation emails

Repo: `Learn in Curve`. Do all steps in order, one pass. Do not refactor anything outside the files named.

**Supersedes `antigravity-prompt-email-senders.md`** — that file assigned different illustrations per list, which is wrong. All three emails share ONE illustration. Ignore it; use this file.

## Goal

Three "Notify me" buttons already post the correct list keys to `/api/notify` and save rows. What's missing: the confirmation email doesn't send (wrong sender address) and has no illustration. After this task, clicking any of the three sends a branded email from `hello@learnincurve.com`.

Approved designs: https://8081-iixiz3cdkj2mml6qc6j8o-0a70b158.us2.manus.computer/notify-previews.html

They are the existing template plus a sign-off and one shared illustration. **Do not add three separate HTML files.** The codebase already renders one template in `src/lib/notify/send-confirmation-email.ts` with per-list content from `src/lib/notify/lists.ts`. Keep that structure.

---

## Step 1 — Rescue the illustration (do this FIRST, the URL is temporary)

Download `https://8081-iixiz3cdkj2mml6qc6j8o-0a70b158.us2.manus.computer/notify-illustration.jpg` and save to `public/brand/email/notify-illustration.jpg`.

That host is an expiring Manus sandbox. If the download fails, STOP and report it — do not proceed with a hotlink to that URL, and do not substitute a different image.

Then:
1. Create a **public** Supabase Storage bucket `email-assets` if it doesn't exist.
2. Upload the file to it.
3. Confirm the public URL returns HTTP 200 in a private browser window.

Email clients cannot load `/public` relative paths — they need an absolute URL on a host that allows hotlinking. Supabase Storage is the target; the repo copy is the backup so the asset is never lost again.

---

## Step 2 — Update `src/lib/notify/lists.ts`

Set `illustrationUrl` on **all three** lists to the same Supabase Storage URL from step 1.

Set `illustrationAlt` on all three to:
```
A cheerful dog character throwing a paper plane into a mailbox
```

Update the body copy to match the approved designs exactly:

**`pmq-in-5-days-ai-pro`** — subject and heading unchanged. Body:
```
"You'll be the first to know when the AI Pro Bundle launches.",
"One email when it's ready. Nothing else.",
```

**`pfq-in-2-days`** — subject and heading unchanged. Body:
```
"We'll let you know as soon as PFQ in 2 Days launches.",
"One email when it's ready. Nothing else.",
```

**`newsletter`** — subject and heading unchanged. Body:
```
"You'll get new project management resources, AI insights, and course launches as they land.",
"You can leave any time from the link at the bottom of any email.",
```

---

## Step 3 — Add the sign-off to the template

All three designs end with a two-line sign-off before the footer:

```
All the best,
Sim Samaar Shened
```

Add this to `renderHtml` in `src/lib/notify/send-confirmation-email.ts` so it renders after the body paragraphs and before the footer, for every list. Do **not** add it as a body paragraph in `lists.ts` — it's template furniture, identical across all lists, and duplicating it three times invites drift.

Match the existing body-text styling; "All the best," and the name on separate lines.

---

## Step 4 — Fix the sender addresses

Four files hardcode `onboarding@resend.dev`, Resend's shared sandbox address, which only delivers to the Resend account owner. That is why confirmation emails never arrive.

Create `src/lib/notify/senders.ts`:

```ts
/**
 * Every Resend "from" address in one place.
 *
 * Read at call time, not module load: a module-level const would freeze the
 * value at boot and ignore Railway variable changes until a full rebuild.
 */
const DEFAULT_DOMAIN = "learnincurve.com";

function sender(label: string, mailbox: string): string {
  const domain = process.env.EMAIL_SENDING_DOMAIN ?? DEFAULT_DOMAIN;
  return `${label} <${mailbox}@${domain}>`;
}

export const notifyFrom   = () => process.env.NOTIFY_EMAIL_FROM ?? sender("Learn in Curve", "hello");
export const contactFrom  = () => sender("Learn in Curve contact", "hello");
export const feedbackFrom = () => sender("Learn in Curve feedback", "hello");
export const alertFrom    = () => sender("Learn in Curve alerts", "hello");
```

Replace the hardcoded constants:

| File | Constant to remove | Use instead |
|---|---|---|
| `src/lib/notify/send-confirmation-email.ts` | `DEFAULT_FROM` (~line 14) and the local `process.env.NOTIFY_EMAIL_FROM ?? DEFAULT_FROM` (~line 141) | `notifyFrom()` |
| `src/lib/notify/send-contact-email.ts` | `CONTACT_FROM` (~line 9) | `contactFrom()` |
| `src/lib/notify/send-feedback-email.ts` | `FEEDBACK_FROM` (~line 15) | `feedbackFrom()` |
| `src/lib/tutor/guest-budget-alert.ts` | `ALERT_FROM` (~line 17) | `alertFrom()` |

Do NOT change `CONTACT_TO` / `FEEDBACK_TO` (`simsamaarshened@gmail.com`). Those are correct.

---

## Step 5 — Verify

- `npm run build` passes clean.
- `grep -rn "onboarding@resend.dev" src/` returns **nothing**.
- The Supabase illustration URL loads in a private browser window.

**Do not deploy until `learnincurve.com` shows Verified in the Resend dashboard.** Until then this change makes things worse — sends will fail with a 422 unverified-domain error instead of only failing for non-owner recipients. Check first; if it isn't verified, commit but tell Sim to hold the deploy.

---

## Step 6 — Ship

```bash
git add -A
git commit -m "feat: shared notify illustration, approved copy, sign-off; fix Resend sender domain"
git push
```

The pre-commit hook bumps the site version by 0.1. Do not override it.

---

## Step 7 — Live test

Sign up via each of the three buttons using an address that is **not** the Resend account owner. Then:

```sql
select email, list_key, confirmation_sent_at
from waitlist_signups order by created_at desc limit 5;
```

`confirmation_sent_at` must be non-null on all three. Null means the send failed — check Resend's Logs tab for the reason.

## Report back

- Public Supabase URL of the illustration.
- Result of the `onboarding@resend.dev` grep.
- The three `confirmation_sent_at` values from the live test.
