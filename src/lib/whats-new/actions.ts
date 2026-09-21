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

  const { error } = await supabase
    .from("profiles")
    .update({ whats_new_seen_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) {
    console.error("markWhatsNewSeen:", error.message);
    return;
  }

  revalidatePath("/dashboard");
}
