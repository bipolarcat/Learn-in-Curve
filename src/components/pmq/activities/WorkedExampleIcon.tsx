import { cn } from "@/lib/utils";

type WorkedExampleIconProps = {
  className?: string;
};

/**
 * Four exploded puzzle pieces (visible gaps) in brand colors —
 * worked-example affordance; distinct from Practise’s clipboard.
 */
export function WorkedExampleIcon({ className }: WorkedExampleIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-3.5", className)}
      aria-hidden
    >
      {/* Top-left — orange (tabs right + down) */}
      <g fill="#D5501F">
        <rect x="1.2" y="1.2" width="8.4" height="8.4" rx="1.1" />
        <circle cx="9.6" cy="5.4" r="1.45" />
        <circle cx="5.4" cy="9.6" r="1.45" />
      </g>
      {/* Top-right — teal (tabs left + down) */}
      <g fill="#1B6560">
        <rect x="14.4" y="1.2" width="8.4" height="8.4" rx="1.1" />
        <circle cx="14.4" cy="5.4" r="1.45" />
        <circle cx="18.6" cy="9.6" r="1.45" />
      </g>
      {/* Bottom-left — gold (tabs right + up) */}
      <g fill="#D9A441">
        <rect x="1.2" y="14.4" width="8.4" height="8.4" rx="1.1" />
        <circle cx="9.6" cy="18.6" r="1.45" />
        <circle cx="5.4" cy="14.4" r="1.45" />
      </g>
      {/* Bottom-right — olive (tabs left + up) */}
      <g fill="#5F7A3D">
        <rect x="14.4" y="14.4" width="8.4" height="8.4" rx="1.1" />
        <circle cx="14.4" cy="18.6" r="1.45" />
        <circle cx="18.6" cy="14.4" r="1.45" />
      </g>
    </svg>
  );
}
