# Learn in Curve, search visibility: what is wrong and what to do

**Written 19 Aug 2026.** Built from the Search Console page-indexing report, the Ahrefs crawl of 15 Aug, the live site, and the repo.

## The headline

Your library articles are not linked to. Not "poorly linked". Not linked at all.

`src/components/library/LibrarySoftNavLink.tsx` renders a `<button type="button">` with an `onClick` that calls `router.push(href)`. There is no `<a href>` anywhere in it. `/library` uses that component for all eleven article listings and for the free mock exam link at the bottom.

A search crawler cannot follow a click handler. So from Google's point of view, and Ahrefs', those eleven pages have zero incoming internal links. That is exactly the "13 URLs" in the Ahrefs orphan-page alert, and it is almost certainly why 18 pages sit in "Discovered, currently not indexed".

I verified this three ways: reading the component, reading `library/page.tsx`, and fetching the live `/library` page, which returns the article titles as plain text while the header and footer links come back as real anchors.

This also breaks middle-click, open-in-new-tab, and screen reader link navigation, so it is an accessibility defect as well as an SEO one.

**Fix this before anything else.** Everything else on this page is worth doing and none of it matters as much.

## Is now a good time to make changes?

Yes, and it is the best window you will get. Three reasons.

**Your data is four days old.** Search Console emailed you on 17 August confirming it began collecting impressions on 15 August. There is no history to protect and no baseline to disturb.

**One page is indexed.** You have essentially nothing to lose from churn. The cost of changing things rises sharply once pages rank; right now it is near zero.

**You are about to ship a new site and more content.** Fixing the linking pattern first means the new Shelf pages inherit a working pattern instead of joining the orphan pile. Ship the fix, then the content.

The thing you should not do is judge results yet. Four days of impressions tells you nothing, and "Discovered, currently not indexed" on a domain this new is normal even when everything is correct. Give it eight to twelve weeks after the fixes before reading anything into the numbers.

## The renames: you have done this the right way, keep it that way

I checked. The route folders in `src/app/(site)/` are still `about` and `library`, and the live navigation still shows Library and About, so what you have changed is the visible label rather than the URL.

**Keep the URLs as `/library` and `/about`.** Do not move them to `/the-shelf` and `/behind-the-curve`. The reasons:

- You would reset crawl history on twelve URLs Google has only just discovered.
- Every one would need a 301, adding to a "Page with redirect" count that is already at three, plus Ahrefs is already flagging a 3XX redirect inside your sitemap.
- `sitemap.ts` hardcodes `/about` and `/library`, and `library/page.tsx` hardcodes its canonical as `${SITE_URL}/library`. Both would need changing in step or you would be publishing contradictory signals.
- There is no search benefit. Nobody searches "the shelf". `/library` is the more descriptive slug and descriptive slugs are the ones that help.

The split you want is: brand language in the navigation, descriptive language in the title tag, H1 and URL. You already have that. `/library` with an H1 of "APM PMQ guides" and a nav label of "The Shelf" is a good arrangement, not a compromise.

One thing to change with the labels: the page title still reads "Library APM PMQ, guides and exam prep". Reword that to lead with what people search for, something like "APM PMQ guides and exam prep". Keep "The Shelf" out of title tags entirely.

## What the Search Console numbers actually mean

**Discovered, currently not indexed (18).** Google knows the URL exists, usually from your sitemap, but has not spent crawl budget on it. On a new domain this almost always means low site authority combined with no internal links pointing at the page. The orphan fix attacks this directly. This is your biggest bucket and your most fixable one.

**Crawled, currently not indexed (5).** Google fetched the page and decided not to index it. Different problem, usually thin content, near-duplicate content, or weak quality signals. Use URL Inspection on these five individually to see which they are. If they turn out to be `/privacy`, `/terms`, `/cookies` and similar, ignore it, those pages have no business ranking.

