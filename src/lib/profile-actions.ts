"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAvatarId } from "@/lib/avatars";
import {
  upsertExamDeadline,
  upsertThemePreference,
  upsertUserProfile,
} from "@/lib/profile";
import {
  parseThemeChoice,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  type ThemeChoice,
} from "@/lib/theme-routes";
import {
  normalizeProfileField,
  PROFILE_AGE_MAX,
  PROFILE_AGE_MIN,
  tooLongMessage,
  type ProfileTextField,
} from "@/lib/profile-limits";
import type { UserProfileInput } from "@/types/profile";

export type SaveProfileResult =
  | { ok: true }
  | { ok: false; error: string };

function parseOptionalInt(
  raw: string,
  min: number,
  max: number,
): number | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < min || n > max) return "invalid";
  return n;
}

export async function saveUserProfile(
  formData: FormData,
): Promise<SaveProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to save your profile." };
  }

  const ageRaw = String(formData.get("age") ?? "");
  const age = parseOptionalInt(ageRaw, PROFILE_AGE_MIN, PROFILE_AGE_MAX);

  if (age === "invalid") {
    return {
      ok: false,
      error: `Age must be a whole number between ${PROFILE_AGE_MIN} and ${PROFILE_AGE_MAX}.`,
    };
  }

  const avatarRaw = String(formData.get("avatar_id") ?? "");
  if (!isAvatarId(avatarRaw)) {
    return { ok: false, error: "Pick one of the available avatars." };
  }

  // Length is enforced HERE, not just via the form's maxLength. This is a
  // server action and is directly callable, so the client attribute is a UX
  // nicety, not a control — before this, first_name/last_name/profession/company
  // were unbounded all the way into Postgres.
  const text: Partial<Record<ProfileTextField, string | null>> = {};
  for (const field of [
    "first_name",
    "last_name",
    "profession",
    "company",
    "study_goal",
  ] as ProfileTextField[]) {
    const parsed = normalizeProfileField(field, formData.get(field));
    if (parsed === "too_long") {
      return { ok: false, error: tooLongMessage(field) };
    }
    text[field] = parsed;
  }

  const input: UserProfileInput = {
    first_name: text.first_name ?? "",
    last_name: text.last_name ?? "",
    age,
    profession: text.profession ?? "",
    company: text.company ?? "",
    study_goal: text.study_goal ?? "",
    avatar_id: avatarRaw,
  };

  const result = await upsertUserProfile(supabase, user.id, input);
  if (!result.ok) {
    return {
      ok: false,
      error:
        "Couldn’t save your profile. If this keeps happening, the profiles migration may not be applied yet.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/courses/pmq-in-5-days", "layout");
  return { ok: true };
}

export async function saveExamDeadline(
  formData: FormData,
): Promise<SaveProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You need to be signed in to save a deadline." };
  }

  const raw = String(formData.get("target_exam_date") ?? "").trim();
  if (raw && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { ok: false, error: "Enter a valid exam date." };
  }

  if (raw) {
    const [y, m, d] = raw.split("-").map(Number);
    const picked = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    picked.setHours(0, 0, 0, 0);
    if (Number.isNaN(picked.getTime()) || picked < today) {
      return { ok: false, error: "Exam date can’t be before today." };
    }
  }

  const result = await upsertExamDeadline(supabase, user.id, raw || null);
  if (!result.ok) {
    return {
      ok: false,
      error:
        "Couldn’t save your deadline. Apply the profiles / deadline migration if this persists.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/**
 * Persist the dark-mode opt-in (LIC-114).
 *
 * Two writes, both needed:
 *  - `profiles.theme_preference` is the durable, per-account value. It is what
 *    makes the choice survive logout, re-login and a change of device.
 *  - the `lic_theme` cookie is a same-browser mirror so the blocking script in
 *    <head> can resolve the theme before first paint without a DB round trip.
 *
 * Signed-out callers are rejected outright. There is no anonymous dark mode:
 * every dark-capable route is behind auth, and honouring a preference for a
 * signed-out visitor is exactly how the OS-inference bug used to surface.
 */
export async function saveThemePreference(
  next: ThemeChoice,
): Promise<SaveProfileResult> {
  const theme = parseThemeChoice(next);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not signed in" };
  }

  const result = await upsertThemePreference(supabase, user.id, theme);
  if (!result.ok) {
    return {
      ok: false,
      error:
        "Couldn’t save your theme. Apply the profiles / theme_preference migration if this persists.",
    };
  }

  const store = await cookies();
  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: THEME_COOKIE_MAX_AGE,
    sameSite: "lax",
    // Readable by the head script on purpose — see theme-routes.ts.
    httpOnly: false,
  });

  return { ok: true };
}

/**
 * Bring the `lic_theme` mirror cookie in line with the account's stored
 * preference, or clear it when signed out.
 *
 * This is what makes the choice follow the ACCOUNT rather than the browser: a
 * user who turned dark on at home gets dark on a new device the first time they
 * sign in there, because this seeds the cookie the head script reads.
 *
 * Called at every point where the session changes — the OAuth/confirm callback,
 * password sign-in, and sign-out. Middleware would look like the natural home
 * for this, but response headers set on `NextResponse.next()` do not reach the
 * client for page responses in this app, so a Set-Cookie written there is
 * silently dropped. Verified, not assumed. Server actions and route handlers
 * can write cookies, so the sync lives at the session events instead — which is
 * also a handful of writes per session rather than one query per request.
 */
export async function syncThemeCookieFromProfile(): Promise<ThemeChoice> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const store = await cookies();

  if (!user) {
    store.delete(THEME_COOKIE);
    return "light";
  }

  const { data } = await supabase
    .from("profiles")
    .select("theme_preference")
    .eq("user_id", user.id)
    .maybeSingle();

  const theme = parseThemeChoice(data?.theme_preference);
  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: THEME_COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  });
  return theme;
}
