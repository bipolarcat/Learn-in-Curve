import Image from "next/image";
import type { ReactNode } from "react";

type IconProps = { className?: string };

/** Same LO stage-header tile chrome. */
function LoIconTile({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={className} aria-hidden>
      {children}
    </span>
  );
}

/** Learn — core content stack (`LoLearnStage` LessonStackIcon) */
export function IconCore({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <rect
          x="4.5"
          y="6"
          width="15"
          height="4"
          rx="1.25"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <rect
          x="4.5"
          y="12"
          width="15"
          height="4"
          rx="1.25"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M8 8.5h5M8 14.5h7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </LoIconTile>
  );
}

/** Practise — quiz pad (`PracticeQuizSection` QuizIcon) */
export function IconPractice({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <rect
          x="5"
          y="4.5"
          width="14"
          height="15"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M9 9.5h6M9 13h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16.5" r="1.25" fill="currentColor" />
      </svg>
    </LoIconTile>
  );
}

/** Computer screen — mock exam */
export function IconMock({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <rect
          x="3.5"
          y="4.5"
          width="17"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M8 20.5h8M12 16.5v4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </LoIconTile>
  );
}

/** Apply — misconceptions (`LoApplyStage` MisconceptionIcon) */
export function IconMisconceptions({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M9.5 9.5 14.5 14.5M14.5 9.5 9.5 14.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </LoIconTile>
  );
}

/** Apply — memory aids (`LoApplyStage` MemoryIcon) */
export function IconMemory({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 4.5h7.5L18.5 8v11.5H7z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 4.5V8H18"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M10 12.5h5M10 15.5h3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </LoIconTile>
  );
}

/** End-of-course report — clipboard with a rising bar chart (AI Pro tier) */
export function IconReport({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <path
          d="M6.5 5.5h11v14h-11z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M9.75 5.5V4h4.5v1.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 16v-2.5M12 16v-5M14.5 16v-3.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </LoIconTile>
  );
}

/** Sly — same fox face as the LO AI tutor panel */
export function IconSly({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <span className="relative inline-flex h-[1.35rem] w-[1.35rem] overflow-hidden rounded-full bg-sand">
        <Image
          src="/mascot/fox-face.svg"
          alt=""
          width={22}
          height={22}
          className="h-full w-full object-cover object-top"
        />
      </span>
    </LoIconTile>
  );
}

/** Video overview (`LoStudyJourney` VideoStageIcon) */
export function IconVideo({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="6"
          width="13"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M16 9.5 21 7v10l-5-2.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    </LoIconTile>
  );
}

/** Audio overview (`LoStudyJourney` AudioStageIcon) */
export function IconAudio({ className }: IconProps) {
  return (
    <LoIconTile className={className}>
      <svg className="h-[1.35rem] w-[1.35rem]" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 10v4M8.5 7v10M12 4.5v15M15.5 7v10M19 10v4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </LoIconTile>
  );
}
