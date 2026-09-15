/**
 * PFQ course constants. Starter is the absence of an entitlement — never stored.
 *
 * Price / id / slug come from `src/lib/courses/registry.ts` — do not restate them.
 */

import {
  PFQ_AI_PRO_PRICE_CENTS as REGISTRY_PFQ_AI_PRO_PRICE_CENTS,
  PFQ_AI_PRO_UPGRADE_PRICE_CENTS as REGISTRY_PFQ_AI_PRO_UPGRADE_PRICE_CENTS,
  PFQ_COURSE_ID as REGISTRY_PFQ_COURSE_ID,
  PFQ_PRO_PRICE_CENTS as REGISTRY_PFQ_PRO_PRICE_CENTS,
  PFQ_SLUG as REGISTRY_PFQ_SLUG,
} from "../courses/registry-data.ts";

export const PFQ_COURSE_ID = REGISTRY_PFQ_COURSE_ID;
export const PFQ_SLUG = REGISTRY_PFQ_SLUG;

/** Pro price (£10). Defined once in the course registry. */
export const PFQ_PRO_PRICE_CENTS = REGISTRY_PFQ_PRO_PRICE_CENTS;

/**
 * AI Pro price (£20) and the upgrade price for an existing Pro holder (£10).
 *
 * Priced but NOT buyable: Sly has not shipped, so the AI Pro card is a
 * waitlist. These exist so the card shows the real number and so the checkout
 * path, when it lands, reads the same source as the page. Both are unused by
 * any live Stripe call today.
 */
export const PFQ_AI_PRO_PRICE_CENTS = REGISTRY_PFQ_AI_PRO_PRICE_CENTS;
export const PFQ_AI_PRO_UPGRADE_PRICE_CENTS =
  REGISTRY_PFQ_AI_PRO_UPGRADE_PRICE_CENTS;

/**
 * AI Pro has no checkout. Flip only when Sly ships AND the £10 upgrade path
 * exists, because a Pro holder must never be charged the full £20 twice.
 */
export const PFQ_AI_PRO_CHECKOUT_ENABLED = false;

/** Base path under `/courses` — every PFQ route hangs off this. */
export const PFQ_BASE_HREF = `/courses/${PFQ_SLUG}`;

export const PFQ_PRICING_HREF = `${PFQ_BASE_HREF}/pricing`;
export const PFQ_LEARN_HREF = `${PFQ_BASE_HREF}/learn`;
export const PFQ_MOCK_HREF = `${PFQ_BASE_HREF}/mock`;
export const PFQ_PRACTICE_HREF = `${PFQ_BASE_HREF}/practice`;
export const PFQ_TRAP_SCHOOL_HREF = `${PFQ_BASE_HREF}/trap-school`;
export const PFQ_PREVIEW_HREF = `${PFQ_BASE_HREF}/preview`;

/** Course overview + learn/practice/mock study pages (header scrolls away). */
export function isPfqStudySurface(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return (
    pathname === PFQ_BASE_HREF ||
    pathname.startsWith(`${PFQ_LEARN_HREF}`) ||
    pathname.startsWith(`${PFQ_PRACTICE_HREF}`) ||
    pathname.startsWith(`${PFQ_MOCK_HREF}`)
  );
}

/**
 * Practice runner feature flag. Commerce gating (Pro) is separate via
 * requirePfqPro. Flip false to hide practice routes while the bank is empty.
 */
export const PFQ_PRACTICE_ENABLED = true;

/**
 * Lesson content flag. Access is free (canAccessPfqLessons always true).
 * Flip false to hide /courses/pfq-in-2-days/learn/* lesson map + objective pages while
 * content is dark.
 */
export const PFQ_LESSONS_ENABLED = true;

export const PFQ_PRO_INTENT_PARAM = "intent";
export const PFQ_PRO_INTENT_VALUE = "pro";
export const PFQ_PRICING_PRO_INTENT_HREF = `${PFQ_PRICING_HREF}?${PFQ_PRO_INTENT_PARAM}=${PFQ_PRO_INTENT_VALUE}`;

/**
 * Stripe Checkout for PFQ Pro.
 *
 * Opened 2026-09-15 on Sim's explicit instruction, with the Consumer Contracts
 * waiver wording in checkout.ts accepted as reviewed and the corresponding item
 * ticked in legal/PRE_LAUNCH_CHECKLIST.md on the same date. That wording has
 * not had solicitor review; the risk was raised and accepted.
 *
 * Turning this false again is a safe, instant kill switch: it stops new
 * checkouts without touching anyone's existing entitlement.
 */
export const PFQ_CHECKOUT_ENABLED = true;

export function hasPfqProIntent(nextPath: string | null | undefined): boolean {
  if (typeof nextPath !== "string") return false;
  const [path, query = ""] = nextPath.split("?");
  if (path !== PFQ_PRICING_HREF) return false;
  return (
    new URLSearchParams(query).get(PFQ_PRO_INTENT_PARAM) ===
    PFQ_PRO_INTENT_VALUE
  );
}

export function formatPfqPriceGbp(
  cents: number = PFQ_PRO_PRICE_CENTS,
): string {
  return `£${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
