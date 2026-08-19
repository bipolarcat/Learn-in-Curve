"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  trackCtaClicked,
  trackPmqOverviewPathwayViewed,
} from "@/lib/analytics/events";

export function TrackedOverviewLink({
  href,
  className,
  children,
  variant,
  location,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  variant: string;
  location: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackCtaClicked({ variant, location })}
    >
      {children}
    </Link>
  );
}

export function PmqPathwayView({
  progressUnits,
  stageCount,
  children,
  className,
}: {
  progressUnits: number;
  stageCount: number;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const sent = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (sent.current) return;
        if (!entries.some((entry) => entry.isIntersecting)) return;
        sent.current = true;
        trackPmqOverviewPathwayViewed({
          progress_units: progressUnits,
          stage_count: stageCount,
        });
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [progressUnits, stageCount]);

  return (
    <section ref={ref} className={className} aria-labelledby="pmq-pathway-heading">
      {children}
    </section>
  );
}
