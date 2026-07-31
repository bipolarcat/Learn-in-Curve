import assert from "node:assert/strict";
import test from "node:test";
import { authHrefWithNext, getSafeNextPath } from "../src/lib/auth-next.ts";
import {
  hasProIntent,
  PMQ_PRICING_HREF,
  PMQ_PRICING_PRO_INTENT_HREF,
} from "../src/lib/pmq/pro-intent.ts";

/**
 * Guards the guest → sign-up → checkout handoff.
 *
 * Checkout needs a `user_id` (the Stripe webhook grants entitlement on
 * `metadata.user_id`), so a guest clicking "Get Pro Bundle" is routed through
 * auth with the pricing page as `next`. If the intent marker is dropped anywhere
 * in that round trip, the buyer lands back on pricing with no idea why and the
 * sale is silently lost — hence tests rather than a manual click-through.
 */

test("buy-intent survives the auth round trip", () => {
  const authHref = authHrefWithNext(
    "/auth/sign-up",
    PMQ_PRICING_PRO_INTENT_HREF,
  );

  // The marker must be encoded into `next`, not lost or flattened.
  const next = new URL(authHref, "https://x.test").searchParams.get("next");
  assert.equal(next, PMQ_PRICING_PRO_INTENT_HREF);

  // …and survive the safety normalizer the auth pages run it through.
  assert.equal(getSafeNextPath(next), PMQ_PRICING_PRO_INTENT_HREF);
  assert.ok(hasProIntent(getSafeNextPath(next)));
});

test("switching sign-up ↔ sign-in keeps buy-intent", () => {
  // AuthForm's "Already have an account?" link rebuilds the href from nextPath.
  const nextPath = getSafeNextPath(PMQ_PRICING_PRO_INTENT_HREF);
  const switched = authHrefWithNext("/auth/sign-in", nextPath);
  const next = new URL(switched, "https://x.test").searchParams.get("next");

  assert.ok(hasProIntent(next), "intent lost when switching auth mode");
});

test("hasProIntent only fires for the pricing page carrying intent=pro", () => {
  assert.ok(hasProIntent(PMQ_PRICING_PRO_INTENT_HREF));
  assert.ok(hasProIntent(`${PMQ_PRICING_HREF}?ref=email&intent=pro`));

  const shouldNotFire = [
    PMQ_PRICING_HREF, // pricing, but no intent — plain browsing
    "/dashboard?intent=pro", // intent marker on an unrelated page
    "/courses/pmq-in-5-days?intent=pro",
    `${PMQ_PRICING_HREF}?intent=ai_pro`, // waitlist tier is not buyable
    `${PMQ_PRICING_HREF}?intent=`,
    null,
    undefined,
    "",
  ];

  for (const value of shouldNotFire) {
    assert.equal(hasProIntent(value), false, String(value));
  }
});
