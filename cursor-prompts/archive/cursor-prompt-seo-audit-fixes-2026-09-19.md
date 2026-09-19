# Cursor prompt: SEO audit fixes before the 2026-09-20 deploy

Source: Ahrefs site audit, 19 Sep 2026. Health score 93, 7 errors, 28 warnings.
Scope: technical SEO hygiene only. Do NOT touch pricing logic, course content,
the Mock Me redesign, or the library redesign. Those are separate work.

All paths are relative to the repo root.

---

## 1. Root layout: add metadataBase, Open Graph and Twitter defaults

File: `src/app/layout.tsx`

Only 8 of 38 files that export metadata define `openGraph`. The root layout has
none, so 13 pages ship incomplete OG tags. Next.js inherits `openGraph` from the
root layout, so fixing it here fixes most of them at once.

Add to the existing `export const metadata: Metadata`:

- `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.learnincurve.com")`
- `openGraph` with `type: "website"`, `siteName: "Learn in Curve"`, `locale: "en_GB"`,
  `url: "/"`, plus `title` and `description` matching the existing root values,
  and `images: [{ url: "<OG image>", width: 1200, height: 630, alt: "Learn in Curve" }]`
- `twitter` with `card: "summary_large_image"` and the same title, description and image

**OG image:** check whether `public/brand/` already holds a 1200x630 share image.
If it does not, create one at `public/brand/og/og-default.png` (1200x630, under
200KB) using the existing brand palette and the Learn in Curve wordmark. Do not
reuse a 7MB source image for this.

Then, for each of the 8 pages that already define their own `openGraph`, confirm
they still resolve correctly against `metadataBase` (relative image URLs are now
allowed). Do not duplicate what the root now inherits.

## 2. Meta descriptions: missing

These public, indexable pages export metadata with a title but no `description`.
Write one for each, 130 to 155 characters, natural language, no keyword stuffing:

- `src/app/(site)/privacy/page.tsx`
- `src/app/(site)/terms/page.tsx`
- `src/app/(site)/cookies/page.tsx`
- `src/app/(site)/careers/page.tsx`
- `src/app/(site)/recruitment-privacy/page.tsx`

## 3. Meta descriptions: too short

Ahrefs flags anything under 110 characters. Rewrite these to 130 to 155
characters, keeping the existing voice (see `VOICE_GUIDE.md`):

- `src/app/(site)/about/page.tsx` (currently 82 chars)
- `src/app/(site)/contact/page.tsx` (currently 76 chars)
- `src/app/courses/page.tsx` (currently 63 chars)

## 4. Meta description: too long

- `src/app/(site)/pmq/page.tsx` is 206 characters and gets truncated in results.
  Cut to 150 to 158 characters. Keep the "application exam, not a memory test"
  angle, it is the strongest line in it.

Then sweep every other public page's description and bring anything over 160
characters down to 155 or less. Ahrefs flagged 4 in total.

## 5. Title too long

One page has a title over 60 characters. Find it (most likely a
`src/content/library/` entry surfaced through
`src/app/(site)/library/[slug]/page.tsx`) and trim it to 55 to 60 characters
including the " | Learn in Curve" suffix.

## 6. Canonical URLs

Most pages already set `alternates.canonical`. These public, indexable pages do
not. Add a self-referencing canonical to each, following the existing pattern
(`${SITE_URL}<path>`):

- `src/app/(site)/page.tsx` (home)
- `src/app/(site)/about/page.tsx`
- `src/app/(site)/contact/page.tsx`
- `src/app/courses/pmq-in-5-days/page.tsx`
- `src/app/(site)/privacy/page.tsx`
- `src/app/(site)/terms/page.tsx`
- `src/app/(site)/cookies/page.tsx`
- `src/app/(site)/careers/page.tsx`
- `src/app/(site)/recruitment-privacy/page.tsx`

## 7. Images: delete unreferenced duplicates in public/brand/inspo

**Read this carefully. `public/brand/inspo/` IS used in production.** It is
referenced from `src/app/(site)/about/page.tsx`, `src/components/SlyTutorWindow.tsx`,
`src/components/GuestSlyPanel.tsx`, `src/components/SlyMacConsole.tsx`,
`src/components/HeroPmqMacDemo.tsx`, `src/components/pmq/AiTutorPanel.tsx` and
`src/lib/pmq/hero-assets.ts`. Do not delete the folder.

Note that `src/lib/pmq/hero-assets.ts` picks a hero rendering mode using
`fs.existsSync` on `hero-sky-clouds.png`, `hero-plane.png`, `hero-prop.png`,
`hero-flight-wide.png` and `hero-flight.png`. Deleting any of those silently
changes the homepage hero. Leave them in place.

Delete only these, which are duplicate or orphaned artefacts with no reference
anywhere in `src/` (roughly 40MB):

```
public/brand/inspo/about-goal.png.jpg
public/brand/inspo/about-values.png.jpg
public/brand/inspo/about-vision.png.jpg
public/brand/inspo/check-in-wide.png.jpg
public/brand/inspo/lo-orient-context.jpg.jpg
public/brand/inspo/lo-orient-outcomes.jpg.jpg
public/brand/inspo/hero-takeoff-plane.svg.svg
public/brand/inspo/hero-takeoff-runway.svg.svg
public/brand/inspo/course-page-van-2.jpg
public/brand/inspo/Generated
public/brand/inspo/Untitled
public/brand/inspo/Sing
public/brand/inspo/hero
public/brand/inspo/mac
public/brand/inspo/course-page-van
public/brand/inspo/lo-orient-outcomes
```

