import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "is-apm-pmq-worth-it",
  title: "Is the APM PMQ worth it for my career?",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "choosing",
  sampleQuestionLos: [10, 12, 4],
  related: [
    "apm-pmq-vs-pfq",
    "apm-pmq-vs-prince2",
    "how-long-to-revise-for-apm-pmq",
  ],
  faqs: [
    faq("Who typically sits the APM PMQ?"),
    faq("Does the PMQ help if I'm already a practising project manager?"),
    faq("Is the PMQ recognised outside the UK?"),
  ],
});
