"use client";

import { NotifyDialog } from "@/components/NotifyDialog";
import { PFQ_LIST_KEY } from "@/lib/notify/lists";

type PfqNotifyDialogProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * PFQ in 2 Days launch waitlist.
 *
 * Thin wrapper — the dialog itself now lives in `NotifyDialog` so the AI Pro
 * Bundle card can reuse the same capture, `/api/notify` endpoint and marketing
 * consent handling rather than growing a second near-identical dialog. Kept as
 * its own named component so existing callers (`CoursesCatalog`) don't change
 * and the PFQ copy stays in one obvious place.
 */
export function PfqNotifyDialog({ open, onClose }: PfqNotifyDialogProps) {
  return (
    <NotifyDialog
      open={open}
      onClose={onClose}
      notifyKey={PFQ_LIST_KEY}
      subjectLabel="PFQ in 2 Days"
      courseCopy="PFQ in 2 Days"
    />
  );
}
