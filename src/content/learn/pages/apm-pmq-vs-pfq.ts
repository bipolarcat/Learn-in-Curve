import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-vs-pfq",
  title: "APM PMQ vs PFQ — which should I take?",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "choosing",
  sampleQuestionLos: [1, 4, 10],
  related: [
    "apm-pmq-vs-prince2",
    "is-apm-pmq-worth-it",
    "how-hard-is-apm-pmq",
  ],
  faqs: [
    faq("Is the PFQ a prerequisite for the PMQ?"),
    faq("Which qualification do employers recognise more?"),
    faq("Can I skip the PFQ and go straight to the PMQ?"),
  ],
});
