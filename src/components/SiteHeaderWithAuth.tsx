import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { getUserProfile } from "@/lib/profile";
import type { HeaderAccount } from "@/components/SiteHeaderMenu";

type SiteHeaderWithAuthProps = {
  /** Pass through to SiteHeader — false on courses so the bar scrolls away. */
  pinned?: boolean;
};

export async function SiteHeaderWithAuth({
  pinned = true,
}: SiteHeaderWithAuthProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let account: HeaderAccount | null = null;
  if (user) {
    const profile = await getUserProfile(supabase, user);
    const first = profile.first_name?.trim() ?? "";
    const last = profile.last_name?.trim() ?? "";
    const name = [first, last].filter(Boolean).join(" ") || null;
    account = {
      email: user.email?.trim() || "",
      name,
      avatarId: profile.avatar_id,
    };
  }

  return (
    <SiteHeader isSignedIn={!!user} account={account} pinned={pinned} />
  );
}
