import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { conversationSurface } from "@/components/ui/semantic";
import styles from "@/components/SlyChrome.module.css";

type SlyPanelShellProps = HTMLAttributes<HTMLElement> & {
  label: string;
  children: ReactNode;
};

export const SlyPanelShell = forwardRef<HTMLElement, SlyPanelShellProps>(
  function SlyPanelShell({ label, children, className = "", ...props }, ref) {
    return (
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`${styles.panel} ${conversationSurface} fixed inset-x-0 bottom-0 z-50 flex h-[min(92vh,720px)] w-full flex-col rounded-t-2xl border-b-0 md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-w-[440px] md:rounded-none md:border-b md:border-l md:border-r-0 md:border-t-0 ${className}`}
        {...props}
      >
        {children}
      </aside>
    );
  },
);

export function SlyPanelHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`${styles.header} relative z-20 flex shrink-0 items-center gap-2.5 px-3 py-2.5 text-paper ${className}`}
    >
      {children}
    </header>
  );
}

export { styles as slyChromeStyles };
