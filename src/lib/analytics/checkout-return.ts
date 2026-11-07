/**
 * Stripe return URLs and the ids that join a checkout to one PostHog person.
 *
 * success_url and cancel_url used to be the same path. A cancelled Checkout
 * (and the browser Back button) landed on a bare page, so a paid return and
 * an abandoned one looked identical. `checkout=success` and
 * `checkout=cancelled` are the distinction.
 *
 * `{CHECKOUT_SESSION_ID}` is a Stripe template. It is substituted on
 * success_url only, and it must stay unencoded or Stripe will not replace it.
 *
 * `aid` is the in-memory PostHog distinct id from before the redirect. Memory
 * persistence does not survive the round trip to Stripe, and we do not write
 * a cookie to keep it. The id is read once on the way back and then removed
 * from the address bar. It is only attached when the visitor has not accepted
 * cookies, so the value is the anonymous id, not their account id.
 */

export const CHECKOUT_SUCCESS = "success";
export const CHECKOUT_CANCELLED = "cancelled";
export const CHECKOUT_SESSION_PLACEHOLDER = "{CHECKOUT_SESSION_ID}";

export type CheckoutCourse = "pmq" | "pfq";
export type CheckoutConsent = "granted" | "denied" | "unset";

export type CheckoutAnalyticsContext = {
  sourcePath?: string;
  consent?: CheckoutConsent;
  /** Anonymous PostHog id. Omit after cookie consent: that id is the user UUID. */
  distinctId?: string;
  sessionId?: string;
};

export type CheckoutReturnInput = {
  returnPath: string;
  outcome: typeof CHECKOUT_SUCCESS | typeof CHECKOUT_CANCELLED;
  course: CheckoutCourse;
  product: string;
  checkoutRef: string;
  anonDistinctId?: string;
  /** Flags the app already understands, success only. Example: tutor_unlocked=1. */
  successFlags?: Record<string, string>;
};

const TRACKING_TOKEN = /^[A-Za-z0-9_-]{8,80}$/;
const CHECKOUT_REF = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STRIPE_SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]+$/;

export function sanitizeSourcePath(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const path = value.split("?")[0]?.split("#")[0]?.trim() ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return undefined;
  if (path.length > 180 || path.includes("\\") || path.includes("://")) return undefined;
  return path;
}

export function sanitizeTrackingToken(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const token = value.trim();
  if (!TRACKING_TOKEN.test(token)) return undefined;
  return token;
}

export function sanitizeCheckoutRef(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const ref = value.trim();
  if (!CHECKOUT_REF.test(ref)) return undefined;
  return ref;
}

export function sanitizeStripeSessionId(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const id = value.trim();
  if (!STRIPE_SESSION_ID.test(id)) return undefined;
  return id;
}

/**
 * Public origin Stripe should send the buyer back to.
 * Prefers the canonical site URL. Rewrites the apex host to www: the apex
 * redirect drops the path, which would throw away the checkout flag.
 */
export function checkoutAppOrigin(
  siteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL,
  appUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL,
): string {
  const preferred = (siteUrl || appUrl || "http://localhost:3000").trim().replace(/\/+$/, "");
  try {
    const url = new URL(preferred);
    if (url.hostname === "learnincurve.com") {
      url.hostname = "www.learnincurve.com";
    }
    return url.origin;
  } catch {
    return preferred;
  }
}

