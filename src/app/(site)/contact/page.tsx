import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Get in touch - Learn in Curve",
  description:
    "Questions, feedback, or collaboration ideas — send Learn in Curve a message.",
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
