# Cursor prompt — LIC-116: fix post-OAuth redirect to localhost:8080

## Context

Live bug on www.learnincurve.com. Signing in with Google dead-ended the browser on
`https://localhost:8080/dashboard`. Reproduced in desktop Chrome 2026-08-01.

Root cause: in a Next.js Route Handler, `new URL(request.url).origin` is the **internal**
host the container was reached on. Behind the Railway proxy that is `https://localhost:8080`,
not the public domain. `src/app/(site)/auth/callback/route.ts` built its post-login redirect
from that origin, so the redirect went to a dead address.

The PKCE code exchange itself succeeded before the bad redirect, which is why returning to
the site appeared to "sign you in on the second try" — the session cookie was already set.

Not a Supabase or Google config problem. Both verified correct:
- Supabase Site URL = `https://www.learnincurve.com`, redirect allow-list covers www + apex.
- Google OAuth client has one redirect URI (the Supabase callback) and one JS origin.

## Changes already made (uncommitted, in the working tree)

Claude wrote these. Review them, don't redo them.

1. **New file** `src/lib/site-origin.ts` — exports `getSiteOrigin(request: Request): string`.
   Resolution order:
   1. `NEXT_PUBLIC_SITE_URL` (preferred — deterministic, not client-controllable)
   2. `x-forwarded-host` + `x-forwarded-proto`
   3. `new URL(request.url).origin` (correct in local dev only)

   Env var is first on purpose: `x-forwarded-*` is spoofable if a proxy ever forwards it
   unfiltered, and this value feeds auth redirects.

2. `src/app/(site)/auth/callback/route.ts` — `origin` now comes from `getSiteOrigin(request)`.
   **This is the actual bug fix.**

3. `src/app/courses/pmq-in-5-days/[...path]/route.ts` — sign-in redirect, same bug class.

4. `src/app/api/notify/route.ts` — the `origin` passed to `sendNotifyConfirmationEmail`.
   Same bug class; this was putting `https://localhost:8080` links into waitlist
   confirmation emails.

5. `src/lib/supabase/middleware.ts` — both redirects, changed for consistency.

6. `.env.local` — added `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for dev.

## Your tasks

1. Review the diff for the six items above.
2. Run `npx tsc --noEmit`. Claude could not complete a full typecheck (sandbox shell timeout),
   so these edits are **not machine-verified**.
3. Run `npm run lint` and the Playwright suite.
4. Add a regression test: call the `/auth/callback` route handler with `host: localhost:8080`
   and `x-forwarded-host: www.learnincurve.com`, and assert the `Location` header host is
   `www.learnincurve.com`, not localhost. This is the exact failure that shipped to production,
   so it needs a test that would have caught it.
5. Commit. Suggested message:

   ```
   fix(auth): build post-OAuth redirects from canonical origin

   Route handlers see the proxy-internal host (localhost:8080 on Railway) in
   request.url, so the post-login redirect dead-ended there. Adds
   getSiteOrigin() and uses it for every server-side absolute URL.

   Fixes LIC-116
   ```

6. Do **not** deploy until Sim confirms `NEXT_PUBLIC_SITE_URL=https://www.learnincurve.com`
   is set in the Railway environment. The fix falls back to forwarded headers without it,
   but the env var is the deterministic path.

## Related

- **LIC-117** — `learnincurve.com/auth/sign-in` returns a bare "Not Found". The apex only
  redirects the root, not deep paths. Separate fix at the DNS/host layer, not in this repo.
- Check whether any waitlist confirmation emails already went out with `localhost:8080`
  unsubscribe links. An unsubscribe mechanism that doesn't work is a compliance problem,
  not just a broken link.
