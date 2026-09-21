import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { RELEASE_NOTES } from "../src/content/whats-new.ts";
import {
  MAX_BADGE_AGE_DAYS,
  newBadgeHrefs,
  newestUnseen,
  unseenNotes,
} from "../src/lib/whats-new/index.ts";

const SEEN_BEFORE = "2026-09-01T00:00:00.000Z";
const NOW = "2026-09-21T12:00:00.000Z";

test("a note published after seenAt is unseen; one published before is not", () => {
  const notes = [
    {
      id: "after",
      publishedAt: "2026-09-10",
      title: "After",
      body: "x",
      href: "/a",
      cta: "Go",
    },
    {
      id: "before",
      publishedAt: "2026-08-01",
      title: "Before",
      body: "x",
      href: "/b",
      cta: "Go",
    },
  ];
  const unseen = unseenNotes(notes, "2026-09-05T00:00:00.000Z", NOW);
  assert.deepEqual(
    unseen.map((n) => n.id),
    ["after"],
  );
});

test("a note older than MAX_BADGE_AGE_DAYS produces no badge href even when unseen", () => {
  const notes = [
    {
      id: "old",
      publishedAt: "2026-07-01",
      title: "Old",
      body: "x",
      href: "/library",
      cta: "Go",
      badgeHrefs: ["/library"],
    },
  ];
  // Still unseen relative to epoch, but older than the badge window from NOW.
  const hrefs = newBadgeHrefs(notes, SEEN_BEFORE, NOW);
  assert.deepEqual(hrefs, []);
  assert.ok(MAX_BADGE_AGE_DAYS === 30);
});

test("newestUnseen returns exactly one note when several are unseen, and the newest one", () => {
  const notes = [
    {
      id: "newer",
      publishedAt: "2026-09-18",
      title: "Newer",
      body: "x",
      href: "/library",
      cta: "Go",
    },
    {
      id: "older",
      publishedAt: "2026-09-14",
      title: "Older",
      body: "x",
      href: "/mock-me",
      cta: "Go",
    },
  ];
  const note = newestUnseen(notes, SEEN_BEFORE, NOW);
  assert.equal(note?.id, "newer");
});

test("newestUnseen still returns an old unseen note (age cap does not apply to the banner)", () => {
  const notes = [
    {
      id: "ancient",
      publishedAt: "2025-01-01",
      title: "Ancient",
      body: "x",
      href: "/library",
      cta: "Go",
      badgeHrefs: ["/library"],
    },
  ];
  // Seen long before the note; note is still unseen but outside the badge window.
  const note = newestUnseen(notes, "2024-06-01T00:00:00.000Z", NOW);
  assert.equal(note?.id, "ancient");
  assert.deepEqual(newBadgeHrefs(notes, "2024-06-01T00:00:00.000Z", NOW), []);
});

test("missing or malformed seenAt does not throw and treats the note as unseen", () => {
  const notes = RELEASE_NOTES;
  assert.doesNotThrow(() => unseenNotes(notes, undefined, NOW));
  assert.doesNotThrow(() => unseenNotes(notes, "not-a-date", NOW));
  assert.doesNotThrow(() => newestUnseen(notes, null, NOW));
  assert.doesNotThrow(() => newBadgeHrefs(notes, "", NOW));

  const fromMissing = unseenNotes(notes, undefined, NOW);
  const fromMalformed = unseenNotes(notes, "not-a-date", NOW);
  assert.ok(fromMissing.length >= 1);
  assert.ok(fromMalformed.length >= 1);
});

test("every badgeHrefs value in RELEASE_NOTES matches a real MENU_ITEMS href", () => {
  const menuSrc = readFileSync(
    new URL("../src/components/SiteHeaderMenu.tsx", import.meta.url),
    "utf8",
  );
  const block = menuSrc.match(
    /const MENU_ITEMS:[\s\S]*?= \[([\s\S]*?)\];/,
  );
  assert.ok(block, "could not find MENU_ITEMS in SiteHeaderMenu.tsx");
  const menuHrefs = [...block[1].matchAll(/href:\s*"([^"]+)"/g)].map(
    (m) => m[1],
  );
  assert.ok(menuHrefs.length > 0);

  for (const note of RELEASE_NOTES) {
    for (const href of note.badgeHrefs ?? []) {
      assert.ok(
        menuHrefs.includes(href),
        `badgeHrefs "${href}" on ${note.id} is not a MENU_ITEMS href`,
      );
    }
  }
});

test("every id in RELEASE_NOTES is unique and the array is sorted newest first", () => {
  const ids = RELEASE_NOTES.map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length);

  for (let i = 1; i < RELEASE_NOTES.length; i++) {
    const newer = Date.parse(RELEASE_NOTES[i - 1].publishedAt);
    const older = Date.parse(RELEASE_NOTES[i].publishedAt);
    assert.ok(
      newer >= older,
      `RELEASE_NOTES out of order at index ${i}: ${RELEASE_NOTES[i - 1].id} before ${RELEASE_NOTES[i].id}`,
    );
  }
});
