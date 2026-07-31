"use client";

import { useState } from "react";
import { SoftNavBackLink } from "@/components/SoftNavBackLink";
import { Spinner } from "@/components/ui/spinner";
import {
  fieldErrorHint,
  formActionPrimary,
  quietFormSurface,
} from "@/components/ui/semantic";
import { SOFT_NAV_BACK } from "@/lib/soft-nav-back";
import styles from "./ContactPage.module.css";

type ContactFormProps = {
  description: string;
  phone: string;
  email: string;
  web: { label: string; url: string };
};

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass = styles.field;
const labelClass = styles.label;

/**
 * Get in touch — paper scroll + quiet form surface.
 * Desktop: left copy column (title top / details bottom) aligned to the
 * form card on the right.
 */
export function ContactForm({
  description,
  phone,
  email,
  web,
}: ContactFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const back = SOFT_NAV_BACK.home;
  const submitting = status === "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    if (!formEmail.trim() || !message.trim()) {
      setStatus("error");
      setErrorMsg("Email and message are required.");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: formEmail,
          subject,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(
          typeof data.error === "string"
            ? data.error
            : "Couldn't send — please try again.",
        );
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't send — check your connection and try again.");
    }
  }

  const details = (
    <aside className={styles.details} aria-label="Contact details">
      <p className={styles.detailBlock}>
        <span className={styles.detailLabel}>Email</span>
        <a href={`mailto:${email}`} className={styles.detailLink}>
          {email}
        </a>
      </p>
      <p className={styles.detailBlock}>
        <span className={styles.detailLabel}>Phone</span>
        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className={styles.detailLink}
        >
          {phone}
        </a>
      </p>
      <p className={styles.detailBlock}>
        <span className={styles.detailLabel}>Web</span>
        <a
          href={web.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.detailLink}
        >
          {web.label}
        </a>
      </p>
    </aside>
  );

  return (
    <section className={styles.page}>
      <div className={`wrap ${styles.inner}`}>
        <SoftNavBackLink
          href={back.href}
          label={back.label}
          busyLabel={back.busyLabel}
          className={styles.back}
        />

        <div className={styles.layout}>
          <div className={styles.copy}>
            <header className={styles.header}>
              <h1 className={styles.title}>
                Get in <span className="text-orange">touch</span>
              </h1>
              <p className={styles.lead}>{description}</p>
            </header>
            <div className={styles.detailsDesktop}>{details}</div>
          </div>

          <div className={`${quietFormSurface} ${styles.card}`}>
            {status === "success" ? (
              <p className={styles.success} role="status">
                Thanks — message received. We&apos;ll get back to you soon.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.row}>
                  <div className={styles.fieldWrap}>
                    <label htmlFor="firstname" className={labelClass}>
                      First name
                    </label>
                    <input
                      id="firstname"
                      type="text"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={fieldClass}
                      placeholder="First name"
                    />
                  </div>
                  <div className={styles.fieldWrap}>
                    <label htmlFor="lastname" className={labelClass}>
                      Last name
                    </label>
                    <input
                      id="lastname"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={fieldClass}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className={styles.fieldWrap}>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={fieldClass}
                    placeholder="you@email.com"
                  />
                </div>

                <div className={styles.fieldWrap}>
                  <label htmlFor="subject" className={labelClass}>
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={fieldClass}
                    placeholder="What’s this about?"
                  />
                </div>

                <div className={styles.fieldWrap}>
                  <label htmlFor="message" className={labelClass}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`${fieldClass} ${styles.textarea}`}
                    placeholder="Type your message here."
                  />
                </div>

                {errorMsg ? (
                  <p className={fieldErrorHint} role="alert">
                    {errorMsg}
                  </p>
                ) : null}

                <div className={styles.submitRow}>
                  <button
                    type="submit"
                    disabled={submitting}
                    aria-busy={submitting}
                    aria-label={
                      submitting ? "Sending message" : "Send message"
                    }
                    className={`${formActionPrimary} ${styles.submit} disabled:cursor-wait disabled:opacity-80`}
                  >
                    {submitting ? (
                      <Spinner
                        variant="ellipsis"
                        size={14}
                        className="text-current"
                        aria-hidden
                      />
                    ) : (
                      "Send message"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className={styles.detailsMobile}>{details}</div>
        </div>
      </div>
    </section>
  );
}
