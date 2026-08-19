import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-quality-management",
  title: "APM PMQ quality management: what you need to know",
  metaTitle: "APM PMQ Quality Management: Planning, Assurance and Control | Learn in Curve",
  metaDescription:
    "Quality for the APM PMQ: the difference between quality assurance and quality control, what acceptance criteria are for, the cost of quality, and continual improvement.",
  group: "syllabus",
  related: [
    "apm-pmq-change-control",
    "apm-pmq-risk-management",
    "apm-pmq-breakdown-structures",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "Quality assurance checks the process is capable of producing the right output. Quality control checks the output itself. The PMQ tests whether you can tell them apart and apply the right one to a described situation.",
  body: `Quality is the topic where the everyday meaning of a word actively gets in the way. In normal use, quality means good. On this syllabus it means fit for purpose and conforming to the agreed requirements, which is a much more useful definition and a slightly colder one.

A gold-plated output that exceeds the specification is not high quality. It is uncontrolled scope with a friendly face.

## The three activities

**Quality planning** happens first. It defines what fit for purpose means for this project, in the form of acceptance criteria that can actually be tested, and sets out how quality will be assured and controlled.

**Quality assurance** is process focused. It checks that the way the work is being done is capable of producing a conforming output. Approved methods, competent people, calibrated equipment, defined procedures. It happens during the work and it is normally carried out by someone independent of the delivery team.

**Quality control** is product focused. It inspects, tests or measures the actual output against the acceptance criteria and produces a pass or a fail.

The cleanest way to hold it: **assurance asks whether we are building it right, control asks whether the thing we built is right.**

## Acceptance criteria do the heavy lifting

Acceptance criteria turn a requirement into something testable. Without them, quality control has nothing to check against and handover becomes a negotiation about whether the client is satisfied, which is not a position you want to be in at the end of a project.

Good criteria are measurable, agreed in advance, and owned by the person who will accept the output.

## The cost of quality

Four categories, and the point of them is the relationship between the first two and the last two.

**Prevention** costs are spent stopping defects happening: training, better procedures, better design.

**Appraisal** costs are spent finding defects: inspection, testing, review.

**Internal failure** costs are defects found before handover: rework, scrap.

**External failure** costs are defects found after handover: warranty claims, remedial works, reputation.

However, the point that carries marks is the economics. Money spent on prevention and appraisal is money spent by choice, early, at a known amount. Money spent on failure is spent under pressure, late, at whatever it costs. The further down that list a defect is caught, the more it costs to fix.

## Continual improvement

Quality management is not only about this project. Lessons learned, review points and improvement cycles feed back into how the organisation works next time, which is why closing a project without capturing what went wrong is a quality failure as well as a governance one.

## A worked example

Take a structural concrete frame with a specified strength the design depends on.

Quality planning defines the acceptance criterion up front: a strength figure at a defined age, tested by an accredited laboratory, with a defined number of samples per pour.

Quality assurance is everything that makes a conforming pour likely. An approved method statement, a competent gang, a checked mix design, calibrated batching, an inspection of the reinforcement and formwork before the pour is allowed to start.

Quality control is the cube test afterwards, which passes or fails against the criterion.

A weak answer describes only the cube test. It has described quality control and called it quality management, and it has missed the more important half, because a failed cube test on a poured frame is an internal failure cost measured in weeks. The assurance activity before the pour is what makes that unlikely, and it costs an afternoon.

You've got the exam pattern there too. Scenarios on this topic usually describe a defect discovered late and ask what should have happened. The answer is almost never more inspection.

Essentially: quality means fit for purpose and conforming to the requirement, assurance is about the process while control is about the product, acceptance criteria have to exist before either is possible, and prevention is always cheaper than failure.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on quality management?",
      answer:
        "Quality planning, assurance and control, the definition of quality as fitness for purpose and conformance to requirements, acceptance criteria, the cost of quality, and the role of continual improvement and lessons learned.",
    },
    {
      question: "What is the difference between quality assurance and quality control?",
      answer:
        "Quality assurance is process focused and checks that the way the work is being done is capable of producing a conforming output. Quality control is product focused and checks the output itself against the acceptance criteria.",
    },
    {
      question: "Is exceeding the specification good quality?",
      answer:
        "No. Quality means conforming to the agreed requirement and being fit for purpose. Delivering more than was specified, sometimes called gold plating, is uncontrolled scope and consumes time and cost the project did not agree to spend.",
    },
    {
      question: "What are the four costs of quality?",
      answer:
        "Prevention, spent stopping defects occurring. Appraisal, spent finding them. Internal failure, the cost of defects found before handover. External failure, the cost of defects found after handover. Cost rises sharply the later a defect is found.",
    },
    {
      question: "Why do acceptance criteria matter so much?",
      answer:
        "Because they turn a requirement into something testable. Without them quality control has no standard to check against, and acceptance at handover becomes a subjective negotiation rather than a documented pass or fail.",
    },
  ],
});
