import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-risk-management",
  title: "APM PMQ risk management — what you need to know",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "syllabus",
  sampleQuestionLos: [23],
  related: [
    "apm-pmq-business-case",
    "apm-pmq-stakeholder-management",
    "how-hard-is-apm-pmq",
  ],
  faqs: [
    faq("What does the APM PMQ cover on risk and issues?"),
    faq("How are risk questions typically framed in the exam?"),
    faq("What's the difference between a risk and an issue?"),
  ],
});
