import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-exam-format",
  title: "What's the APM PMQ exam format?",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "exam-prep",
  sampleQuestionLos: [1, 20, 22],
  related: [
    "apm-pmq-pass-mark",
    "how-hard-is-apm-pmq",
    "how-long-to-revise-for-apm-pmq",
  ],
  faqs: [
    faq("How many questions are on the APM PMQ?"),
    faq("Is the exam open book?"),
    faq("What question types appear on the paper?"),
  ],
});
