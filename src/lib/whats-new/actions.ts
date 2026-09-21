"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Mark all current What's New notes as seen for the signed-in user. */
export async function markWhatsNewSeen(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Upsert, not update. A profiles row is normally created by the
  // on_auth_user_created_ensure_profile trigger, but an update against a
  // missing row affects zero rows and reports no error, which would show the
  // banner again on every load with no way to dismiss it. Upsert self-heals.
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      whats_new_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("markWhatsNewSeen:", error.message);
    return;
  }

  revalidatePath("/dashboard");
}
