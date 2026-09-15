import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { getUserProfile } from "@/lib/profile";
import type { HeaderAccount } from "@/components/SiteHeaderMenu";
import type { CourseSlug } from "@/lib/courses/types";
import { PMQ_COURSE_ID } from "@/lib/pmq/constants";
import { getPmqTier } from "@/lib/pmq/queries";
import { getPfqTier } from "@/lib/pfq/entitlement";
import type { PmqTier } from "@/lib/pmq/tiers";
import type { PfqTier } from "@/lib/pfq/tiers";

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
  let courseTiers: Partial<Record<CourseSlug, PmqTier | PfqTier>> | undefined;

  if (user) {
    const [profile, pmqTier, pfqTier] = await Promise.all([
      getUserProfile(supabase, user),
      getPmqTier(supabase, user.id, PMQ_COURSE_ID),
      getPfqTier(supabase, user.id),
    ]);
    const first = profile.first_name?.trim() ?? "";
    const last = profile.last_name?.trim() ?? "";
    const name = [first, last].filter(Boolean).join(" ") || null;
    account = {
      email: user.email?.trim() || "",
      name,
      avatarId: profile.avatar_id,
    };
    courseTiers = {
      "pmq-in-5-days": pmqTier,
      "pfq-in-2-days": pfqTier,
    };
  }

  return (
    <SiteHeader
      isSignedIn={!!user}
      account={account}
      pinned={pinned}
      courseTiers={courseTiers}
    />
  );
}