Before deleting each one, grep `src/` for its basename to confirm zero hits.
If any has a hit, keep it and say so in your report.

## 8. Images: compress the referenced heavy ones in place

Same filenames, same paths, just smaller. Target under 300KB each, visually
identical at the sizes they render. Convert to WebP and update the references
only where the file is referenced by a literal string (not where
`hero-assets.ts` does an existence check on a `.png`).

| File | Current | Referenced from |
| --- | --- | --- |
| `public/brand/inspo/about-goal.jpg` | 7.6MB | about page |
| `public/brand/inspo/about-values.jpg` | 7.4MB | about page |
| `public/brand/inspo/about-vision.jpg` | 6.3MB | about page |
| `public/brand/inspo/sly-empty.jpg` | 6.8MB | check refs, delete if orphaned |
| `public/brand/inspo/lo-orient-context.jpg` | 5.9MB | check refs |
| `public/brand/inspo/lo-orient-outcomes.jpg` | 5.6MB | check refs |
| `public/brand/inspo/check-in-wide.png` | 3.3MB | check refs |
| `public/brand/inspo/hero-flight-wide.png` | 3.0MB | hero, keep filename |
| `public/brand/auth/sign-up-fox-transparent.webp` | 3.0MB | `src/components/AuthDeskScene.tsx` |
| `public/brand/inspo/thumbs-up.png` | 1.1MB | `AiTutorPanel.tsx`, needs transparency |
| `public/brand/inspo/thumbs-down.png` | 1006KB | `AiTutorPanel.tsx`, needs transparency |
| `public/brand/inspo/hero-plane.png` | 730KB | hero, keep filename and transparency |
| `public/brand/Courses/pmq-in-5-days.jpg` | 669KB | course card |

Also confirm every one of these renders through `next/image` with explicit
`width`/`height` (or `fill` plus `sizes`). Flag any that use a bare `<img>`.

The 3MB fox sits in the signup flow, so it is the one that most directly costs
conversions. Do that one first.

## 9. Sitemap: stop claiming every page changed on every deploy

File: `src/app/sitemap.ts`

`const lastModified = new Date()` sets every static entry's `lastModified` to
build time. Every deploy therefore tells Google that all 19 static pages just
changed, which devalues the signal.

Replace it with a hand maintained map of real dates per path, or drop
`lastModified` from the static entries entirely. Keep the library entries as
they are, since those use `page.updatedAt`, which is correct.

## 10. Sitemap: one entry returns a 3XX

Ahrefs found 1 redirecting URL in the sitemap. Check each of the 19 static paths
in `src/app/sitemap.ts` against the redirect rules in `next.config.ts`
(`/pfq`, `/pfq/:path*`, `/free-mock-exam`) and in `middleware.ts`
(`redirectLegacyPfq`), plus any auth or entitlement gate that returns a redirect
for a signed out visitor. Replace the offending path with its final destination.
Report which one it was.

## 11. Internal links pointing at redirects (4 flagged)

Confirmed so far:

- `src/components/pmq/PmqOverviewSections.tsx:192` uses `href="/free-mock-exam"`,
  which 301s to `/free-mock-exam/apm-pmq`. Point it straight at the destination.

Find the other three. Grep the whole of `src/` for `href="/pfq`, `href="/pfq/`,
`href="/free-mock-exam"` and any other path that matches a redirect rule, in
`.tsx`, `.ts`, and in the library content under `src/content/`. Update each to
the final URL. Leave the redirect rules themselves in place, they still protect
external inbound links.

## 12. Verify the noindex pages are deliberate

Ahrefs flagged 2 noindex pages. From the code these look intentional:
`/lab`, `/dashboard/account`, the `/free-mock-exam` hub, and the PFQ and PMQ
`preview`, `learn`, `mock`, `practice` and `trap-school` routes.

Confirm that **no** page that should rank is noindexed. Specifically check that
`/`, `/pmq`, `/mock-me`, `/library`, `/library/[slug]` (where
`indexable === true` and no TODO_COPY), `/courses`, `/courses/pmq-in-5-days`,
`/courses/pmq-in-5-days/pricing`, `/courses/pfq-in-2-days`,
`/courses/pfq-in-2-days/pricing`, `/free-mock-exam/apm-pmq`,
`/free-mock-exam/apm-pfq` and `/free-mock-exam/pmp` are all indexable.
Report anything that is not. Change nothing unless something is wrong.

---

## Also, while you are in here

Sim is changing PMQ Pro Bundle from £8 to £15 and AI Pro from £15 to £25 in the
same release. Grep every `metadata` block, OG description and JSON string for a
hardcoded price (`£8`, `£15`, `£25`, `8.00`, `15.00`) and make sure prices in
metadata come from the pricing constants, not a literal. A stale price in a meta
description is a consumer protection problem, not just an SEO one.

## Constraints

- Do not bump `SITE_VERSION` manually, the pre-commit hook handles it.
- Do not run any Supabase migration. Nothing here touches the database.
- No new dependencies unless an image tool is genuinely needed, and say so first.

## Report back

For each of the 12 items: what you changed, file by file. Plus:

1. Which sitemap path was the 3XX (item 10).
2. Which 4 internal links you fixed (item 11).
3. Which files you deleted and the total MB saved (item 7).
4. Before and after size of each compressed image (item 8).
5. Anything in item 12 that was wrong.
6. Confirmation that `npm run build` passes and `/`, `/about`, `/pmq`,
   `/courses/pmq-in-5-days` and the signup page all render correctly locally.
