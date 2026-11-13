/**
 * Weak-area lesson paths from a free mock result.
 *   node --experimental-strip-types --test tests/weak-area.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  weakAreaDestination,
  weakAreaLessonPath,
} from "../src/lib/free-mock/weak-area.ts";

const row = (n) => ({
  lo_number: n,
  lo_code: `LO${n}`,
  lo_title: "Topic",
  correct: 0,
  total: 2,
});

test("PMQ weakest row opens that learning objective", () => {
  assert.equal(
    weakAreaLessonPath("apm-pmq", row(12)),
    "/courses/pmq-in-5-days/lo/12",
  );
});

test("PFQ weakest row opens that objective", () => {
  assert.equal(
    weakAreaLessonPath("apm-pfq", row(4)),
    "/courses/pfq-in-2-days/learn/4",
  );
});

test("PMP domains have no lesson, so Mock Me is the fallback", () => {
  assert.equal(weakAreaLessonPath("pmp", row(1)), null);
  assert.equal(weakAreaDestination("pmp", row(1)), "/mock-me");
});
