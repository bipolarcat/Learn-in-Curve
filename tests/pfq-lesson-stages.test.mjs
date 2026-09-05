/**
 * Guard: PFQ 5-stage list + legacy completed_at → all stages reached.
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  getPfqReachedStageIds,
  PFQ_STAGE_ORDER,
} from "../src/lib/pfq/lesson-stages.ts";

test("PFQ stage order is five stages with Apply before Drill", () => {
  assert.deepEqual(PFQ_STAGE_ORDER, [
    "orient",
    "learn",
    "apply",
    "drill",
    "checkpoint",
  ]);
});

test("legacy completed_at with null stage columns → all five stages", () => {
  assert.deepEqual(
    getPfqReachedStageIds({
      completed_at: "2026-09-03T13:02:12.377+00:00",
      orient_reached_at: null,
      learn_reached_at: null,
      apply_reached_at: null,
      quiz_completed_at: null,
    }),
    ["orient", "learn", "apply", "drill", "checkpoint"],
  );
});

test("partial timestamps without completed_at → only reached stages", () => {
  assert.deepEqual(
    getPfqReachedStageIds({
      orient_reached_at: "2026-09-05T00:00:00.000Z",
      learn_reached_at: null,
      apply_reached_at: null,
      quiz_completed_at: null,
      completed_at: null,
    }),
    ["orient"],
  );
});

test("drill without apply_reached_at infers Apply (mid-pathway insert)", () => {
  assert.deepEqual(
    getPfqReachedStageIds({
      orient_reached_at: "2026-09-05T00:00:00.000Z",
      learn_reached_at: "2026-09-05T00:01:00.000Z",
      apply_reached_at: null,
      quiz_completed_at: "2026-09-05T00:02:00.000Z",
      completed_at: null,
    }),
    ["orient", "learn", "apply", "drill"],
  );
});
