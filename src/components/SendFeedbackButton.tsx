"use client";

import { useState } from "react";
import { FeedbackModal } from "@/components/FeedbackModal";

type SendFeedbackButtonProps = {
  className?: string;
  /**
   * Which surface this button lives on, e.g. "Footer", "Sly tutor panel".
   * Goes into the feedback email subject/body so replies have context —
   * never shown to the user.
   */
  source: string;
};

export function SendFeedbackButton({
  className,
  source,
}: SendFeedbackButtonProps) {
  const appId = process.env.NEXT_PUBLIC_INTERCOM_APP_ID;
  const [modalOpen, setModalOpen] = useState(false);
  const classes =
    className ??
    "block py-1 text-left text-[14.5px] text-cream/80 hover:text-gold";

  if (appId) {
    return (
      <button
        type="button"
        className={classes}
        onClick={() => {
          if (typeof window.Intercom === "function") {
            window.Intercom("show");
          }
        }}
      >
        Send feedback
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className={classes}
        onClick={() => setModalOpen(true)}
      >
        Send feedback
      </button>
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        source={source}
      />
    </>
  );
}
