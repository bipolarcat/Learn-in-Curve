# Antigravity task — render v2 diagrams + migrate v2 content live

Repo: `Learn in Curve`. Do all of this in one pass, in order. Do not refactor anything outside the files named.

## Already done (do not redo)

- 24 diagram SVGs are already copied to `public/diagrams/v2/<diagram-id>.svg`.
- `content/v2/lo*.json` diagram entries already have `file`, `width: 1024`, `height: 705` populated for those 24. Entries still showing `"file": null` are intentionally unplaced — skip them, render nothing.

## 1. Build the figure component

Create `src/components/content/DiagramFigure.tsx`.

Requirements — keep it simple, one box, nothing else:

- One bordered box, cream background, containing the image, with a small italic caption underneath inside the same box.
- Background must use the existing cream token, not a hardcoded hex: `bg-cream` (defined via `--cream-rgb` in `src/app/globals.css`). This makes it dark-mode-correct automatically.
- **Fixed size, not full width.** Every v2 diagram is 1024×705 (ratio 1.4525). Cap at `max-width: 620px` on desktop and centre the box. Reserve the aspect ratio so there is no layout shift while the SVG loads. Below 620px viewport, let it shrink fluidly to 100% width.
- Caption: small, italic, muted. Format `Figure {figure_number} — {caption}`.
- `alt` comes from the JSON `alt` field. Never render an empty alt.
- Use `next/image` with `width={1024} height={705}` (or a plain `<img>` with explicit width/height attributes — either is fine, but the intrinsic dimensions must be set so the browser reserves space).

```tsx
type DiagramFigureProps = {
  src: string;          // e.g. "/diagrams/v2/lo4-swot.svg"
  alt: string;
  caption: string;
  figureNumber: string; // e.g. "4.2"
};
```

Structure:

```
<figure class="mx-auto my-8 w-full max-w-[620px] rounded-lg border border-ink/10 bg-cream p-4">
  <img ... class="block w-full h-auto" />
  <figcaption class="mt-3 text-center text-sm italic text-ink/60">
    Figure {figureNumber} — {caption}
  </figcaption>
</figure>
```

## 2. Wire it into the lesson renderer

In whichever component renders `lessons_v2.body` / v2 lesson content:

- For each diagram entry with a non-null `file`, render `<DiagramFigure>` immediately after the heading named in its `heading` field (`placement: "after_heading"`).
- If `file` is null, render nothing at all — no placeholder, no empty box.

## 3. Migrate to Supabase

The migration script already exists. Run staging first, verify, then live:

```bash
node scripts/migrate-v2-content.mjs --all --target staging
```

Verify row counts land in `sections_v2` / `lessons_v2` and that diagram entries survived into `lessons_v2.body`. Then:

```bash
node scripts/migrate-v2-content.mjs --all --target live
```

`--target live` overwrites `lessons.body` and is immediately visible to learners. Confirm `content-snapshots/v1-content-*.json` exists before running it — that is the rollback. If it does not exist, stop and say so.

## 4. Ship

```bash
npm run build     # must pass clean before deploying
git add -A
git commit -m "feat: render v2 diagrams in cream figure box; migrate v2 content live"
git push
```

The pre-commit hook auto-bumps the site version by 0.1. Do not override it.

## Report back

- Confirm build passed.
- Confirm the 24 diagrams render at fixed 620px, not full width, on desktop.
- Paste the live/staging row counts from the migration output.
