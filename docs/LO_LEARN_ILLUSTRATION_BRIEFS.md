# LO Learn — illustration briefs (Nano Banana / Gemini)

Udemy-inspired soft educational illustrations in LIC palette. Same stamp-frame treatment as Orient (`LoOrientStage` → `ArtFrame`). Until assets land, `LoLearnStage` shows SVG icon placeholders in matching frames.

## Target assets

| Panel | Filename | Path |
|---|---|---|
| Key definitions | `lo-learn-definitions.jpg` | `public/brand/inspo/lo-learn-definitions.jpg` |
| Core content | `lo-learn-core.jpg` | `public/brand/inspo/lo-learn-core.jpg` |

**Aspect:** 1:1 · **Target:** 1024×1024 · **Use:** 56–64px square frames (mobile → `sm`), matching Orient.

## Palette (from DESIGN.md)

- ink `#241A12` · cream `#F4E9D6` · paper `#FBF3E1` · sand `#E8CE93`
- orange `#D5501F` · gold `#D9A441` · teal `#1B6560` · olive `#5F7A3D`

## Anti-references

- Udemy brand purple / indigo
- Mid-century travel-poster postage look
- Duolingo confetti / cute mascots
- Photoreal photography, laptop UI chrome, tiny illegible text
- Dictionary page / dense wall of micro-type

## Shared constraints

Udemy-inspired soft educational illustration · rounded shapes · soft ambient shadow · LIC hex palette only · square 1:1 · silhouette readable at 64–144px.

---

### A — Key definitions

**Filename:** `lo-learn-definitions.jpg`

```
Udemy-style soft educational illustration, square crop, modern flat with
gentle soft-3D feel. A soft cream (#F4E9D6) glossary card / open
terminology booklet on a desk, with three short floating word chips —
orange (#D5501F) accent chip, teal (#1B6560) underline chip, olive
(#5F7A3D) check chip — meaning “the words you’ll need for this lesson.”
Warm sand (#E8CE93) blobs, soft ink (#241A12) outlines, quiet gold
(#D9A441) spark accents. Generous empty margin, soft drop shadow.
No readable words, no Udemy logo, no purple, no photoreal faces, no
dense dictionary text. Clear silhouette readable at 64px.
```

### B — Core content

**Filename:** `lo-learn-core.jpg`

```
Udemy-style soft educational illustration, square crop, modern flat with
gentle soft-3D feel. A short stack of soft rounded lesson panels / study
sheets on cream (#F4E9D6), the top sheet slightly offset, with an orange
(#D5501F) “active” node and a teal (#1B6560) progress underline —
meaning “what to take in for this learning objective.” Soft ink (#241A12)
outlines, sand (#E8CE93) shapes, subtle gold (#D9A441) accents, soft
drop shadow. No readable body text, no Udemy branding, no purple
gradients, no mascot animals, no photoreal. Crisp for a 64px stamp
thumbnail.
```

## Drop-in (when assets exist)

In `LoLearnStage.tsx`, replace `ArtPlaceholder` with Orient’s `Image`-based `ArtFrame` pattern pointing at the paths above (same sizes / border / sticker shadow).
