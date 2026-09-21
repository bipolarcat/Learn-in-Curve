import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { buildTitle } from "@/lib/seo/title";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://www.learnincurve.com";

export const metadata: Metadata = {
  title: buildTitle("Get in touch"),
  description:
    "Questions about the courses, feedback on a mock, or a collaboration idea — send Learn in Curve a message and we will get back to you.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <ContactForm
      description="Questions, feedback, or a collaboration idea - send a message and we'll get back to you."
      phone="+44 7552 249 983"
      email="hello@learnincurve.com"
      web={{ label: "LearnInCurve.com", url: "https://www.LearnInCurve.com" }}
    />
  );
}
