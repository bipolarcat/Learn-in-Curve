import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "how-long-to-revise-for-apm-pmq",
  title: "How long should I revise for the APM PMQ?",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "exam-prep",
  sampleQuestionLos: [4, 12, 23],
  related: [
    "how-hard-is-apm-pmq",
    "apm-pmq-exam-format",
    "is-apm-pmq-worth-it",
  ],
  faqs: [
    faq("Is five days enough to revise for the APM PMQ?"),
    faq("Should I revise all 24 learning objectives equally?"),
    faq("When should I sit a mock exam in my revision plan?"),
  ],
});
