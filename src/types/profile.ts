import type { AvatarId } from "@/lib/avatars";

export type UserProfile = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  age: number | null;
  profession: string | null;
  company: string | null;
  study_goal: string | null;
  target_exam_date: string | null;
  avatar_id: AvatarId;
  created_at: string;
  updated_at: string;
};

export type UserProfileInput = {
  first_name: string;
  last_name: string;
  age: number | null;
  profession: string;
  company: string;
  study_goal: string;
  avatar_id: AvatarId;
};
