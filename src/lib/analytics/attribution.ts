import { readConsent } from "@/lib/analytics/consent";
import {
  classifyReferrer,
  type ReferrerCategory,
} from "@/lib/analytics/referrer";

/**
 * First-touch UTM + referrer attribution.
 *
 * Before consent (and after a decline) the values live in module memory
 * only, so custom events and the free-mock lead still carry the landing
 * campaign without sessionStorage. sessionStorage is written only once
 * consent is granted. First write wins for the visit.
 */

export const ATTRIBUTION_STORAGE_KEY = "lic_attr_v1";

export type Attribution = {
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer_category: ReferrerCategory;
};

type StoredAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer_category: ReferrerCategory;
  captured_at: string;
};

/** In-tab only. Never written to storage unless consent is granted. */
let memoryAttribution: StoredAttribution | null = null;

function emptyAttribution(category: ReferrerCategory = "direct"): Attribution {
  return {
    source: category === "direct" ? "direct" : category,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    referrer_category: category,
  };
}

export function parseAttribution(
  search: string,
  referrer: string | null,
  capturedAt: string = new Date().toISOString(),
): StoredAttribution {
  const params = new URLSearchParams(
    search.startsWith("?") ? search : search ? `?${search}` : "",
  );
  const pick = (key: string) => {
    const v = params.get(key)?.trim();
    return v ? v.slice(0, 200) : null;
  };
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_content: pick("utm_content"),
    utm_term: pick("utm_term"),
    referrer_category: classifyReferrer(referrer || null),
    captured_at: capturedAt,
  };
}

function readStoredRaw(): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAttribution;
  } catch {
    return null;
  }
}

function readStored(): StoredAttribution | null {
  if (readConsent() !== "granted") return null;
  return readStoredRaw();
}

function writeStored(value: StoredAttribution): void {
  if (typeof window === "undefined") return;
  if (readConsent() !== "granted") return;
  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function clearAttributionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Drop the durable copy (decline or withdrawn consent). Keep the in-memory
 * copy so the rest of this visit still has the landing UTMs.
 */
export function releasePersistentAttribution(): void {
  const stored = readStoredRaw();
  if (stored && !memoryAttribution) memoryAttribution = stored;
  clearAttributionStorage();
}

function remember(stored: StoredAttribution): Attribution {
  memoryAttribution = stored;
  return toAttribution(stored);
}

/**
 * Capture UTMs from the current URL + classify document.referrer.
 * First write wins for the visit (don't overwrite on later navigations).
 */
export function captureAttributionFromUrl(
  search: string = typeof window !== "undefined" ? window.location.search : "",
  referrer: string | null = typeof document !== "undefined"
    ? document.referrer
    : null,
): Attribution | null {
  if (typeof window === "undefined") return null;

  if (readConsent() === "granted") {
    const existing = readStored();
    if (existing) return remember(existing);
    if (memoryAttribution) {
      writeStored(memoryAttribution);
      return toAttribution(memoryAttribution);
    }
    const stored = parseAttribution(search, referrer);
    writeStored(stored);
    return remember(stored);
  }

  if (memoryAttribution) return toAttribution(memoryAttribution);
  return remember(parseAttribution(search, referrer));
}

function toAttribution(stored: StoredAttribution): Attribution {
  const source =
    stored.utm_source ||
    (stored.referrer_category !== "direct"
      ? stored.referrer_category
      : "direct");
  return {
    source,
    utm_source: stored.utm_source,
    utm_medium: stored.utm_medium,
    utm_campaign: stored.utm_campaign,
    utm_content: stored.utm_content,
    utm_term: stored.utm_term,
    referrer_category: stored.referrer_category,
  };
}

/** Read current visit attribution (or classify live if none stored). */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return emptyAttribution();
  if (readConsent() === "granted") {
    const stored = readStored();
    if (stored) return toAttribution(stored);
  } else if (memoryAttribution) {
    return toAttribution(memoryAttribution);
  }

  const live = captureAttributionFromUrl();
  return live ?? emptyAttribution(classifyReferrer(document.referrer || null));
}