export function buildCheckoutReturnPath(input: CheckoutReturnInput): string {
  const raw = input.returnPath.startsWith("/") ? input.returnPath : "/courses";
  const hashAt = raw.indexOf("#");
  const withoutHash = hashAt >= 0 ? raw.slice(0, hashAt) : raw;
  const hash = hashAt >= 0 ? raw.slice(hashAt) : "";
  const queryAt = withoutHash.indexOf("?");
  const pathname = queryAt >= 0 ? withoutHash.slice(0, queryAt) : withoutHash;
  const existing = queryAt >= 0 ? withoutHash.slice(queryAt + 1) : "";

  const params = new URLSearchParams(existing);
  params.set("checkout", input.outcome);
  params.set("course", input.course);
  params.set("product", input.product);
  params.set("ref", input.checkoutRef);
  if (input.anonDistinctId) params.set("aid", input.anonDistinctId);
  if (input.outcome === CHECKOUT_SUCCESS && input.successFlags) {
    for (const [key, value] of Object.entries(input.successFlags)) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  const base = query ? `${pathname}?${query}` : pathname;
  if (input.outcome === CHECKOUT_SUCCESS) {
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}session_id=${CHECKOUT_SESSION_PLACEHOLDER}${hash}`;
  }
  return `${base}${hash}`;
}

export function buildCheckoutReturnUrl(origin: string, input: CheckoutReturnInput): string {
  return `${origin.replace(/\/+$/, "")}${buildCheckoutReturnPath(input)}`;
}

export function checkoutReturnUrls(input: {
  origin: string;
  returnPath: string;
  course: CheckoutCourse;
  product: string;
  checkoutRef: string;
  anonDistinctId?: string;
  successFlags?: Record<string, string>;
}): { success_url: string; cancel_url: string } {
  const shared = {
    returnPath: input.returnPath,
    course: input.course,
    product: input.product,
    checkoutRef: input.checkoutRef,
    anonDistinctId: input.anonDistinctId,
  };
  return {
    success_url: buildCheckoutReturnUrl(input.origin, {
      ...shared,
      outcome: CHECKOUT_SUCCESS,
      successFlags: input.successFlags,
    }),
    cancel_url: buildCheckoutReturnUrl(input.origin, {
      ...shared,
      outcome: CHECKOUT_CANCELLED,
    }),
  };
}

export function checkoutAnalyticsMetadata(input: {
  checkoutRef: string;
  userId: string;
  analytics?: CheckoutAnalyticsContext;
}): Record<string, string> {
  const consent = input.analytics?.consent;
  const safeConsent: CheckoutConsent =
    consent === "granted" || consent === "denied" || consent === "unset"
      ? consent
      : "unset";
  const anon = sanitizeTrackingToken(input.analytics?.distinctId);
  const anonSafe = safeConsent === "granted" || !anon || anon === input.userId ? undefined : anon;
  const sessionId = sanitizeTrackingToken(input.analytics?.sessionId);
  const source = sanitizeSourcePath(input.analytics?.sourcePath);

  const metadata: Record<string, string> = {
    checkout_ref: input.checkoutRef,
    ph_consent: safeConsent,
  };
  if (anonSafe) metadata.ph_distinct_id = anonSafe;
  if (sessionId) metadata.ph_session_id = sessionId;
  if (source) metadata.source_path = source;
  return metadata;
}

export function anonDistinctIdForReturn(input: {
  userId: string;
  analytics?: CheckoutAnalyticsContext;
}): string | undefined {
  return checkoutAnalyticsMetadata({
    checkoutRef: "00000000-0000-4000-8000-000000000000",
    userId: input.userId,
    analytics: input.analytics,
  }).ph_distinct_id;
}

export type CheckoutPerson = {
  distinctId: string;
  posthogSessionId?: string;
};

/**
 * Same person as the browser when we can do it without a new cookie.
 * After Accept, the browser has already called identify(userId), so the
 * server event uses that id. Before Accept, the server event uses the
 * anonymous id the page was already sending from memory. No cookie is written
 * either way. Person profiles stay on, or the funnel steps disappear from
 * PostHog even though the events were accepted.
 */
export function resolveCheckoutPerson(input: {
  userId?: string | null;
  consent?: string | null;
  anonDistinctId?: string | null;
  posthogSessionId?: string | null;
  fallbackDistinctId: string;
}): CheckoutPerson {
  const userId = input.userId?.trim() || "";
  const anon = sanitizeTrackingToken(input.anonDistinctId);
  const posthogSessionId = sanitizeTrackingToken(input.posthogSessionId);
  const granted = input.consent === "granted";

  if (granted && userId) {
    return { distinctId: userId, posthogSessionId };
  }
  if (anon && anon !== userId) {
    return { distinctId: anon, posthogSessionId };
  }
  if (userId) {
    return { distinctId: userId, posthogSessionId };
  }
  return {
    distinctId: input.fallbackDistinctId,
    posthogSessionId,
  };
}

export type CheckoutReturnKind = "success" | "cancelled";

export type CheckoutReturnReading = {
  kind: CheckoutReturnKind;
  /** How we knew it was a cancel. Success is always the return URL. */
  signal: "success_url" | "cancel_url" | "stripe_referrer";
  course?: CheckoutCourse;
  product?: string;
  checkoutRef?: string;
  stripeSessionId?: string;
};

const SUCCESS_FLAGS = ["tutor_unlocked", "pfq_unlocked", "sly_topup"] as const;

export function referrerIsStripeCheckout(referrer: string | null | undefined): boolean {
  if (!referrer) return false;
  try {
    return new URL(referrer).hostname === "checkout.stripe.com";
  } catch {
    return false;
  }
}

/**
 * Read the current URL (and, for a bare return, the referrer) into one
 * outcome. A success flag always wins over the Stripe referrer, so a paid
 * return is never labelled a cancel.
 */
export function interpretCheckoutReturn(input: {
  search: string;
  referrer?: string | null;
}): CheckoutReturnReading | null {
  const params = new URLSearchParams(
    input.search.startsWith("?") ? input.search.slice(1) : input.search,
  );
  const checkout = params.get("checkout");
  const successFlag = SUCCESS_FLAGS.some((key) => params.get(key) === "1");
  const courseParam = params.get("course");
  const course: CheckoutCourse | undefined =
    courseParam === "pmq" || courseParam === "pfq" ? courseParam : undefined;
  const product = params.get("product")?.trim() || undefined;
  const checkoutRef = sanitizeCheckoutRef(params.get("ref"));
  const stripeSessionId = sanitizeStripeSessionId(params.get("session_id"));

  const shared = { course, product, checkoutRef, stripeSessionId };

  if (checkout === CHECKOUT_SUCCESS || successFlag) {
    return { kind: "success", signal: "success_url", ...shared };
  }
  if (checkout === CHECKOUT_CANCELLED) {
    return { kind: "cancelled", signal: "cancel_url", ...shared };
  }
  if (referrerIsStripeCheckout(input.referrer)) {
    return { kind: "cancelled", signal: "stripe_referrer", ...shared };
  }
  return null;
}

export function anonIdFromSearch(search: string): string | undefined {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const checkout = params.get("checkout");
  if (checkout !== CHECKOUT_SUCCESS && checkout !== CHECKOUT_CANCELLED) return undefined;
  return sanitizeTrackingToken(params.get("aid"));
}

/** Search string with `aid` removed, including the leading `?` when anything remains. */
export function searchWithoutAnonId(search: string): string {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  params.delete("aid");
  const next = params.toString();
  return next ? `?${next}` : "";
}
