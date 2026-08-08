import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-business-case",
  title: "APM PMQ business case — what you need to know",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "syllabus",
  sampleQuestionLos: [4],
  related: [
    "apm-pmq-risk-management",
    "apm-pmq-stakeholder-management",
    "apm-pmq-exam-format",
  ],
  faqs: [
    faq("What does the APM PMQ expect you to know about the business case?"),
    faq("How is the business case tested in the exam?"),
    faq("What's the difference between a business case and a benefits plan?"),
  ],
});