**Page with redirect (3), source Website.** These are your own redirects, not Google's decision. Combined with Ahrefs reporting four 3XX redirects and one inside the sitemap, it is worth finding them. The usual culprits are www against non-www, or a trailing slash inconsistency.

## Your production sitemap is behind your code

The live sitemap at `www.learnincurve.com/sitemap.xml` serves 23 URLs. Your local `src/app/sitemap.ts` generates 26, because it now includes `/pmq`, `/pfq` and `/pfq/pricing`. Those three additions have not been deployed.

That means your two course landing pages are currently absent from the sitemap and, per the orphan report, likely under-linked as well. Deploying is the whole fix.

## The rest of the Ahrefs findings, in priority order

| Issue | Count | Why it matters | Effort |
|---|---|---|---|
| Orphan pages | 13 | Blocks indexing. The main event. | Small, one component |
| Missing alt text | 22 | Accessibility, plus you have 78 diagrams that could earn image search traffic | Medium |
| Open Graph tags incomplete | 13 | Every share on LinkedIn renders without a preview card, which kills click-through on your main distribution channel | Small |
| 3XX redirect in sitemap | 1 | A sitemap should only contain final URLs | Small |
| Meta description too short | 9 | Weak snippets in results | Small |
| Meta description too long | 4 | Truncated snippets | Small |
| Title too long | 1 | Truncated in results | Trivial |

The Open Graph one deserves more weight than its position suggests. LinkedIn is your main channel, and a post with no preview image gets materially fewer clicks than one with. Thirteen pages sharing badly is a distribution problem, not a tidiness problem.

## Internal linking, beyond the button fix

Fixing the component gives every library page one incoming link, from the hub. That is the minimum, not the goal.

Each library page should link to two or three sibling pages in its own body copy, and to the free mock. Right now they are eleven islands connected to one hub. A cluster where the pages reference each other is what tells Google the topic is covered in depth rather than that eleven unrelated pages happen to exist.

Concretely: "How hard is the APM PMQ" should link to "How long to revise" and "APM PMQ pass mark". "PMQ vs PMP" should link to "PMQ vs PRINCE2" and "Is the PMQ worth it". You have the content already, it needs the wiring.

## After the fixes, in Search Console

1. Resubmit the sitemap once the deploy is live, so Google refetches it.
2. Use URL Inspection and Request Indexing on the eleven library pages, one at a time. It is manual and slightly tedious and it does work for a site this small.
3. Set a reminder to look again in eight weeks, not before.

## On the marketing strategy, and one thing to reconsider

Your own `PMP_COURSE_DECISION.md` already set the rule: 250 or more organic sessions a week to the Library, and the free mock converting at 30% or better to email. That is still the right test and nothing here changes it. What this report changes is that you were never going to hit those numbers, because the pages could not be indexed.

So the sequence is: fix the links, deploy, publish more Shelf pages, then read the numbers in the autumn.

**The thing to reconsider is releasing more free mock exams.** You currently have a 15-question free readiness check as the lead magnet, and separately Mock Exam 1 free inside the course with Exams 2 and 3 as the Pro Bundle. More free full mock papers would be giving away the main thing Pro sells. Pro's entire increment over Starter is more questions, more mocks, and the video and audio overviews. Remove the mocks from that and you are asking people to pay for media overviews.

If you want more top-of-funnel, add more short readiness checks in the style of the 15-question one, or make them topic-specific, for example a 10-question risk management check that links to the risk management library page. Those are lead magnets. Full 40-question papers are product.

## What I would do this week

1. Replace the soft-nav button pattern with real links, at minimum on `/library`.
2. Deploy, so the sitemap gains `/pmq`, `/pfq` and `/pfq/pricing`.
3. Add Open Graph images and complete tags across the thirteen pages missing them.
4. Add two or three sibling links inside each library article.
5. Resubmit the sitemap and request indexing on the eleven article URLs.

Everything else can wait for the new site.
