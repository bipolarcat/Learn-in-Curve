import { isDemoSkipAuth } from "@/lib/demo";

type DemoBannerProps = {
  /** Real sessions must never see this, even if DEMO_SKIP_AUTH is on. */
  isSignedIn?: boolean;
};

export function DemoBanner({ isSignedIn = false }: DemoBannerProps) {
  if (!isDemoSkipAuth() || isSignedIn) return null;

  return (
    <div className="border-b-2 border-gold bg-gold/20 px-5 py-2 text-center font-body text-xs font-bold uppercase tracking-wider text-ink">
      Demo mode - sign-in skipped. Progress is not saved.
    </div>
  );
}
