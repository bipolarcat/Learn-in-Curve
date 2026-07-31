import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";

type LoStagePanelProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-labelledby"
> & {
  children: ReactNode;
  labelledBy: string;
  index?: number;
};

type LoStageHeaderProps = {
  eyebrow?: string;
  title: string;
  titleId: string;
  icon: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

export function LoStagePanel({
  children,
  labelledBy,
  index = 0,
  className = "",
  ...props
}: LoStagePanelProps) {
  return (
    <section
      className={`py-4 first:pt-0 last:pb-0 [&+&]:border-t [&+&]:border-ink/10 ${className}`}
      style={{ "--lo-panel-index": index } as CSSProperties}
      aria-labelledby={labelledBy}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Pathway-matched stage header — Lucide-scale glyph + Figtree title
 * (same dialect as Orient; eyebrow prop kept for call-site compat, unused).
 */
export function LoStageHeader({
  title,
  titleId,
  icon,
  description,
  action,
}: LoStageHeaderProps) {
  return (
    <div className="flex items-start gap-2 sm:gap-2.5">
      <span
        className="inline-flex size-10 shrink-0 items-center justify-center text-orange sm:size-11 [&_svg]:size-5 sm:[&_svg]:size-6"
        aria-hidden
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h2
          id={titleId}
          className="font-body text-lg font-semibold leading-snug tracking-tight text-balance text-ink"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-[55ch] font-body text-sm leading-relaxed text-pretty text-ink/60">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="hidden shrink-0 sm:block">{action}</div> : null}
    </div>
  );
}
