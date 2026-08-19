import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-leadership-and-teams",
  title: "APM PMQ leadership and teams: what you need to know",
  metaTitle: "APM PMQ Leadership and Teamwork: Models the Exam Actually Tests | Learn in Curve",
  metaDescription:
    "Leadership and teams for the APM PMQ: situational leadership, Tuckman, Belbin, motivation theory, and how to apply a model to a scenario rather than recite it.",
  group: "syllabus",
  related: [
    "apm-pmq-stakeholder-management",
    "apm-pmq-governance",
    "how-hard-is-apm-pmq",
  ],
  status: "published",
  updatedAt: "2026-08-19",
  answerFirst:
    "Leadership on this syllabus is about influencing people you often do not manage. The exam gives you a team in a specific state and asks what you would do, so the marks are in applying a model, not describing one.",
  body: `This is the topic where naming a theory feels like an answer and is not one. Writing that Tuckman identified four stages of team development earns very little. Reading a described team, saying which stage it is in, and setting out what you would do about it is a different piece of work entirely.

## Leadership and management

**Management** is about the work: planning it, organising it, controlling it, making sure it happens.

**Leadership** is about the people: setting direction, building commitment, influencing behaviour towards a goal.

A project manager needs both, and the distinction matters in scenarios because a described problem is usually one or the other. A team that does not know what to do next has a management problem. A team that knows exactly what to do and is not doing it has a leadership problem, and adding another plan will not fix it.

## Situational leadership

The core idea is that there is no single best style. The right style depends on the person and the task, specifically on how competent and how committed they are for that particular piece of work.

That gives you a spread from directive, where you tell a capable-but-new person exactly what to do, through coaching and supporting, to delegating, where an experienced and motivated person is handed the outcome and left alone.

The same person needs different styles for different tasks, which is the part candidates miss. A senior engineer who needs no direction on design may need a great deal on a governance process they have never used.

You will also meet the continuum from a leader who simply decides and announces, through consulting, to a leader who delegates the decision to the team. The choice depends on how much time you have, how much expertise sits in the team, and how much commitment you need from them to make the decision stick.

## Tuckman

Teams move through **forming**, where people are polite and unsure, **storming**, where disagreement about roles and approach surfaces, **norming**, where ways of working settle, and **performing**, where the team delivers with little friction. Many teams then **adjourn**.

Two things the exam rewards. Storming is normal and necessary, so a project manager who suppresses it produces a team that appears to be norming and is actually avoiding each other. And the stages are not one-way: a new member, a change of scope or a new client contact can push a performing team back to storming.

## Belbin

Belbin describes the roles people tend to take in a team, covering thinking roles, people roles and action roles. The practical use in an answer is balance. A team of nine people who all want to generate ideas and nobody who wants to finish anything will produce a great deal of documentation and no completed work.

## Motivation

Three frameworks come up regularly.

**Maslow** puts needs in a hierarchy, from basic security up to self actualisation, and the point in a project context is that someone worried about whether they still have a job in three months is not going to be motivated by an interesting technical challenge.

**Herzberg** separates hygiene factors from motivators. Pay, conditions and job security do not motivate, but their absence demotivates. Achievement, recognition, responsibility and the work itself are what motivate. That is the most directly examinable of the three, because it explains why a bonus fixes nothing for a team that feels ignored.

**McGregor** contrasts Theory X, which assumes people avoid work and need controlling, with Theory Y, which assumes people will take responsibility given the right conditions. The useful angle is that the assumption tends to be self fulfilling.

## A worked example

Take a project team six weeks in. A recently promoted lead engineer has taken over from someone who ran the team for four years. Progress has stalled, two people have raised the same issue separately rather than in the meeting, and the client contact has changed as well.

A weak answer says the team is storming and recommends a team building session.

However, the stronger answer separates the causes. Two changes of key person have pushed a settled team back from performing into storming, which is expected rather than alarming. The private escalations are the signal, because disagreement moving out of the room is what makes storming destructive rather than useful. So the project manager surfaces the conflict deliberately, in a session where the roles and interfaces get re-agreed rather than assumed. Alongside that, the new lead needs a more directive style than their predecessor did, not because they are less capable, but because they are new to this task, and the recognition point from Herzberg matters here: the team that lost its long-standing lead needs its contribution acknowledged rather than a new process.

Essentially: know the models well enough to name them accurately, then spend your revision on reading a described team and saying what state it is in and what you would change. That second part is what the paper is buying.`,
  faqs: [
    {
      question: "What does the APM PMQ cover on leadership and teamwork?",
      answer:
        "The difference between leadership and management, situational and adaptive leadership styles, team development including Tuckman, team roles including Belbin, motivation theory including Maslow, Herzberg and McGregor, and the challenges of virtual and dispersed teams.",
    },
    {
      question: "What is the difference between leadership and management?",
      answer:
        "Management is about the work, so planning, organising and controlling it. Leadership is about the people, so setting direction, building commitment and influencing behaviour. A project manager needs both, and scenarios usually describe a shortfall in one.",
    },
    {
      question: "Why does the exam like Tuckman so much?",
      answer:
        "Because it gives you a way to diagnose a described team rather than just describe it. The valuable points are that storming is normal and productive if surfaced, and that a team can regress when people or scope change.",
    },
    {
      question: "What is the main point of Herzberg for a project manager?",
      answer:
        "That hygiene factors such as pay, conditions and job security do not motivate, although their absence demotivates. Motivation comes from achievement, recognition, responsibility and the work itself, which is why financial fixes rarely solve engagement problems.",
    },
    {
      question: "How should I answer a leadership scenario question?",
      answer:
        "Diagnose the situation first, name the model that fits it, then say what you would do and why that suits this team and this task. Answers that describe a theory without applying it to the scenario tend to score poorly.",
    },
  ],
});
