import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";

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

  return <SiteHeader isSignedIn={!!user} pinned={pinned} />;
}
