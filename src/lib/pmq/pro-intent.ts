/**
 * Buy-intent handoff for guests — deliberately dependency-free.
 *
 * Checkout needs a `user_id`: `createAiTutorCheckout` refuses without a session
 * and the Stripe webhook grants `feature_entitlements` on `metadata.user_id`, so
 * there is nothing to grant a guest purchase to. Rather than dead-ending a guest
 * on "Not signed in", the Pro CTA sends them to sign-up with the pricing page as
 * `next`, marked with this intent, and the pricing page resumes checkout once
 * they're back.
 *
 * Guest checkout was rejected deliberately: this is a logged-in course, not a
 * download, so an account is required for delivery either way. Deferring it until
 * after payment wouldn't remove the step, it would just mean taking money for
 * content we then can't deliver — which also undercuts the Consumer Contracts
 * "access begins immediately" waiver in `DIGITAL_CONTENT_CONSENT`.
 *
 * Lives apart from `plans.ts` (which re-exports it) purely so `node --test` can
 * import it without the `@/` alias resolver. Keep it import-free.
 */

export const PMQ_OVERVIEW_HREF = "/pmq";
export const PMQ_PRICING_HREF = "/courses/pmq-in-5-days/pricing";

export const PMQ_PRO_INTENT_PARAM = "intent";
export const PMQ_PRO_INTENT_VALUE = "pro";

export const PMQ_PRICING_PRO_INTENT_HREF = `${PMQ_PRICING_HREF}?${PMQ_PRO_INTENT_PARAM}=${PMQ_PRO_INTENT_VALUE}`;

/**
 * True when an auth `next` destination is the pricing page carrying buy intent.
 * Used to swap the auth card copy, and to decide whether to reopen checkout.
 */
export function hasProIntent(nextPath: string | null | undefined): boolean {
  if (typeof nextPath !== "string") return false;
  const [path, query = ""] = nextPath.split("?");
  if (path !== PMQ_PRICING_HREF) return false;
  return (
    new URLSearchParams(query).get(PMQ_PRO_INTENT_PARAM) ===
    PMQ_PRO_INTENT_VALUE
  );
}
