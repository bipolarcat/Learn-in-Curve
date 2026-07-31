import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  DEFAULT_AVATAR_ID,
  resolveAvatarId,
  type AvatarId,
} from "@/lib/avatars";
import { parseThemeChoice } from "@/lib/theme-routes";
import type { UserProfile, UserProfileInput } from "@/types/profile";

function emptyProfile(userId: string): UserProfile {
  const now = new Date().toISOString();
  return {
    user_id: userId,
    first_name: null,
    last_name: null,
    age: null,
    profession: null,
    company: null,
    study_goal: null,
    target_exam_date: null,
    avatar_id: DEFAULT_AVATAR_ID,
    theme_preference: "light",
    created_at: now,
    updated_at: now,
  };
}

function asTrimmed(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length > 0 ? t : null;
}

function firstToken(full: string): string {
  return full.split(/\s+/)[0] ?? full;
}

function normalizeProfile(row: Record<string, unknown>): UserProfile {
  const examRaw = row.target_exam_date;
  const target_exam_date =
    typeof examRaw === "string" && /^\d{4}-\d{2}-\d{2}/.test(examRaw)
      ? examRaw.slice(0, 10)
      : null;

  return {
    user_id: String(row.user_id),
    first_name: asTrimmed(row.first_name),
    last_name: asTrimmed(row.last_name),
    age: typeof row.age === "number" ? row.age : null,
    profession: asTrimmed(row.profession),
    company: asTrimmed(row.company),
    study_goal: asTrimmed(row.study_goal),
    target_exam_date,
    avatar_id: resolveAvatarId(row.avatar_id),
    theme_preference: parseThemeChoice(row.theme_preference),
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

/** Soft-seed first/last name from Google Auth metadata when profile is empty. */
export function seedNamesFromAuth(user: User): {
  first_name: string | null;
  last_name: string | null;
} {
  const meta = user.user_metadata ?? {};
  const given = asTrimmed(meta.given_name);
  const family = asTrimmed(meta.family_name);
  if (given || family) {
    return { first_name: given, last_name: family };
  }

  const full =
    asTrimmed(meta.full_name) ?? asTrimmed(meta.name) ?? null;
  if (!full) return { first_name: null, last_name: null };

  const parts = full.split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] ?? null,
    last_name: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

export async function getUserProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getUserProfile:", error.message);
    return emptyProfile(user.id);
  }

  if (data) {
    return normalizeProfile(data as Record<string, unknown>);
  }

  const seeded = seedNamesFromAuth(user);
  return {
    ...emptyProfile(user.id),
    first_name: seeded.first_name,
    last_name: seeded.last_name,
  };
}

export async function upsertUserProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UserProfileInput,
): Promise<{ ok: true; profile: UserProfile } | { ok: false; error: string }> {
  const avatar_id: AvatarId = resolveAvatarId(input.avatar_id);
  const row = {
    user_id: userId,
    first_name: asTrimmed(input.first_name),
    last_name: asTrimmed(input.last_name),
    age: input.age,
    profession: asTrimmed(input.profession),
    company: asTrimmed(input.company),
    study_goal: asTrimmed(input.study_goal),
    avatar_id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    console.error("upsertUserProfile:", error.message);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    profile: normalizeProfile(data as Record<string, unknown>),
  };
}

export async function upsertExamDeadline(
  supabase: SupabaseClient,
  userId: string,
  targetExamDate: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      target_exam_date: targetExamDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("upsertExamDeadline:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Persist the dark-mode opt-in against the account.
 *
 * Upsert, not update: a user can reach the toggle before anything else has
 * created their profile row, and silently dropping the write would make the
 * preference look like it saved and then reappear as light on the next device.
 */
export async function upsertThemePreference(
  supabase: SupabaseClient,
  userId: string,
  theme: UserProfile["theme_preference"],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      theme_preference: theme,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("upsertThemePreference:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export function profileFirstName(
  profile: Pick<UserProfile, "first_name"> | null | undefined,
): string | null {
  const n = asTrimmed(profile?.first_name ?? null);
  return n ? firstToken(n) : null;
}
