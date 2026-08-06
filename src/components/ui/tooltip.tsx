"use client";

import React, { useId } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { cn } from "@/lib/utils";

/**
 * LIC tooltip — 21st/react-tooltip shell, brand tokens.
 *
 * Types map geist aliases → LIC olive/gold/rust/teal (see globals.css).
 * `cream` is the quiet pathway/hint surface (small text on cream paper).
 */
const types = {
  success: "!bg-success !text-cream !border !border-olive/25",
  warning: "!bg-warning !text-ink !border !border-ink/10 !font-semibold",
  error: "!bg-error !text-cream !border !border-rust/25 !font-semibold",
  violet: "!bg-violet !text-cream",
  default: "!bg-foreground !text-background-100",
  cream:
    "!bg-cream !text-ink/60 !border !border-ink/10 !text-[10px] !font-medium !leading-snug !px-2 !py-1 !rounded-md !max-w-[11rem] !shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.05),0_4px_12px_rgb(var(--ink-rgb)_/_0.08)]",
};

export interface TooltipProps {
  children: React.ReactNode;
  text: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  /** When true, 500ms show delay. Pass false for instant (No Delay demo). */
  delay?: boolean;
  boxAlign?: "left" | "right" | "center";
  type?: keyof typeof types;
  tip?: boolean;
  center?: boolean;
  isOpen?: boolean;
  openOnClick?: boolean;
  className?: string;
  /** Avoid full-width wrappers (pathway icons, inline chips). */
  inline?: boolean;
  wrapperClassName?: string;
}

export const Tooltip = ({
  children,
  text,
  position = "top",
  delay = true,
  boxAlign = "center",
  type = "default",
  tip = true,
  center = true,
  isOpen,
  openOnClick,
  className = "",
  inline = false,
  wrapperClassName = "",
}: TooltipProps) => {
  const rawId = useId();
  const id = `tooltip-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const sleek = type === "cream";

  return (
    <div
      className={cn(
        inline ? "inline-flex max-w-full" : "w-full",
        wrapperClassName,
      )}
    >
      <div
        id={id}
        className={cn("font-body", inline ? "inline-flex max-w-full" : "w-full")}
      >
        {children}
      </div>
      <ReactTooltip
        anchorSelect={`#${id}`}
        //@ts-ignore
        place={`${position}${{ left: "-start", right: "-end", center: "" }[boxAlign]}`}
        delayShow={delay ? 500 : 0}
        opacity={1}
        noArrow={!tip}
        isOpen={isOpen}
        openOnClick={openOnClick}
        className={cn(
          "!font-body !z-[60]",
          sleek
            ? "!text-[10px] !max-w-[11rem] !rounded-md !px-2 !py-1 !shadow-none"
            : "!text-[13px] !max-w-72 !rounded-xl !px-3.5 !py-2.5 !shadow-lg transition-opacity duration-300",
          types[type],
          center ? "text-center" : "text-start",
          className,
        )}
      >
        {text}
      </ReactTooltip>
    </div>
  );
};
