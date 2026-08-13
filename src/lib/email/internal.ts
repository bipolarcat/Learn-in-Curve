/**
 * List hygiene — classify founder/test addresses so they never pollute
 * counts, exports, or marketing sends.
 *
 * Founder addresses and extra internal domains come from env
 * (`INTERNAL_EMAIL_FOUNDERS`, `INTERNAL_EMAIL_DOMAINS`), not from the client.
 * Seed founders match the four addresses removed from the lists on 2026-08-13;
 * plus-tags are stripped before compare, so `…+news@gmail.com` matches the
 * bare Gmail address without listing the variant.
 */

const SEED_FOUNDERS = [
  "simsamaarshened@gmail.com",
  "sim.samaar@yahoo.in",
  "sim.samaar@yahoo.com",
] as const;

/** Lowercase, trim, strip +tag from the local part. */
export function normalizeEmailForCompare(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const localNoPlus = local.split("+")[0] ?? local;
  return `${localNoPlus}@${domain}`;
}

function parseCsv(value: string | undefined): string[] | null {
  if (value == null) return null;
  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

function founderAddresses(): string[] {
  const fromEnv = parseCsv(process.env.INTERNAL_EMAIL_FOUNDERS);
  if (fromEnv) return fromEnv.map((e) => normalizeEmailForCompare(e));
  return SEED_FOUNDERS.map((e) => normalizeEmailForCompare(e));
}

function internalDomains(): string[] {
  const fromEnv = parseCsv(process.env.INTERNAL_EMAIL_DOMAINS);
  if (fromEnv) {
    return fromEnv.map((d) => d.replace(/^@/, ""));
  }
  return [];
}

/**
 * True for founder addresses (plus-tags stripped), `test.*` local-parts, or
 * configured internal domains. Call only on the server. Never take this flag
 * from the client.
 */
export function isInternalEmail(email: string): boolean {
  const normalized = normalizeEmailForCompare(email);
  const at = normalized.lastIndexOf("@");
  if (at <= 0) return false;
  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);

  if (local.startsWith("test.")) return true;
  if (founderAddresses().includes(normalized)) return true;
  if (internalDomains().includes(domain)) return true;
  return false;
}
