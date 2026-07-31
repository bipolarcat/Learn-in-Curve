"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAvatarId } from "@/lib/avatars";
import { upsertExamDeadline, upsertUserProfile } from "@/lib/profile";
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
