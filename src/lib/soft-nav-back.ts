/**
 * Soft-nav `?from=` targets — used so marketing CTAs can show a contextual
 * back control on the destination page (same language as PricingBackLink).
 */
export type SoftNavFrom = "home" | "courses" | "pricing";

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
};

export function parseSoftNavFrom(
  value: string | string[] | undefined,
): SoftNavFrom | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "home" || raw === "courses" || raw === "pricing") return raw;
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
