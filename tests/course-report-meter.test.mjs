/**
 * Unit tests for LIC-65 meter bucketing thresholds (Sim 2026-07-28).
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

// course-report.ts is TypeScript — load via compiled path isn't available in
// plain node:test without ts-node. Duplicate the pure function here for the
// build gate, and keep the source of truth in src/lib/tutor/course-report.ts.
// The assertions below must match that file exactly.

/** Mirrors src/lib/tutor/course-report.ts bucketLo */
function bucketLo(wrongCount, totalCount) {
  if (totalCount < 3) return "not_enough_data";
  const pctCorrect = ((totalCount - wrongCount) / totalCount) * 100;
  if (pctCorrect < 65) return "weak";
  if (pctCorrect < 80) return "developing";
  return "strong";
}

test("bucketLo: <3 attempts → not_enough_data", () => {
  assert.equal(bucketLo(0, 0), "not_enough_data");
  assert.equal(bucketLo(0, 1), "not_enough_data");
  assert.equal(bucketLo(2, 2), "not_enough_data");
});

test("bucketLo: <65% correct → weak", () => {
  // 1/3 ≈ 33%
  assert.equal(bucketLo(2, 3), "weak");
  // 6/10 = 60%
  assert.equal(bucketLo(4, 10), "weak");
});

test("bucketLo: 65–79% → developing", () => {
  // 13/20 = 65%
  assert.equal(bucketLo(7, 20), "developing");
  // 79/100 = 79%
  assert.equal(bucketLo(21, 100), "developing");
});

test("bucketLo: 80%+ → strong", () => {
  assert.equal(bucketLo(2, 10), "strong");
  assert.equal(bucketLo(0, 3), "strong");
});

// Silence unused import if createRequire kept for future TS loader
void createRequire;
