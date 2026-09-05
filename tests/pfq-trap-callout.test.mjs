/**
 * Guard: trap callout priority and tag→module map.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { resolveTrapCallout } from "../src/lib/pfq/trap-callout.ts";
import { TRAP_TAG_TO_MODULE } from "../src/lib/pfq/trap-tags.ts";

test("TRAP_TAG_TO_MODULE has three tags and no absolutes", () => {
  assert.deepEqual(Object.keys(TRAP_TAG_TO_MODULE), [
    "near_miss",
    "negative_stem",
    "multi_select",
  ]);
  assert.equal("absolutes" in TRAP_TAG_TO_MODULE, false);
});

test("PFQP-7-7-2 dual tags resolve to near_miss only", () => {
  const callout = resolveTrapCallout(["negative_stem", "near_miss"]);
  assert.ok(callout);
  assert.equal(callout.tag, "near_miss");
  assert.equal(callout.moduleId, "near_miss");
  assert.match(callout.href, /#near_miss$/);
});

test("correct-answer path: empty/null traps yield no callout", () => {
  assert.equal(resolveTrapCallout([]), null);
  assert.equal(resolveTrapCallout(null), null);
  assert.equal(resolveTrapCallout(undefined), null);
});

test("single negative_stem maps to negative module", () => {
  const callout = resolveTrapCallout(["negative_stem"]);
  assert.ok(callout);
  assert.equal(callout.moduleId, "negative");
});
