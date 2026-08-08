import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "how-hard-is-apm-pmq",
  title: "How hard is the APM PMQ really?",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "exam-prep",
  sampleQuestionLos: [1, 10, 23],
  related: [
    "apm-pmq-pass-mark",
    "apm-pmq-exam-format",
    "how-long-to-revise-for-apm-pmq",
  ],
  faqs: [
    faq("Is the APM PMQ harder than the PFQ?"),
    faq("What do people find hardest about the exam?"),
    faq("Can I pass with a short revision window?"),
  ],
});
