"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncThemeCookieFromProfile } from "@/lib/profile-actions";
import { setDocumentTheme } from "@/lib/theme-routes";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
  title?: string;
  role?: string;
};

export function SignOutButton({
  className = "nav-link",
  children,
  "aria-label": ariaLabel = "Sign out",
  title,
  role,
}: SignOutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [exiting, setExiting] = useState(false);

  async function handleSignOut() {
    if (exiting) return;
    setExiting(true);

    await supabase.auth.signOut();

    // Drop the theme mirror cookie with the session. The preference itself
    // stays on the account — this only stops a dark plate being left behind for
    // whoever signs in next on a shared machine. See LIC-114.
    setDocumentTheme("light");
    await syncThemeCookieFromProfile().catch(() => {
      /* the client-side clear above already removed the visible effect */
    });

    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      role={role}
      className={cn(className, exiting && "is-signing-out")}
      aria-label={exiting ? "Signing out" : ariaLabel}
      aria-busy={exiting}
      title={title ?? ariaLabel}
      disabled={exiting}
      data-signing-out={exiting ? "true" : undefined}
    >
      {exiting ? (
        <Spinner
          variant="ellipsis"
          size={16}
          className="text-current"
          aria-hidden
        />
      ) : (
        (children ?? "Sign out")
      )}
    </button>
  );
}
