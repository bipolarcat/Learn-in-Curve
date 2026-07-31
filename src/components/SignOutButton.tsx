"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
  title?: string;
};

export function SignOutButton({
  className = "nav-link",
  children,
  "aria-label": ariaLabel = "Sign out",
  title,
}: SignOutButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [exiting, setExiting] = useState(false);

  async function handleSignOut() {
    if (exiting) return;
    setExiting(true);

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
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
