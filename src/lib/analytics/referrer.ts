/**
 * Classify document.referrer / $referring_domain into a coarse channel.
 * Suffix matching so subdomains and mobile-app hosts resolve correctly.
 */

export type ReferrerCategory =
  | "ai_assistant"
  | "search"
  | "social"
  | "direct"
  | "other";

const AI_SUFFIXES = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "you.com",
];

const SEARCH_SUFFIXES = [
  "google.com",
  "google.co.uk",
  "bing.com",
  "duckduckgo.com",
  "search.brave.com",
  "ecosia.org",
];

const SOCIAL_SUFFIXES = [
  "linkedin.com",
  "lnkd.in",
  "com.linkedin.android",
  "reddit.com",
  "com.reddit.frontpage",
  "instagram.com",
  "t.co",
  "x.com",
  "twitter.com",
];

function hostMatches(host: string, suffix: string): boolean {
  return host === suffix || host.endsWith(`.${suffix}`);
}

function matchesAny(host: string, suffixes: string[]): boolean {
  return suffixes.some((s) => hostMatches(host, s));
}

/** Accept a hostname or full URL; empty / missing → direct. */
export function classifyReferrer(
  referrerOrHost: string | null | undefined,
): ReferrerCategory {
  if (!referrerOrHost || referrerOrHost === "$direct") return "direct";

  let host = referrerOrHost.trim().toLowerCase();
  try {
    if (host.includes("://") || host.startsWith("//")) {
      host = new URL(host.startsWith("//") ? `https:${host}` : host).hostname;
    }
  } catch {
    /* already a bare host, or unparseable — use as-is */
  }

  // Strip trailing dots / ports
  host = host.replace(/\.$/, "").split(":")[0] ?? host;
  if (!host) return "direct";

  // google.* catch-all for country TLDs (google.de, google.com.au, …)
  if (/(^|\.)google\./.test(host) && !host.includes("gemini.google.com")) {
    // gemini handled in AI list; other google.* → search
    if (!matchesAny(host, ["gemini.google.com"])) return "search";
  }

  if (matchesAny(host, AI_SUFFIXES)) return "ai_assistant";
  if (matchesAny(host, SEARCH_SUFFIXES)) return "search";
  if (matchesAny(host, SOCIAL_SUFFIXES)) return "social";
  return "other";
}
