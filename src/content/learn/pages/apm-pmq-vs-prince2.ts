import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-vs-prince2",
  title: "APM PMQ vs PRINCE2 — how do they compare?",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "choosing",
  sampleQuestionLos: [1, 19, 23],
  related: [
    "apm-pmq-vs-pfq",
    "is-apm-pmq-worth-it",
    "apm-pmq-exam-format",
  ],
  faqs: [
    faq("Is APM PMQ the same as PRINCE2 Practitioner?"),
    faq("Which is better for a first project management qualification?"),
    faq("Do UK employers prefer APM or PRINCE2?"),
  ],
});
