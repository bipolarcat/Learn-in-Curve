import assert from "node:assert/strict";
import test from "node:test";
import {
  isInternalEmail,
  normalizeEmailForCompare,
} from "../src/lib/email/internal.ts";

const previousFounders = process.env.INTERNAL_EMAIL_FOUNDERS;
const previousDomains = process.env.INTERNAL_EMAIL_DOMAINS;

test.afterEach(() => {
  if (previousFounders === undefined) delete process.env.INTERNAL_EMAIL_FOUNDERS;
  else process.env.INTERNAL_EMAIL_FOUNDERS = previousFounders;
  if (previousDomains === undefined) delete process.env.INTERNAL_EMAIL_DOMAINS;
  else process.env.INTERNAL_EMAIL_DOMAINS = previousDomains;
});

test("plus-tag is stripped before compare", () => {
  assert.equal(
    normalizeEmailForCompare("SimSamaarShened+news@gmail.com"),
    "simsamaarshened@gmail.com",
  );
});

test("test. local-part prefix is internal", () => {
  delete process.env.INTERNAL_EMAIL_FOUNDERS;
  delete process.env.INTERNAL_EMAIL_DOMAINS;
  assert.equal(isInternalEmail("test.anything@gmail.com"), true);
  assert.equal(isInternalEmail("test.aipro.foo@gmail.com"), true);
  assert.equal(isInternalEmail("TEST.news@Gmail.com"), true);
  assert.equal(isInternalEmail("test.foo+bar@gmail.com"), true);
});

test("seed founder addresses are internal, including +tag variants", () => {
  delete process.env.INTERNAL_EMAIL_FOUNDERS;
  delete process.env.INTERNAL_EMAIL_DOMAINS;
  assert.equal(isInternalEmail("simsamaarshened@gmail.com"), true);
  assert.equal(isInternalEmail("simsamaarshened+news@gmail.com"), true);
  assert.equal(isInternalEmail("sim.samaar@yahoo.in"), true);
  assert.equal(isInternalEmail("sim.samaar@yahoo.com"), true);
});

test("a normal address is not internal", () => {
  delete process.env.INTERNAL_EMAIL_FOUNDERS;
  delete process.env.INTERNAL_EMAIL_DOMAINS;
  assert.equal(isInternalEmail("pintodenver@yahoo.co.in"), false);
  assert.equal(isInternalEmail("rachelshrigley1@gmail.com"), false);
  assert.equal(isInternalEmail("not-a-test@gmail.com"), false);
});

test("configured internal domain matches", () => {
  process.env.INTERNAL_EMAIL_FOUNDERS = "";
  process.env.INTERNAL_EMAIL_DOMAINS = "learnincurve.test, @lic.internal";
  assert.equal(isInternalEmail("anyone@learnincurve.test"), true);
  assert.equal(isInternalEmail("anyone@lic.internal"), true);
  assert.equal(isInternalEmail("simsamaarshened@gmail.com"), false);
});
