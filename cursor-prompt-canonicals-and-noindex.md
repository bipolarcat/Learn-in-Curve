# Cursor prompt, canonicals and noindex after the link fix

**Written 19 Aug 2026.** Small follow-up to `cursor-prompt-fix-orphan-links.md`. Do it before requesting indexing in Search Console.

**Style constraint:** no em dashes or en dashes.

## Why

Turning the six soft-nav buttons into real anchors was correct and it worked. It also made three URLs crawlable that were previously invisible, because a crawler cannot follow a click handler. Those three now need handling.

The pattern to keep in mind: any component using `withSoftNavFrom` now emits a query string into the server HTML, and any destination it points at is now a followable link.

## Task 1, noindex the signup form

`src/app/courses/pmq-in-5-days/preview/page.tsx` renders `AuthDeskPanel` in sign-up mode. It exports no `metadata` at all.

`PmqStartLink` sends every signed-out visitor there, and that component sits behind "Enrol for Free" on the homepage, the PMQ overview page and the Starter Pack card. It is now, by internal link count, close to the most linked page on the site, and it is a form with no content.

Add page metadata with `robots: { index: false, follow: true }`. Keep `follow` true so link equity still passes through to `/courses/pmq-in-5-days`.

Also give it a `title`, because an untitled page shows a URL fragment in any surface that renders one.

Alternatively add `/courses/pmq-in-5-days/preview` to the disallow list in `src/app/robots.ts`. Prefer the meta robots approach: a disallowed URL can still be indexed from links alone, whereas `noindex` is honoured.

While you are there, check whether `/pfq/preview` needs the same. It is already in the robots disallow list, so confirm whether it also needs `noindex` for the same reason.

## Task 2, self-referencing canonicals

Two pages are reachable both with and without a query string and have no canonical:

- `src/app/courses/page.tsx` has no `alternates.canonical`. `ExploreCoursesLink` hardcodes `/courses?from=home`, which is now the anchor in the homepage hero, while `sitemap.ts` lists the clean `/courses`.
- `src/app/courses/pmq-in-5-days/pricing/page.tsx` has no `alternates.canonical` and accepts `?intent=pro`.

Add a self-referencing canonical to the clean path on both, following the pattern already used correctly in `src/app/(site)/free-mock-exam/page.tsx`.

Then audit the rest: any page that reads `searchParams` and can therefore be reached at more than one URL needs a canonical pointing at the clean path. `parseSoftNavFrom` and `parseFreeMockSoftNavFrom` are the fastest way to find them.

## Task 3, sitemap consistency

`sitemap.ts` includes `/pfq/pricing` but not `/courses/pmq-in-5-days/pricing`. Decide which is right and make both courses consistent. Either both pricing pages are indexable and in the sitemap, or neither is.

## Do not

- Do not `noindex` anything in the library, on the course overview pages, or on `/free-mock-exam`. Those are the pages you want ranking.
- Do not remove the `?from=` parameters. They drive the back-link behaviour on the destination pages. The canonical is the fix, not stripping the parameter.
- Do not add `rel="nofollow"` to internal links. It does not do what people think it does and it wastes the internal linking you just fixed.

## Verify

For each page you touch, check the server-rendered HTML contains exactly one `<link rel="canonical">` pointing at the clean path, and that the preview page contains `<meta name="robots" content="noindex, follow">`. Check with curl or view-source, not the browser inspector.

## Report back

Append to `BUSINESS_STATE.md`: which pages gained canonicals, which gained noindex, the outcome of the searchParams audit, and the sitemap decision on the two pricing pages.
