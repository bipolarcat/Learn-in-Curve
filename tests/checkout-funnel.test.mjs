/**
 * Checkout return URLs and the PostHog person join.
 *   node --experimental-strip-types --test tests/checkout-funnel.test.mjs
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  CHECKOUT_SESSION_PLACEHOLDER,
  anonDistinctIdForReturn,
  buildCheckoutReturnUrl,
  checkoutAnalyticsMetadata,
  checkoutAppOrigin,
  interpretCheckoutReturn,
  resolveCheckoutPerson,
  searchWithoutAnonId,
} from "../src/lib/analytics/checkout-return.ts";
import {
  isLiveAnalyticsHostname,
  isLiveAnalyticsOrigin,
} from "../src/lib/analytics/live-host.ts";
import { purchaseCompletedFromCheckoutSession } from "../src/lib/analytics/purchase.ts";

const REF = "11111111-2222-4333-8444-555555555555";
const USER = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const ANON = "anonDistinctId123";
const PMQ_COURSE_ID = "3b6e12c0-321f-41b2-8536-db39f5678301";

test("success and cancel URLs are different, and only success asks Stripe for the session id", () => {
  const origin = "https://www.learnincurve.com";
  const success = buildCheckoutReturnUrl(origin, {
    returnPath: "/courses?from=home",
    outcome: "success",
    course: "pmq",
    product: "pro",
    checkoutRef: REF,
    successFlags: { tutor_unlocked: "1" },
  });
  const cancel = buildCheckoutReturnUrl(origin, {
    returnPath: "/courses?from=home",
    outcome: "cancelled",
    course: "pmq",
    product: "pro",
    checkoutRef: REF,
    successFlags: { tutor_unlocked: "1" },
  });

  assert.match(success, /[?&]checkout=success/);
  assert.match(success, /[?&]tutor_unlocked=1/);
  assert.ok(success.includes(`session_id=${CHECKOUT_SESSION_PLACEHOLDER}`));
  assert.equal(success.includes("%7BCHECKOUT_SESSION_ID%7D"), false);

  assert.match(cancel, /[?&]checkout=cancelled/);
  assert.equal(cancel.includes("checkout=success"), false);
  assert.equal(cancel.includes("tutor_unlocked"), false);
  assert.equal(cancel.includes("CHECKOUT_SESSION_ID"), false);
  assert.match(cancel, /[?&]from=home/);
  assert.match(success, /^https:\/\/www\.learnincurve\.com\/courses\?/);
});

test("anonymous id is kept off the URL after cookie consent", () => {
  const withConsent = anonDistinctIdForReturn({
    userId: USER,
    analytics: { consent: "granted", distinctId: USER },
  });
  const without = anonDistinctIdForReturn({
    userId: USER,
    analytics: { consent: "unset", distinctId: ANON },
  });
  assert.equal(withConsent, undefined);
  assert.equal(without, ANON);

  const meta = checkoutAnalyticsMetadata({
    checkoutRef: REF,
    userId: USER,
    analytics: { consent: "granted", distinctId: USER, sourcePath: "/courses/pmq-in-5-days/pricing" },
  });
  assert.equal(meta.ph_distinct_id, undefined);
  assert.equal(meta.ph_consent, "granted");
  assert.equal(meta.source_path, "/courses/pmq-in-5-days/pricing");
});

test("aid is stripped from the address bar but the checkout flag stays", () => {
  const next = searchWithoutAnonId(`?checkout=cancelled&course=pmq&aid=${ANON}`);
  assert.equal(next.includes("aid="), false);
  assert.match(next, /checkout=cancelled/);
});

test("a success flag is never read as a cancel, and a bare Stripe return is", () => {
  const success = interpretCheckoutReturn({
    search: "?checkout=success&course=pfq&product=pro&session_id=cs_live_abc123",
    referrer: "https://checkout.stripe.com/",
  });
  assert.equal(success?.kind, "success");
  assert.equal(success?.course, "pfq");
  assert.equal(success?.stripeSessionId, "cs_live_abc123");

  const cancel = interpretCheckoutReturn({
    search: "?checkout=cancelled&course=pmq&ref=" + REF,
    referrer: "https://checkout.stripe.com/",
  });
  assert.equal(cancel?.kind, "cancelled");
  assert.equal(cancel?.signal, "cancel_url");
  assert.equal(cancel?.checkoutRef, REF);

  const back = interpretCheckoutReturn({
    search: "",
    referrer: "https://checkout.stripe.com/c/pay/cs_live_x",
  });
  assert.equal(back?.kind, "cancelled");
  assert.equal(back?.signal, "stripe_referrer");

  assert.equal(
    interpretCheckoutReturn({ search: "", referrer: "https://www.google.com/" }),
    null,
  );
});

test("apex checkout origin is rewritten to www so the return path is not dropped", () => {
  assert.equal(
    checkoutAppOrigin("https://learnincurve.com", "http://localhost:3000"),
    "https://www.learnincurve.com",
  );
  assert.equal(
    checkoutAppOrigin(undefined, "https://www.learnincurve.com"),
    "https://www.learnincurve.com",
  );
});

test("live analytics host is www only", () => {
  assert.equal(isLiveAnalyticsHostname("www.learnincurve.com"), true);
  assert.equal(isLiveAnalyticsHostname("localhost:3000"), false);
  assert.equal(isLiveAnalyticsHostname("192.168.1.147"), false);
  assert.equal(isLiveAnalyticsHostname("learnincurve.com"), false);
  assert.equal(isLiveAnalyticsOrigin("https://www.learnincurve.com"), true);
  assert.equal(isLiveAnalyticsOrigin("http://localhost:3000"), false);
  assert.equal(isLiveAnalyticsOrigin(""), false);
});

test("before consent the server event uses the anonymous id; after Accept it uses the account id", () => {
  const person = resolveCheckoutPerson({
    userId: USER,
    consent: "unset",
    anonDistinctId: ANON,
    posthogSessionId: "sessionIdValue1",
    fallbackDistinctId: USER,
  });
  assert.equal(person.distinctId, ANON);
  assert.equal(person.posthogSessionId, "sessionIdValue1");

  const granted = resolveCheckoutPerson({
    userId: USER,
    consent: "granted",
    anonDistinctId: ANON,
    fallbackDistinctId: USER,
  });
  assert.equal(granted.distinctId, USER);
});

test("purchase_completed confirms the entitlement write and follows the same person", () => {
  const payload = purchaseCompletedFromCheckoutSession(
    {
      id: "cs_test_123",
      payment_status: "paid",
      amount_total: 2000,
      currency: "gbp",
      payment_intent: "pi_test_456",
      metadata: {
        user_id: USER,
        course_id: PMQ_COURSE_ID,
        feature: "pro",
        ph_consent: "unset",
        ph_distinct_id: ANON,
        checkout_ref: REF,
        source_path: "/courses",
      },
    },
    1_700_000_000,
    { entitlementGranted: true, creditGranted: true },
  );

  assert.ok(payload);
  assert.equal(payload.distinctId, ANON);
  assert.equal(payload.properties.entitlement_granted, true);
  assert.equal(payload.properties.credit_granted, true);
  assert.equal(payload.properties.checkout_ref, REF);
  assert.equal(payload.properties.source_path, "/courses");
});
