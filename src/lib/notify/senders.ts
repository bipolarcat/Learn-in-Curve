/**
 * Every Resend "from" address in one place.
 *
 * Read at call time, not module load: a module-level const would freeze the
 * value at boot and ignore Railway variable changes until a full rebuild.
 */
const DEFAULT_DOMAIN = "learnincurve.com";

function sender(label: string, mailbox: string): string {
  const domain = process.env.EMAIL_SENDING_DOMAIN ?? DEFAULT_DOMAIN;
  return `${label} <${mailbox}@${domain}>`;
}

export const notifyFrom = () =>
  process.env.NOTIFY_EMAIL_FROM ?? sender("Learn in Curve", "hello");
export const contactFrom = () => sender("Learn in Curve contact", "hello");
export const feedbackFrom = () => sender("Learn in Curve feedback", "hello");
export const alertFrom = () => sender("Learn in Curve alerts", "hello");
