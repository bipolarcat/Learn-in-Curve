import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-scheduling-and-critical-path",
  title: "APM PMQ scheduling and the critical path: what you need to know",
  metaTitle: "APM PMQ Scheduling: Critical Path, Float, Crashing and Levelling | Learn in Curve",
  metaDescription:
    "Scheduling for the APM PMQ: critical path and float, total versus free float, crashing versus fast tracking, and the difference between resource levelling and smoothing.",
  group: "syllabus",
  related: [
    "apm-pmq-breakdown-structures",
    "apm-pmq-risk-management",
    "apm-pmq-change-control",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "The critical path is the longest sequence of dependent activities through a project. It has no float, and it sets the shortest possible duration. Anything late on it makes the project late.",
  body: `Scheduling is the topic where the exam most rewards precision, because the terms have exact meanings and candidates frequently use two of them as if they were interchangeable. Levelling and smoothing is the classic pair. Crashing and fast tracking is the other.

## Dependencies and the network

A schedule starts as a network of activities joined by dependencies. **Finish to start** is the common one: the second activity cannot begin until the first finishes. You will also meet start to start, finish to finish, and occasionally start to finish.

**Lead** pulls an activity forward so it overlaps its predecessor. **Lag** pushes it back by a set delay, such as waiting seven days for concrete to cure.

Once the network exists, a forward pass gives you the earliest each activity can start and finish, and a backward pass gives you the latest each can start and finish without delaying the project.

## Float, and the two kinds of it

**Total float** is how long an activity can slip without delaying the project end date.

**Free float** is how long it can slip without delaying the next activity.

The difference matters in scenarios. An activity with five days of total float and zero free float can slip without hurting the completion date, but it will push its successor immediately, which is a conversation with whoever owns that successor.

## The critical path

The **critical path** is the longest path through the network. Its activities have zero total float, and its length is the project duration.

Two things candidates get wrong. A project can have more than one critical path at the same time. And the critical path moves. Compress it, and something else becomes critical, which is why re-running the schedule after a change is part of the change rather than an afterthought.

## Compressing a schedule

**Crashing** adds resource to critical activities to shorten them. It costs money, and the return diminishes fast, because a second team on a small workface gets in the way of the first.

**Fast tracking** runs activities in parallel that were planned in sequence. It costs no money directly and adds risk, because you are starting work on the basis of information that is not yet final and may have to rework it.

However, the exam is not asking which is better. It is asking which fits the described constraint. A project with contingency budget and no tolerance for rework should crash. A project with a fixed budget and a client who accepts some rework risk should fast track.

## Levelling and smoothing

The pair candidates mix up most.

**Resource levelling** respects the resource limit. Where demand exceeds what you have, activities move, and the end date can extend. Use it when the resource constraint is real, for example one certified inspector.

**Resource smoothing** respects the end date. Activities move within their float to flatten the peaks, and the completion date does not change. Use it when the date is fixed and you are trying to avoid a hiring spike.

The test is simple: **levelling protects the resource, smoothing protects the date.**

## A worked example

Take a fit-out where testing and commissioning sits on the critical path at four weeks, and the handover date has been committed to a tenant.

A weak answer says: add more people.

A stronger answer works it through. Crashing commissioning means a second commissioning engineer, and commissioning is sequential by system, so the second engineer produces perhaps three days rather than two weeks and costs a fortnight of fee. Fast tracking means starting commissioning on completed systems before the last one is finished, which recovers real time but risks re-testing anything affected by late works. The recommendation is to fast track by system, hold the risk explicitly with a named owner, and protect the last system by smoothing the second fix labour into the float ahead of it rather than levelling, because the date is the fixed thing here.

Notice the answer says which option, why, and what it costs. That is the shape the marks are in.

Essentially: know your float definitions, remember the critical path can move and can be plural, keep crashing and fast tracking straight by what each one spends, and hold onto levelling protects the resource while smoothing protects the date.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on scheduling?",
      answer:
        "Network diagrams and dependency types, forward and backward passes, total and free float, the critical path and its use, milestones and baselines, schedule compression through crashing and fast tracking, and resource levelling and smoothing.",
    },
    {
      question: "What is the critical path?",
      answer:
        "The longest sequence of dependent activities through the network. Its activities have zero total float and its length determines the shortest possible project duration, so any delay to it delays the project.",
    },
    {
      question: "What is the difference between total float and free float?",
      answer:
        "Total float is how long an activity can slip without delaying the project completion date. Free float is how long it can slip without delaying the activity that follows it.",
    },
    {
      question: "What is the difference between crashing and fast tracking?",
      answer:
        "Crashing shortens critical activities by adding resource, which costs money. Fast tracking overlaps activities that were planned in sequence, which costs no money directly but adds the risk of rework because later work starts on incomplete information.",
    },
    {
      question: "What is the difference between resource levelling and resource smoothing?",
      answer:
        "Levelling respects the resource limit and allows the end date to move. Smoothing respects the end date and moves activities within their float to flatten resource peaks. Levelling protects the resource, smoothing protects the date.",
    },
  ],
});
