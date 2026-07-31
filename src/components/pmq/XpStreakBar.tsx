"use client";

type XpStreakBarProps = {
  xp: number;
  streak: number;
  /** `info` = quiet metadata pills (headers / cards). `badge` = stamped chips. */
  variant?: "info" | "badge";
};

type PillTone = "default" | "quiet";

const infoPillBase =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-body text-[11px] font-bold tabular-nums tracking-wide shadow-[1px_1px_0_rgba(36,26,18,0.14)]";

const infoPillSm =
  "inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 font-body text-[10px] font-bold tabular-nums tracking-wide shadow-[1px_1px_0_rgba(36,26,18,0.12)]";

const quietPillBase =
  "inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-cream/50 px-2.5 py-1 font-body text-[11px] font-bold tabular-nums tracking-wide text-ink";

const quietPillSm =
  "inline-flex items-center gap-1 rounded-lg border border-ink/10 bg-cream/50 px-2 py-0.5 font-body text-[10px] font-bold tabular-nums tracking-wide text-ink";

function pillClass(size: "default" | "sm", tone: PillTone) {
  if (tone === "quiet") return size === "sm" ? quietPillSm : quietPillBase;
  return size === "sm" ? infoPillSm : infoPillBase;
}

export function CompletionInfoPill({
  percent,
  size = "default",
  tone = "default",
}: {
  percent: number;
  size?: "default" | "sm";
  tone?: PillTone;
}) {
  const base = pillClass(size, tone);
  return (
    <span
      className={
        tone === "quiet"
          ? `${base} text-olive`
          : `${base} border-olive/40 bg-paper text-olive`
      }
      aria-label={`${percent}% of course complete`}
    >
      {percent}%
      <span
        className={`font-bold uppercase tracking-wider ${
          tone === "quiet" ? "text-olive/70" : "text-olive/80"
        }`}
      >
        done
      </span>
    </span>
  );
}

/** XP + streak + % complete — same quiet pills as the LO study header. */
export function StudyInfoPills({
  xp,
  streak,
  completionPercent,
  size = "default",
  tone = "default",
}: {
  xp: number;
  streak: number;
  completionPercent: number;
  size?: "default" | "sm";
  tone?: PillTone;
}) {
  return (
    <div
      className={`flex shrink-0 flex-wrap items-center ${size === "sm" ? "gap-1" : "gap-1.5"}`}
    >
      <XpStreakBar xp={xp} streak={streak} variant="info" size={size} tone={tone} />
      <CompletionInfoPill
        percent={completionPercent}
        size={size}
        tone={tone}
      />
    </div>
  );
}

export function XpStreakBar({
  xp,
  streak,
  variant = "badge",
  size = "default",
  tone = "default",
}: XpStreakBarProps & { size?: "default" | "sm"; tone?: PillTone }) {
  if (variant === "info") {
    const base = pillClass(size, tone);
    return (
      <div
        className={`flex flex-wrap items-center ${size === "sm" ? "gap-1" : "gap-1.5"}`}
      >
        <span
          className={
            tone === "quiet"
              ? base
              : `${base} border-ink/20 bg-paper text-ink`
          }
          aria-label={`${xp} experience points`}
        >
          <span className="text-orange" aria-hidden>
            ✦
          </span>
          {xp}
          <span className="uppercase tracking-wider text-ink/55">XP</span>
        </span>
        <span
          className={
            tone === "quiet"
              ? base
              : `${base} border-ink/20 bg-paper text-ink`
          }
          aria-label={`${streak} day streak`}
        >
          <span aria-hidden>🔥</span>
          {streak}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="inline-flex items-center gap-1.5 rounded-xl border-[2.5px] border-ink bg-ink px-3 py-1.5 font-body text-[11px] font-bold text-gold shadow-[2px_2px_0_var(--shadow-ink)]"
        aria-label={`${xp} experience points`}
      >
        <span aria-hidden>✦</span>
        <span className="tabular-nums">{xp}</span>
        <span className="uppercase tracking-wider">XP</span>
      </div>
      <div
        className="inline-flex items-center gap-1.5 rounded-xl border-[2.5px] border-ink bg-paper px-3 py-1.5 font-body text-[11px] font-bold text-ink shadow-[2px_2px_0_var(--shadow-ink)]"
        aria-label={`${streak} day streak`}
      >
        <span aria-hidden>🔥</span>
        <span className="tabular-nums">{streak}</span>
      </div>
    </div>
  );
}
