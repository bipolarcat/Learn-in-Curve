import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { sendNotifyConfirmationEmail } from "@/lib/notify/send-confirmation-email";
import { getSiteOrigin } from "@/lib/site-origin";
import {
  getNotifyList,
  NEWSLETTER_LIST_KEY,
  type NotifyList,
} from "@/lib/notify/lists";
import { sendAdminNotification } from "@/lib/admin/send-admin-notification";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WAITLIST_BUCKET = "waitlist-private";

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return null;
  return email;
}

function signupObjectPath(email: string) {
  const hash = createHash("sha256").update(email).digest("hex");
  return `signups/${hash}.json`;
}

type SignupRecord = {
  email: string;
  /** Every list this address belongs to, at time of writing. */
  lists: string[];
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  subscribed_at: string;
  updated_at: string;
};

async function ensureWaitlistBucket(
  supabase: ReturnType<typeof createServiceClient>,
) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === WAITLIST_BUCKET)) return;
  await supabase.storage.createBucket(WAITLIST_BUCKET, { public: false });
}

/**
 * Consent-record backup to private Storage, independent of the DB.
 *
 * This is the evidence trail: if someone asks what they agreed to and when, or
 * the ICO does, "our app says so" is weaker than a timestamped record written at
 * the moment of consent. Merges rather than replaces so history isn't lost.
 */
