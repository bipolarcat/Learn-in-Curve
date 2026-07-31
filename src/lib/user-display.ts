/**
 * Display-name helpers. Profile `first_name` is the source of truth;
 * Auth metadata is only a soft fallback when profile is empty.
 */

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function firstToken(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

type UserLike = {
  user_metadata?: Record<string, unknown> | null;
};

function firstNameFromAuthMeta(
  user: UserLike | null | undefined,
): string | null {
  if (!user?.user_metadata) return null;
  const meta = user.user_metadata;

  const given = asTrimmedString(meta.given_name);
  if (given) return firstToken(given);

  const full =
    asTrimmedString(meta.full_name) ?? asTrimmedString(meta.name);
  if (full) return firstToken(full);

  return null;
}

export function resolveFirstName(opts: {
  profileFirstName?: string | null;
  user?: UserLike | null;
}): string | null {
  const fromProfile = asTrimmedString(opts.profileFirstName ?? null);
  if (fromProfile) return firstToken(fromProfile);
  return firstNameFromAuthMeta(opts.user);
}

/** Label for Sly user face pill — falls back to "You". */
export function getDisplayFirstName(opts: {
  profileFirstName?: string | null;
  user?: UserLike | null;
}): string {
  return resolveFirstName(opts) ?? "You";
}

/** Dashboard greeting — first visit vs returning (any LO completed). */
export function getWelcomeEyebrow(opts: {
  profileFirstName?: string | null;
  user?: UserLike | null;
  /** True when the user has completed at least one learning objective. */
  hasCompletedLo?: boolean;
}): string {
  if (opts.hasCompletedLo) {
    const name = resolveFirstName(opts);
    return name ? `Welcome back, ${name}` : "Welcome back!";
  }
  return "Welcome!";
}
