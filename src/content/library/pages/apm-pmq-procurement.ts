import { scaffoldLibraryPage } from "../scaffold";

export const page = scaffoldLibraryPage({
  slug: "apm-pmq-procurement",
  title: "APM PMQ procurement (LO5): what you need to know",
  metaTitle: "APM PMQ Procurement (LO5) | Learn in Curve",
  metaDescription:
    "APM PMQ LO5 procurement: strategy, make-or-buy, supplier selection, BATNA and ZOPA, contract types and reimbursement methods, plus a five-mark answer.",
  group: "syllabus",
  related: [
    "apm-pmq-risk-management",
    "apm-pmq-change-control",
    "apm-pmq-conflict-resolution",
    "apm-pmq-business-case",
    "how-to-answer-apm-pmq-exam-questions",
  ],
  loNumber: 5,
  status: "published",
  updatedAt: "2026-11-14",
  answerFirst:
    "APM PMQ procurement (LO5) tests whether you can plan what to buy before buying it, select suppliers fairly, negotiate from a known walk-away point, and choose contract and payment terms that put risk in the right place. Contracts move risk; they never delete it.",
  body: `Procurement is the point where the project stops controlling work directly and starts controlling it through a contract. That one shift explains most of LO5. It links to risk management (LO23), because contracts move risk around, to change control (LO24), because contract changes need their own route, and to conflict (LO11), because negotiation is shared ground between the two.

## What APM tests you on in LO5

The learning objective is about securing resources from outside the organisation and getting best value from the supply chain. It has three learning outcomes:

- **5a:** the purpose and importance of a procurement strategy, and what it typically contains.
- **5b:** the stages of supplier selection, including planning the process and negotiating (BATNA, ZOPA and win-win).
- **5c:** the features of different contractual relationships, and when to use each reimbursement method: fixed price, cost plus fee, per unit quantity and target cost.

## The procurement strategy comes first (5a)

The expensive mistakes in procurement happen before anyone signs anything: buying the wrong packages, from the wrong kind of supplier, on the wrong kind of contract. The strategy exists to prevent that. Most organisations already have a procurement function, so the project usually aligns to an existing process rather than inventing one.

Working from the business case, the strategy is built in three steps:

| Step | What happens |
|---|---|
| Package breakdown structure (PaBS) | Break the scope into packages that may be bought in, grouped so economies of scale are possible |
| Initial market consultation | Check that suitable goods and services exist, without favouring any supplier ahead of the tender |
| Make-or-buy criteria | Apply common tests to each package to decide in-house or external |

The five make-or-buy criteria are business circumstances, knowledge, delivery, service and risk. Four ask whether you could do the work yourself. Risk is the one that can flip the answer, because contracting can create risk nobody can manage, and that is a legitimate reason to make rather than buy.

APM also warns against buying on functional requirements alone. Early decisions should weigh **lifetime cost of ownership**: whole-life cost, fitness for purpose, durability, availability, reliability, maintainability and efficiency. That often means a higher purchase price and a better outcome.

The sponsor reviews and signs off the procurement management plan before the market is approached, and it then feeds the integrated project management plan.

Strategic sourcing follows. Each package is judged on its financial impact and its supply risk, which sets how close the relationship needs to be: a simple over-the-counter purchase for routine items, through to long-term partnering where the item is critical and hard to replace.

## Selecting suppliers fairly (5b)

The selection sequence runs: prequalification to a shortlist, a formal invitation to tender (ITT) where every bidder answers the same requirements, evaluation against criteria agreed in advance, further shortlisting and negotiation, then award. The short version to memorise is **requirements, criteria, bids, evaluation, winner**. Keep a back-up supplier in case talks with the preferred bidder fail.

Fairness is a process requirement, not a courtesy:

- Late bids are disqualified.
- An answer given to one bidder goes to every bidder.
- Confidentiality between suppliers is maintained.

A tender that is not demonstrably fair is open to legal challenge, and comparing bids is meaningless if suppliers answered different questions. Evaluation weights time, cost and quality through a scoring system shared with bidders, because the cheapest bid is not automatically the best one.

## Negotiation: BATNA, ZOPA and win-win

Negotiation runs in four steps: preparation, opening, bargaining and closing. Preparation decides the outcome; the rest is execution.

| Term | What it means | Why it matters |
|---|---|---|
| BATNA | Your best alternative if no deal is reached | It is your real floor. Any deal worse than it is a loss |
| ZOPA | The range between the two parties' walk-away points | If the ranges do not overlap, no deal exists at any level of skill |
| Win-win | Seeking terms both sides can live with | Driving the hardest bargain is the competing mode and damages long-term relationships |

Keen pricing still matters, but it is weighed against the value obtained. Many organisations must achieve value for money, which is almost never price alone. Once agreed, write the deal down and involve procurement and legal specialists, because two legal entities now have a contract.

## Contracts: relationship and reimbursement (5c)

Contract type answers two separate questions, and merging them loses marks. How many suppliers does this need? That is the **relationship**. How will they be paid? That is the **reimbursement method**.

The five relationships are comprehensive (one supplier does everything), sequential (one designs, another builds), parallel (several work at the same time on separate parts), subcontract (your supplier passes work to another, and your visibility drops) and partnership (suppliers form a joint venture).

Reimbursement decides who carries the risk:

| Method | How it works | Risk sits mostly with | Suits |
|---|---|---|---|
| Fixed price | Set price for defined scope; changes via change requests | Supplier, who prices it into the quote | Simple, well-defined work |
| Cost plus fee | Actual costs paid, plus an agreed fee or percentage | Buyer | Scope that cannot be fixed up front |
| Per unit quantity | Agreed rate per unit, such as per cubic metre or per licence | Total depends on volume delivered | Work where the rate is clear but quantity is uncertain |
| Target cost | Agreed target with savings and overruns shared | Both parties | Work where both sides influence the outcome |

The deciding factor is how precisely the work can be defined before it starts. Target cost is the one to understand properly: fixed price puts risk on the supplier, cost plus puts it on the buyer, and target cost deliberately splits it through a pain and gain share.

The buyer never fully transfers risk. A supplier on a fixed price can still walk away or become insolvent, and the project still needs delivering.

## Who owns what

- **The sponsor** signs off the procurement management plan before the market is approached.
- **The contract manager**, often the project manager, leads the supplier relationship and reports on progress.
- **The supplier** names an agreed point of contact and works to agreed KPIs.
- **Procurement and legal specialists** make sure the contract is sound in law as well as good value.

Contract management starts with people, not paperwork: agree roles, agree performance measures and reporting, agree routes for change and disputes, then close the contract properly with handovers and financial settlement.

## Worked scenario: weak answer vs strong answer

> *A project needs a specialist supplier to build a new data platform. The requirements are still evolving. Explain how the project should approach procuring this work. (5 marks)*

**Weak answer:** "The project should get some quotes and choose the cheapest supplier, then agree a fixed price so all the risk is with the supplier and the project is protected."

That answer chooses on price alone, picks a contract type that does not fit evolving scope and claims risk can be handed over completely. It might scrape one mark.

**Strong answer:**

- Apply the **make-or-buy criteria**, including whether contracting creates risk that cannot be managed, before going to market.
- Run a **fair tender**, with every bidder answering the same requirements and answers to one shared with all.
- Evaluate on **weighted time, cost and quality and lifetime cost**, not purchase price alone.
- Because requirements are evolving, a fixed price is a poor fit; **cost plus fee or target cost** gives the flexibility needed, with target cost sharing the risk.
- Appoint a **contract manager** with agreed KPIs and change and dispute routes, recognising risk is never fully transferred.

Five distinct points across strategy, selection, contract and management, each easy for a marker to credit.

## Common exam traps

- **"A fixed-price contract transfers the risk to the supplier."** Only partly. The supplier prices it in, and can still walk away or become insolvent.
- **"Best value means the lowest price."** No. Weighted scoring and whole-life cost often favour a higher bid.
- **"The strategy is written once you know the suppliers."** No. It comes first, from the business case, and is signed off before going to market.
- **"Buying in always reduces risk."** No. Risk is a make-or-buy criterion, and contracting can create risk.
- **"Your negotiating floor is your target."** No. It is your BATNA.
- **"Procurement ends when the contract is signed."** No. Supplier management and contract closure are part of it.

`,
  practice: [
    {
      prompt: "Which reimbursement method shares savings and overruns between buyer and supplier?",
      options: [
        { key: "A", label: "Fixed price" },
        { key: "B", label: "Cost plus fee" },
        { key: "C", label: "Target cost" },
        { key: "D", label: "Per unit quantity" },
      ],
      correctKey: "C",
    },
    {
      prompt: "During a tender, one bidder asks a clarification question. What should happen?",
      options: [
        { key: "A", label: "Answer that bidder privately" },
        { key: "B", label: "Ignore the question" },
        { key: "C", label: "Share the answer with every bidder" },
        { key: "D", label: "Disqualify the bidder" },
      ],
      correctKey: "C",
    },
    {
      prompt: "The buyer's maximum price is below the seller's minimum. What does this mean?",
      options: [
        { key: "A", label: "There is no zone of possible agreement" },
        { key: "B", label: "The buyer should raise their BATNA" },
        { key: "C", label: "A win-win deal is guaranteed" },
        { key: "D", label: "The seller must accept the offer" },
      ],
      correctKey: "A",
    },
  ],
  faqs: [
    {
      question: "What is LO5 in the APM PMQ?",
      answer:
        "LO5 is procurement: the purpose and contents of a procurement strategy, the stages of supplier selection including negotiation, and the features of contractual relationships and reimbursement methods such as fixed price, cost plus fee, per unit quantity and target cost.",
    },
    {
      question: "What is the difference between BATNA and ZOPA?",
      answer:
        "BATNA is your best alternative if no deal is reached, so it sets your real walk-away point. ZOPA is the range between both parties' walk-away points. If the two do not overlap, there is no deal to be had.",
    },
    {
      question: "When should a fixed-price contract be used?",
      answer:
        "When the work is simple and well defined, so the supplier can price it with confidence. Where scope is uncertain or evolving, cost plus fee or target cost is usually a better fit.",
    },
    {
      question: "Does a fixed-price contract remove the buyer's risk?",
      answer:
        "No. It moves some risk to the supplier, who prices it into the quote. The buyer still carries risk, because a supplier can walk away or become insolvent and the work still has to be delivered.",
    },
  ],
  sources: [
    {
      label: "APM Project Management Qualification (PMQ)",
      url: "https://www.apm.org.uk/qualifications-and-training/project-management-qualification/",
      publisher: "Association for Project Management",
    },
  ],
});
