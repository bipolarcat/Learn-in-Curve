import assert from "node:assert/strict";
import test from "node:test";
import {
  authHrefWithNext,
  DEFAULT_AUTH_NEXT_PATH,
  getSafeNextPath,
} from "../src/lib/auth-next.ts";

test("accepts and preserves safe same-origin paths", () => {
  assert.equal(getSafeNextPath("/dashboard"), "/dashboard");
  assert.equal(
    getSafeNextPath("/courses/pmq-in-5-days/lo/4?stage=quiz&set=2#answer"),
    "/courses/pmq-in-5-days/lo/4?stage=quiz&set=2#answer",
  );
});

test("rejects external, protocol-relative, backslash, and malformed values", () => {
  const unsafeValues = [
    ["/dashboard", "/courses"],
    "https://example.com/steal",
    "//example.com/steal",
    "/\\example.com/steal",
    "/%5Cexample.com/steal",
    "/dashboard?bad=%E0%A4%A",
    "/dashboard%00",
  ];

  for (const value of unsafeValues) {
    assert.equal(getSafeNextPath(value), DEFAULT_AUTH_NEXT_PATH, value);
  }
});

test("rejects direct, nested, and encoded auth loops", () => {
  const authLoops = [
    "/auth",
    "/auth/sign-in",
    "/auth/sign-up?next=/dashboard",
    "/%61uth/callback",
    "/%2Fauth/sign-in",
  ];

  for (const value of authLoops) {
    assert.equal(getSafeNextPath(value), DEFAULT_AUTH_NEXT_PATH, value);
  }
});

test("builds auth links with one encoded validated destination", () => {
  assert.equal(
    authHrefWithNext("/auth/sign-in", "/courses/pmq?stage=learn"),
    "/auth/sign-in?next=%2Fcourses%2Fpmq%3Fstage%3Dlearn",
  );
  assert.equal(
    authHrefWithNext("/auth/callback", "https://example.com"),
    "/auth/callback?next=%2Fdashboard",
  );
});
