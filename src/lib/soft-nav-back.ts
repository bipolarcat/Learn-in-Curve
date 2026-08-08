/**
 * Soft-nav `?from=` targets — used so marketing CTAs can show a contextual
 * back control on the destination page (same language as PricingBackLink).
 */
export type SoftNavFrom = "home" | "courses" | "pricing" | "library";

export type SoftNavBackTarget = {
  href: string;
  label: string;
  busyLabel: string;
};

export const SOFT_NAV_BACK: Record<SoftNavFrom, SoftNavBackTarget> = {
  home: {
    href: "/",
    label: "Back to home",
    busyLabel: "Opening home",
  },
  courses: {
    href: "/courses",
    label: "Back to courses",
    busyLabel: "Opening courses",
  },
  pricing: {
    href: "/courses/pmq-in-5-days/pricing",
    label: "Back to plans",
    busyLabel: "Opening plans",
  },
  library: {
    href: "/library",
    label: "Back to library",
    busyLabel: "Opening library",
  },
};

/** Free mock exam page — “Go back to …” wording. */
export type FreeMockSoftNavFrom = "home" | "library";

export const FREE_MOCK_SOFT_NAV_BACK: Record<
  FreeMockSoftNavFrom,
  SoftNavBackTarget
> = {
  home: {
    href: "/",
    label: "Go back to home",
    busyLabel: "Opening home",
  },
  library: {
    href: "/library",
    label: "Go back to library",
    busyLabel: "Opening library",
  },
};

export function parseSoftNavFrom(
  value: string | string[] | undefined,
): SoftNavFrom | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (
    raw === "home" ||
    raw === "courses" ||
    raw === "pricing" ||
    raw === "library"
  ) {
    return raw;
  }
  return null;
}

export function parseFreeMockSoftNavFrom(
  value: string | string[] | undefined,
): FreeMockSoftNavFrom | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "home" || raw === "library") return raw;
  return null;
}

/** Append or replace `from` on a path (pathname + optional existing query). */
export function withSoftNavFrom(path: string, from: SoftNavFrom): string {
  const q = path.indexOf("?");
  const pathname = q === -1 ? path : path.slice(0, q);
  const params = new URLSearchParams(q === -1 ? "" : path.slice(q + 1));
  params.set("from", from);
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}
