# [Draft Linear issue — paste into LIC when Linear reconnects]

**Suggested title:** Pre-launch: add exhaustiveness checking + state-machine model tests
**Suggested labels:** chore, quality
**Suggested priority:** High (directly caused 4 bugs found 2026-07-29; blocks confident launch)

---

## Status

Not started. Researched 2026-07-29, no code written yet.

## Decided

This session found and fixed 4 related bugs in the mock-exam flow (`exam_sessions` status handling) and LO progress (`section_progress` completion signals) — all the same root shape: **a status/enum field has multiple independent code paths that branch on it (DB write, list/summary label, detail-page UI router), and it shipped with only some of them updated.** Full incident log: `OPERATIONS.md` (see "Mock exam break window wasn't enforced" + follow-up entry).

Researched (web, 2026-07-29) the best way to stop this class of bug recurring across the rest of the product before launch. Two-part recommendation, not one tool:

**1. TypeScript exhaustiveness checking (prevention, do first — cheap, already in stack)**
Add `switch-exhaustiveness-check` ESLint rule + `never`-type guard pattern to every switch/if-chain that branches on `ExamSessionStatus` (and any other status enum in the codebase — `section_progress` completion state, entitlement status, etc.). Forces a TS build failure if a new enum value is added without updating every branch, instead of shipping a silent gap like the `MockExamRunner.initialPhase()` bug.

```ts
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
// use in a default: branch of every status switch
```

Sources: [typescript-eslint switch-exhaustiveness-check](https://typescript-eslint.io/rules/switch-exhaustiveness-check/), [Safer Exhaustive Switch Statements in TypeScript — meticulous.ai](https://www.meticulous.ai/blog/safer-exhaustive-switch-statements-in-typescript)

**2. fast-check model-based/property testing (verification, do before launch)**
[fast-check](https://fast-check.dev/) — TS-native property-based testing framework (used by Jest, fp-ts, io-ts). Has a model-based testing mode built for state machines: define possible commands (`submitPart1`, `resumeAfterBreak`, `letBreakExpire`, `resumePart2`, ...), it randomly generates thousands of valid sequences and checks real code stays consistent with a simple reference model, shrinking failures to minimal repro. Would have caught the break-timer bug (session stuck "on break" for days) before a real user hit it.

Write one model each for: `exam_sessions` lifecycle, `section_progress` completion.

Sources: [fast-check docs](https://fast-check.dev/), [Property-Based Testing in TypeScript with Fast-Check — davideaversa.it](https://www.davideaversa.it/blog/property-based-testing-typescript-fast-check/), [fast-check GitHub](https://github.com/dubzzz/fast-check)

**Considered and rejected for now:**
- XState — good for *managing* state machines, not *auditing* ones that already exist; rewriting the exam flow into it is a bigger lift than the problem justifies right now.
- AI QA agents (QA.tech, Testsigma, ACCELQ) — real 2026 tools, UI-flow crawlers rather than state-machine verifiers, priced for teams. Worth revisiting post-launch for regression coverage, not a pre-launch fit for a solo build.

Sources: [DigitalOcean — 13 AI Testing Tools 2026](https://www.digitalocean.com/resources/articles/ai-testing-tools), [SSOJet — 10 AI QA Agents](https://ssojet.com/blog/est-ai-qa-agents), [XState + Next.js](https://garden.bradwoods.io/notes/javascript/state-management/xstate/global-state)

## Next action

1. Sim: reconnect Linear (`/mcp` or claude.ai connector settings) so this can live as a real ticket, not a file.
2. Claude/Cursor: add `switch-exhaustiveness-check` ESLint rule repo-wide; fix any switches it flags (start with the 3 that already branch on `ExamSessionStatus`).
3. Claude/Cursor: install fast-check, write model tests for `exam_sessions` and `section_progress` state machines.
4. Once both land, re-open `OPERATIONS.md`'s "Rule going forward" notes and confirm this closes the gap they describe.
