"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import {
  Toaster as SonnerToaster,
  toast as sonnerToast,
} from "sonner";
import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "error" | "warning";
type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
}

export interface ToasterProps {
  title?: string;
  message: string;
  variant?: Variant;
  duration?: number;
  position?: Position;
  actions?: ActionButton;
  onDismiss?: () => void;
  highlightTitle?: boolean;
  /** Replaces the default variant icon (e.g. Pro / AI Pro chip). */
  leading?: ReactNode;
}

export interface ToasterRef {
  show: (props: ToasterProps) => void;
}

/** LIC short toast — paper chip sized to its copy, quiet border, snappy motion. */
const toastShellBase =
  "inline-flex w-fit max-w-[min(16rem,calc(100vw-1.5rem))] items-center gap-1.5 rounded-[0.35rem] px-1.5 py-1 shadow-[0_1px_2px_rgb(var(--ink-rgb)_/_0.04),0_4px_14px_rgb(var(--ink-rgb)_/_0.08)]";

const toastShell: Record<Variant, string> = {
  default: `${toastShellBase} border border-ink/10 bg-paper dark:border-white/10`,
  success: `${toastShellBase} border border-olive/35 bg-olive/[0.1] dark:border-olive/40 dark:bg-olive/[0.16]`,
  error: `${toastShellBase} border border-rust/35 bg-rust/[0.1] dark:border-rust/40 dark:bg-rust/[0.16]`,
  /* Light teal — stands out on cream without shouting (gate / guidance tips). */
  warning: `${toastShellBase} border border-teal/40 bg-teal/[0.1] dark:border-teal/45 dark:bg-teal/[0.18]`,
};

const variantIconClass: Record<Variant, string> = {
  default: "text-ink/45",
  success: "text-olive",
  error: "text-rust",
  warning: "text-teal",
};

const titleClass: Record<Variant, string> = {
  default: "text-ink",
  success: "text-olive",
  error: "text-rust",
  warning: "text-teal-deep",
};

const messageClass: Record<Variant, string> = {
  default: "text-ink/65",
  success: "text-ink/70",
  error: "text-ink/70",
  warning: "text-teal-deep",
};

const variantIcons: Record<
  Variant,
  ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

const toastAnimation = {
  initial: { opacity: 0, y: 4, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 3, scale: 0.98 },
};

function ToastCard({
  toastId,
  title,
  message,
  variant,
  actions,
  onDismiss,
  highlightTitle,
  leading,
}: {
  toastId: string | number;
  title?: string;
  message: string;
  variant: Variant;
  actions?: ActionButton;
  onDismiss?: () => void;
  highlightTitle?: boolean;
  leading?: ReactNode;
}) {
  const Icon = variantIcons[variant];

  return (
    <motion.div
      variants={toastAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      className={toastShell[variant]}
    >
      {leading != null ? (
        <div className="shrink-0 self-center" aria-hidden>
          {leading}
        </div>
      ) : (
        <Icon
          className={cn(
            "size-3.5 shrink-0 self-center",
            variantIconClass[variant],
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      )}
      <div className="min-w-0 space-y-0.5">
        {title ? (
          <h3
            className={cn(
              "font-body text-[11px] font-semibold leading-none tracking-tight",
              highlightTitle ? titleClass.success : titleClass[variant],
            )}
          >
            {title}
          </h3>
        ) : null}
        <p
          className={cn(
            "font-body text-[11px] font-medium leading-snug tracking-tight text-pretty",
            messageClass[variant],
          )}
        >
          {message}
        </p>
        {actions?.label ? (
          <Button
            variant={actions.variant || "outline"}
            size="sm"
            onClick={() => {
              actions.onClick();
              sonnerToast.dismiss(toastId);
            }}
            className="mt-1 h-7 cursor-pointer px-2 text-[11px]"
          >
            {actions.label}
          </Button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => {
          sonnerToast.dismiss(toastId);
          onDismiss?.();
        }}
        className="shrink-0 rounded-md p-0.5 text-ink/40 transition-colors duration-150 ease-[var(--ease-out-quint)] hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange"
        aria-label="Dismiss notification"
      >
        <X className="size-3" strokeWidth={2.25} aria-hidden />
      </button>
    </motion.div>
  );
}

/** Imperative short toast — preferred for one-off product tips. */
export function showToast({
  title,
  message,
  variant = "default",
  duration = 2800,
  position = "bottom-right",
  actions,
  onDismiss,
  highlightTitle,
  leading,
}: ToasterProps) {
  return sonnerToast.custom(
    (toastId) => (
      <ToastCard
        toastId={toastId}
        title={title}
        message={message}
        variant={variant}
        actions={actions}
        onDismiss={onDismiss}
        highlightTitle={highlightTitle}
        leading={leading}
      />
    ),
    { duration, position },
  );
}

const Toaster = forwardRef<ToasterRef, { defaultPosition?: Position }>(
  ({ defaultPosition = "bottom-right" }, ref) => {
    const toastReference = useRef<ReturnType<typeof sonnerToast.custom> | null>(
      null,
    );

    useImperativeHandle(ref, () => ({
      show(props) {
        toastReference.current = showToast({
          ...props,
          position: props.position ?? defaultPosition,
        });
      },
    }));

    return (
      <SonnerToaster
        position={defaultPosition}
        visibleToasts={3}
        gap={8}
        toastOptions={{
          unstyled: true,
          className: "!w-fit max-w-[min(16rem,calc(100vw-1.5rem))]",
        }}
      />
    );
  },
);

Toaster.displayName = "Toaster";

/** Root mount — one per app. Defer until client to avoid Sonner SSR attribute mismatch. */
export function AppToaster() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  if (!ready) return null;

  return (
    <SonnerToaster
      position="bottom-right"
      visibleToasts={3}
      gap={8}
      toastOptions={{
        unstyled: true,
        className: "!w-fit max-w-[min(16rem,calc(100vw-1.5rem))]",
      }}
    />
  );
}

export default Toaster;
