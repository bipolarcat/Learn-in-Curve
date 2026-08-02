"use client";

import React, { useId } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const types = {
  success: "!bg-olive !text-cream !border !border-olive/20",
  warning: "!bg-gold !text-ink !border !border-ink/10 !font-semibold",
  error: "!bg-rust !text-cream !border !border-cream/20 !font-semibold",
  violet: "!bg-teal !text-cream",
  default: "!bg-ink !text-cream",
};

export interface TooltipProps {
  children: React.ReactNode;
  text: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: boolean;
  boxAlign?: "left" | "right" | "center";
  type?: keyof typeof types;
  tip?: boolean;
  center?: boolean;
  isOpen?: boolean;
  openOnClick?: boolean;
  className?: string;
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
}: TooltipProps) => {
  const rawId = useId();
  const id = `tooltip-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="w-full">
      <div id={id} className="font-body w-full">
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
        className={`!font-body !text-[13px] !max-w-72 !rounded-xl !px-3.5 !py-2.5 !shadow-lg !z-50 transition-opacity duration-300 ${
          types[type]
        }${center ? " text-center" : " text-start"} ${className}`}
      >
        {text}
      </ReactTooltip>
    </div>
  );
};
