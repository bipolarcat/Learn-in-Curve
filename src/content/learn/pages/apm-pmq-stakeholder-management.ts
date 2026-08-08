import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-stakeholder-management",
  title: "APM PMQ stakeholder management — what you need to know",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "syllabus",
  sampleQuestionLos: [10],
  related: [
    "apm-pmq-business-case",
    "apm-pmq-risk-management",
    "is-apm-pmq-worth-it",
  ],
  faqs: [
    faq("What does the APM PMQ expect on stakeholder engagement?"),
    faq("How are communication and stakeholder questions linked?"),
    faq("What's the difference between a stakeholder and a sponsor?"),
  ],
});
