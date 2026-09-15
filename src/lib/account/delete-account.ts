"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  DELETE_CONFIRMATION_PHRASE,
  EMAIL_TABLES,
  USER_ID_TABLES,
  type DeleteAccountResult,
} from "@/lib/account/deletion-scope";

/**
 * Self-serve account deletion (UK GDPR Art. 17, right to erasure).
 * Scope and the reason it is a hand-maintained list: see deletion-scope.ts.
 */
export async function deleteOwnAccount(
  confirmation: string,
): Promise<DeleteAccountResult> {
  if (confirmation.trim().toUpperCase() !== DELETE_CONFIRMATION_PHRASE) {
    return { ok: false, error: "Type DELETE to confirm." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You are not signed in." };
  }

  const userId = user.id;
  const email = user.email ?? null;
  const admin = createServiceClient();

  try {
    for (const table of USER_ID_TABLES) {
      const { error } = await admin.from(table).delete().eq("user_id", userId);
      if (error) {
        console.error("[account] delete failed", table, error.message);
        return {
          ok: false,
          error:
            "Something went wrong and your account has not been deleted. Please email support@learnincurve.com.",
        };
      }
    }

    if (email) {
      for (const table of EMAIL_TABLES) {
        const { error } = await admin.from(table).delete().eq("email", email);
        if (error) {
          // Marketing rows are secondary. Log and carry on so the account still
          // goes, rather than stranding a half-deleted user.
          console.error("[account] delete failed", table, error.message);
        }
      }
    }

    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      console.error("[account] auth delete failed", authError.message);
      return {
        ok: false,
        error:
          "Your data was removed but the login could not be deleted. Email support@learnincurve.com and we will finish it.",
      };
    }

    await supabase.auth.signOut();
    return { ok: true };
  } catch (err) {
    console.error("[account] deleteOwnAccount", err);
    return {
      ok: false,
      error: "Something went wrong. Please email support@learnincurve.com.",
    };
  }
}