async function writeSignupRecord(
  supabase: ReturnType<typeof createServiceClient>,
  record: SignupRecord,
) {
  await ensureWaitlistBucket(supabase);
  const path = signupObjectPath(record.email);
  const { data: existing } = await supabase.storage
    .from(WAITLIST_BUCKET)
    .download(path);

  let next = record;
  if (existing) {
    try {
      const prev = JSON.parse(await existing.text()) as Partial<SignupRecord> & {
        course?: string | null;
      };
      const marketing =
        Boolean(prev.marketing_consent) || record.marketing_consent;
      // `course` is the pre-2026-07-30 single-membership shape — fold it in so
      // older records aren't silently dropped when they're next touched.
      const previousLists = [
        ...(Array.isArray(prev.lists) ? prev.lists : []),
        ...(typeof prev.course === "string" && prev.course ? [prev.course] : []),
      ];
      next = {
        email: record.email,
        lists: [...new Set([...previousLists, ...record.lists])].sort(),
        marketing_consent: marketing,
        marketing_consent_at: marketing
          ? (prev.marketing_consent_at ??
            record.marketing_consent_at ??
            record.updated_at)
          : null,
        subscribed_at: prev.subscribed_at ?? record.subscribed_at,
        updated_at: record.updated_at,
      };
    } catch {
      next = record;
    }
  }

  const { error } = await supabase.storage
    .from(WAITLIST_BUCKET)
    .upload(path, JSON.stringify(next, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    console.error("[notify] storage write failed", error);
  }

  return next;
}

/** Person record: one row per email, holding marketing consent + unsubscribe token. */
async function upsertPerson(
  supabase: ReturnType<typeof createServiceClient>,
  email: string,
  marketingConsent: boolean,
  now: string,
): Promise<{ token: string | null; existed: boolean }> {
  const row: Record<string, unknown> = {
    email,
    marketing_consent: marketingConsent,
  };
  if (marketingConsent) row.marketing_consent_at = now;

  const { data: inserted, error } = await supabase
    .from("newsletter_subscribers")
    .insert(row)
    .select("unsubscribe_token")
    .single();

  if (!error) {
    return { token: inserted?.unsubscribe_token ?? null, existed: false };
  }

  // 23505 = already known to us. Only ever UPGRADE consent here — never write
  // `marketing_consent: false` over an existing true, or an unticked box on a
  // later form would silently revoke a consent the user did give.
  if (error.code === "23505") {
    if (marketingConsent) {
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({ marketing_consent: true, marketing_consent_at: now })
        .eq("email", email);
      if (updateError) console.error("[notify] consent update failed", updateError);
    }

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("unsubscribe_token")
      .eq("email", email)
      .maybeSingle();

    return { token: existing?.unsubscribe_token ?? null, existed: true };
  }

  console.error("[notify] person upsert failed", error);
  throw new Error("person upsert failed");
}

/**
 * Adds membership rows. Returns the keys that were genuinely new, so the
 * confirmation email only fires for a real join and never re-greets someone
 * already on the list.
 */
async function addMemberships(
  supabase: ReturnType<typeof createServiceClient>,
  email: string,
  listKeys: string[],
): Promise<string[]> {
  const { data, error } = await supabase
    .from("waitlist_signups")
    .upsert(
      listKeys.map((list_key) => ({ email, list_key })),
      { onConflict: "email,list_key", ignoreDuplicates: true },
    )
    .select("list_key");

  if (error) {
    console.error("[notify] membership insert failed", error);
    throw new Error("membership insert failed");
  }

  // With ignoreDuplicates, only genuinely inserted rows come back.
  return (data ?? []).map((r) => r.list_key as string);
}

/**
 * Public opt-in for launch waitlists and the marketing newsletter.
 *
 * Membership is rows in `waitlist_signups`, one per (email, list_key) — see
 * migration 20260730160000. Ticking marketing adds a SECOND row for the
 * newsletter list rather than overwriting the launch list, because asking to
 * hear about a launch and agreeing to ongoing marketing are separate consents
 * under UK GDPR/PECR and have to be separately withdrawable.
 */
export async function POST(request: Request) {
  let body: {
    email?: unknown;
    course?: unknown;
    list?: unknown;
    marketingConsent?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // `course` is the legacy field name still sent by existing callers.
  const requestedKey =
    typeof body.list === "string" && body.list.trim()
      ? body.list.trim()
      : typeof body.course === "string" && body.course.trim()
        ? body.course.trim()
        : NEWSLETTER_LIST_KEY;

  // Validate against the registry rather than accepting free text: an unknown
  // key would create a list nothing can email, export, or unsubscribe from.
  const primary: NotifyList | null = getNotifyList(requestedKey);
  if (!primary) {
    console.error(`[notify] unknown list key "${requestedKey}"`);
    return NextResponse.json({ error: "Unknown list." }, { status: 400 });
  }

  const marketingConsent = body.marketingConsent === true;
  const now = new Date().toISOString();

  const listKeys = [primary.key];
  if (marketingConsent && primary.key !== NEWSLETTER_LIST_KEY) {
    listKeys.push(NEWSLETTER_LIST_KEY);
  }

  try {
    const supabase = createServiceClient();

    const { token: unsubscribeToken } = await upsertPerson(
      supabase,
      email,
      marketingConsent,
      now,
    );

    const newlyAdded = await addMemberships(supabase, email, listKeys);
    const alreadySubscribed = !newlyAdded.includes(primary.key);

    const stored = await writeSignupRecord(supabase, {
      email,
      lists: listKeys,
      marketing_consent: marketingConsent,
      marketing_consent_at: marketingConsent ? now : null,
      subscribed_at: now,
      updated_at: now,
    });

    // Notify admin of every genuinely new subscription — fire-and-forget.
    if (!alreadySubscribed) {
      const londonTime = new Date().toLocaleString("en-GB", {
        timeZone: "Europe/London",
        dateStyle: "medium",
        timeStyle: "short",
      });
      void sendAdminNotification({
        subject: `📬 New subscriber: ${primary.label}`,
        title: `📬 New subscriber`,
        rows: [
          { label: "Email", value: email },
          { label: "List", value: primary.label },
          { label: "Marketing consent", value: marketingConsent ? "Yes" : "No" },
          { label: "Signed up", value: `${londonTime} (London)` },
        ],
      });
    }

    // Only on a genuinely new join, and only for the list they actually asked
    // about — a marketing tick shouldn't trigger a second email. Fire-and-forget
    // so a slow send never delays this response; the rows are already saved.
    if (!alreadySubscribed && unsubscribeToken) {
      void sendNotifyConfirmationEmail({
        email,
        listKey: primary.key,
        unsubscribeToken,
        // Same proxy trap as LIC-116: request.url is https://localhost:8080 in
        // prod, which would put dead unsubscribe links in confirmation emails.
        origin: getSiteOrigin(request),
      }).then(async (sent) => {
        if (!sent) return;
        const { error: stampError } = await supabase
          .from("waitlist_signups")
          .update({ confirmation_sent_at: new Date().toISOString() })
          .eq("email", email)
          .eq("list_key", primary.key);
        if (stampError) {
          console.error("[notify] confirmation_sent_at stamp failed", stampError);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      alreadySubscribed,
      email,
      list: primary.key,
      lists: listKeys,
      marketingConsent: stored.marketing_consent,
    });
  } catch (err) {
    console.error("[notify] unexpected", err);
    return NextResponse.json(
      { error: "Couldn’t save your email. Try again." },
      { status: 500 },
    );
  }
}
