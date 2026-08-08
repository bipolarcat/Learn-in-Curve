import { faq, scaffoldLearnPage } from "../scaffold";

export const page = scaffoldLearnPage({
  slug: "apm-pmq-pass-mark",
  title: "What's the APM PMQ pass mark?",
  metaTitle: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  metaDescription: "TODO_COPY — see VOICE_GUIDE.md. Do not ship.",
  group: "exam-prep",
  sampleQuestionLos: [4, 10, 23],
  related: [
    "apm-pmq-exam-format",
    "how-hard-is-apm-pmq",
    "how-long-to-revise-for-apm-pmq",
  ],
  faqs: [
    faq("Is the APM PMQ pass mark a fixed percentage?"),
    faq("What happens if I miss the pass mark by a few marks?"),
    faq("Does every paper have the same pass mark?"),
  ],
});
