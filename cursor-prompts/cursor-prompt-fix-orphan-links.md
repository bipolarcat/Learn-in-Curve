# Cursor prompt, make soft-nav links real links

**Written 19 Aug 2026.** Small, high impact, do this before the new site ships.

**Style constraint:** no em dashes or en dashes in anything you write.

## Why

`src/components/library/LibrarySoftNavLink.tsx` renders a `<button type="button">` whose `onClick` calls `router.push(href)`. There is no anchor element and no `href` attribute in the output.

`src/app/(site)/library/page.tsx` uses that component for all eleven article listings and for the free mock exam link. So no crawler can follow those links. Ahrefs reported 13 orphan pages on 15 August, and Google Search Console shows 18 URLs stuck in "Discovered, currently not indexed". Fetching the live `/library` page confirms the article titles are returned as plain text while the header and footer links come back as real anchors.

It is also an accessibility defect. A button cannot be middle-clicked, opened in a new tab, or announced as a link by a screen reader, and it does not appear in a screen reader's link list.

The spinner-on-navigate behaviour these components exist to provide is worth keeping. It just has to sit on top of a real anchor rather than replace it.

## Task 1, audit the family

There are several components in this pattern, not one. Find every component that navigates via `router.push` inside an `onClick` and check whether it renders an anchor:

- `src/components/library/LibrarySoftNavLink.tsx`
- `src/components/FreeMockExamLink.tsx`
- `src/components/PmqStartLink.tsx`
- `src/components/pfq/PfqStartLink.tsx`
- `src/components/ExploreCoursesLink.tsx`
- `src/components/SoftNavBackLink.tsx`

Report which ones emit an `href` and which do not. Do not assume they are all broken and do not assume they are all fine.

## Task 2, fix the pattern

Rewrite the affected components so the rendered element is a `next/link` `<Link>` (or a plain `<a>`) carrying the real `href`, with the pending spinner layered on top.

`<Link>` already performs client-side navigation, so the soft-nav behaviour is preserved for free. To keep the spinner, use `useTransition` triggered from the link's `onClick` and render the spinner in place of the label while pending. Do not call `preventDefault` on the click unless you are certain the transition still navigates, because a link that does nothing when JavaScript is slow is worse than the current state.

Requirements for the fixed component:

- The `href` must be present in the server-rendered HTML. Verify with `curl` or by viewing source, not by looking at the browser inspector, which shows the hydrated DOM.
- Cmd-click, Ctrl-click and middle-click must open a new tab. That happens automatically with a real anchor as long as you do not swallow the event.
- Keep the existing `aria-busy` while pending, and keep a visible `:focus-visible` state.
- The accessible name must be the link text, not the busy label, when not pending.

## Task 3, internal linking on the library articles

Separate from the component fix, and the reason the fix matters.

`src/components/library/LibraryArticle.tsx` renders the article body. Add a related-links block at the end of each article, driven by data rather than hand-written per page: extend the page type in `src/content/library/types.ts` with an optional list of sibling slugs, populate two or three per page in `src/content/library/pages/*.ts`, and render them as real links.

Every article should also link to the free mock exam.

Do not invent relationships. Suggested pairings, for review before you write them in:

- `how-hard-is-apm-pmq` with `how-long-to-revise-for-apm-pmq` and `apm-pmq-pass-mark`
- `apm-pmq-vs-pmp` with `apm-pmq-vs-prince2` and `is-apm-pmq-worth-it`
- `apm-pmq-exam-format` with `apm-pmq-pass-mark`
- `apm-pmq-business-case`, `apm-pmq-risk-management` and `apm-pmq-stakeholder-management` with each other

## Task 4, title tag

`src/app/(site)/library/page.tsx` has the metadata title "Library APM PMQ — guides and exam prep | Learn in Curve". Change it to lead with the search term rather than the section name, for example "APM PMQ guides and exam prep | Learn in Curve". Note that the existing title contains an em dash, which also needs removing.

Do not put the new navigation label into any title tag, H1, URL or canonical.

## Do not

- Do not rename any route. `/library` and `/about` stay exactly as they are. The navigation label changes are display-only and must remain display-only.
- Do not change any canonical URL.
- Do not remove the spinner behaviour. It exists because navigation on a cold route is slow enough to feel broken without it.
- Do not touch `sitemap.ts` in this task beyond confirming it still resolves. It is already correct and simply needs deploying.

## Verify before you finish

Run the production build, then check the rendered HTML of `/library` from the server, not the browser DOM, and confirm eleven `<a href="/library/...">` elements are present. If they are not there in the server HTML, the fix has not worked regardless of how it behaves when clicked.

## Report back

Append to `BUSINESS_STATE.md`: which components were affected, which were already fine, how you preserved the spinner, and the count of anchors found in the server-rendered `/library` HTML before and after.
