/**
 * Trap School content — sourced from PFQ in 2 days/PFQ_TRAP_SCHOOL.md.
 * Figures are from the published sample paper / handbook. Do not round.
 */

export type PfqTrapPair = { confused: string; holdApart: string };

export const PFQ_TRAP_SCHOOL = {
  why: {
    title: "Why this module exists",
    body: 'Roughly a fifth of the marks in a PFQ paper turn on question format, not on project management knowledge. You can know the syllabus and still drop marks to a word like "not". Four traps, twelve minutes, worth more than another pass through the risk chapter.',
  },
  traps: [
    {
      id: "negative",
      title: "Trap 1 — the negative stem",
      frequency:
        "Frequency: 5 questions in 60 (8.3%) in the published sample paper.",
      examples: [
        "Which of the following is not a stage in an issue resolution process?",
        "Which of the following statements about scheduling is false?",
      ],
      body: "Three of the four options are correct statements. Under a one-minute clock, your eye finds a true statement, recognises it, and selects it — which is exactly wrong.",
      whatToDo:
        'when you see not, false, or least, mark the question mentally as inverted before reading any option. Then ask of each option: "is this true?" and pick the one where the answer is no. It costs three seconds and it is the highest-value habit on this page.',
    },
    {
      id: "combination",
      title: "Trap 2 — the numbered-list combination",
      frequency:
        "Frequency: 6 questions in 60 (10%) in the published sample paper.",
      exampleBlock: `Which of the following are typical estimating methods?
1) Analogous 2) Parametric 3) Analytical 4) Incremental
a. 1, 2 and 3 b. 1, 2 and 4 c. 2, 3 and 4 d. 1, 3 and 4`,
      body: "This is four true/false judgements for one mark. Partial knowledge scores zero, which is what makes it feel harder than it is.",
      whatToDo:
        'don\'t evaluate the four options. Evaluate the four items. Find the single item you are confident is wrong, then strike out every option containing it — that usually kills two or three options instantly. In the example above, knowing that "incremental" is a delivery approach and not an estimating method removes two options in one move.',
      extra:
        "Watch for the reverse shape too: a list where one item is the odd one out because it's a benefit rather than a challenge, or a help rather than a problem.",
    },
    {
      id: "near_miss",
      title: "Trap 3 — the near-miss definition",
      body: 'This is the dominant failure mode in the PFQ and it is a direct consequence of how the syllabus is written: 29 of the 59 learning outcomes begin with "Define" or "State".',
      body2:
        "The examiner does not test whether you understand a concept. They test whether you can tell it apart from the concept next to it. The wrong options are usually correct definitions — of something else.",
      pairsIntro:
        "The pairs and sets worth drilling until they're automatic:",
      pairs: [
        {
          confused: "Risk / issue",
          holdApart:
            "A risk might happen; an issue has happened",
        },
        {
          confused: "Programme / portfolio",
          holdApart:
            "Programme coordinates related projects; portfolio selects and prioritises against strategy",
        },
        {
          confused: "Hybrid / extended life cycle",
          holdApart:
            "Hybrid mixes linear and iterative; extended runs past handover into adoption and benefits",
        },
        {
          confused: "Quality planning / assurance / control",
          holdApart:
            "Plan the standard; assure the process; control the product",
        },
        {
          confused: "Levelling / smoothing",
          holdApart:
            "Levelling respects a resource limit and lets the date move; smoothing protects the date and evens out usage",
        },
        {
          confused: "Change control / configuration management",
          holdApart: "Change control decides; configuration management records",
        },
        {
          confused: "PBS / WBS / CBS / OBS / RAM",
          holdApart: "Products / work / cost / people; RAM = WBS × OBS",
        },
        {
          confused:
            "Decision gate / post-project review / benefits review / audit",
          holdApart:
            "Proceed? / how did we do? / did the benefits land? / did we follow the rules?",
        },
      ] satisfies PfqTrapPair[],
      whatToDo:
        "read the stem, answer it in your own head, then look at the options. If you read the options first, a well-written near-miss will feel familiar — because it is familiar. It's just the answer to a different question.",
    },
    {
      id: "absolutes",
      title: "Trap 4 — absolutes",
      body: "Options containing all, every, always, never, guarantees, ensures that no, or removes the need for are wrong far more often than they're right. Project management manages uncertainty; it does not eliminate it, and almost nothing in the syllabus is absolute.",
      body2:
        "This is a tie-breaker, not a rule. Use it when you're down to two options and out of time.",
    },
  ],
  clock: {
    title: "The clock, and the guessing policy",
    intro: "Handbook facts, not opinion:",
    bullets: [
      "60 questions, 60 minutes. APM's own advice is one minute per question including reading time.",
      "No negative marking. An unanswered question scores 0. A wrong answer also scores 0.",
      "You can flag questions and come back. The review panel filters by Unattempted, Attempted and Flagged.",
      "Pass mark is 36 out of 60. You can get 24 questions wrong and still pass.",
    ],
    rule: "Which produces one non-negotiable rule: never leave a question blank. A blind guess is a 25% chance of a mark and costs nothing. If you're stuck for more than about 40 seconds, pick your best option, flag it, and move on — a flagged guess is strictly better than a blank you meant to return to and didn't.",
    lastFive:
      "The last five minutes are for the flagged list, not for a full re-read.",
  },
  oneLiner:
    'Read the stem twice when it contains "not". Attack list questions item-by-item, not option-by-option. Answer in your head before you read the options. Distrust absolutes. Never leave a blank.',
} as const;
