# v1 diagram inventory → Mermaid audit

32 SVGs in `PMQ in 5 days/public/diagrams/`, converted where Mermaid can express them.

**Verdict up front: 24 convert, 8 do not.** The eight that fail all fail for the same reason —
their meaning lives in the *geometry* (pyramid taper, circle overlap, colour gradient), and
Mermaid has no vocabulary for geometry. Those stay as hand-authored SVG, which you already have.

Paste each block into mermaid.live one at a time.

---

# A. Converts well (24)

## Trees and hierarchies

### 1. WBS — house build

```
flowchart TB
  R[House build] --> A[Management products]
  R --> B[Site preparation]
  R --> C[Building elements]
  B --> B1[Planning docs]
  B --> B2[Site survey]
  B --> B3[Design drawings]
  B --> B4[Ground clearance]
  B --> B5[Plot marking]
  C --> S[Structure]
  C --> I[Interiors]
  C --> V[Services]
  S --> S1[Foundations]
  S --> S2[Roof frame]
  I --> I1[Flooring]
  I --> I2[Plastering]
```

### 2. WBS — work packages under one deliverable

```
flowchart TB
  C[Building elements] --> S[Structure]
  S --> R[Roof frame]
  R --> W1[Install ridge beam]
  R --> W2[Fix roof joists]
  R --> W3[Lay roof decking]
  R --> W4[Fit roof tiles]
  R --> W5[Install guttering]
```

### 3. WBS — landscaped garden

```
flowchart TB
  R[Landscaped garden] --> A[Management products]
  R --> B[Prepared site]
  R --> C[Construction elements]
  B --> B1[Agreed spec]
  B --> B2[Site description]
  B --> B3[Design]
  B --> B4[Cleared site]
  B --> B5[Marked out layout]
  C --> C1[Building]
  C --> C2[Garden]
  C --> C3[Maintenance facility]
  C1 --> D1[Patio]
  C1 --> D2[BBQ]
  C2 --> D3[Lawns]
  C2 --> D4[Flower beds]
  C3 --> D5[Shed]
```

### 4. CBS tree

```
flowchart TB
  R[Project budget] --> W1[Work package 1]
  R --> W2[Work package 2]
  R --> W3[Work package 3]
  W1 --> D1[Deliverable] --> C1[Cost]
  W2 --> D2[Deliverable] --> C2[Cost]
  W3 --> D3[Deliverable] --> C3[Cost]
```

### 5. Work package structure

```
flowchart TB
  W[Work package 1] --> D1[Deliverable 1]
  W --> D2[Deliverable 2]
  D1 --> C1[Cost]
  D1 --> C2[Cost]
  D2 --> C3[Cost]
```

### 6. Project governance structure

```
flowchart TB
  H[Host / client organisation] --> S[Project sponsor]
  S --> A[Assurance]
  S --> PM[Project manager]
  S --> AD[Administrative support]
  PM --> T[Project delivery teams]
  PM -.optional.-> PO[Product owner]
  T -.context dependent.-> U[End users]
```

## Cycles and processes

### 7. Benefits management life cycle

```
flowchart LR
  A[Identify] --> B[Define] --> C[Plan] --> D[Track] --> E[Realise]
  E --> A
```

### 8. Configuration management cycle

```
flowchart LR
  A[Planning] --> B[Identification] --> C[Control] --> D[Status accounting] --> E[Verification audit]
  E --> A
```

### 9. CPD learning cycle

```
flowchart LR
  A[Reflection on practice] --> B[Planning] --> C[Action] --> D[Evaluation]
  D --> A
```

### 10. Tuckman team development stages

```
flowchart LR
  A[Forming<br/>confusion] --> B[Storming<br/>conflict] --> C[Norming<br/>cooperation] --> D[Performing<br/>collaboration]
  D --> E[Adjourning]
  D --> B
```

### 11. Scope of ethics

```
mindmap
  root((The scope of ethics))
    Rules and regulations
    Values
    Code of practice
    Moral principles
    Ethical practices
    Rules of conduct
```

### 12. Belbin team roles

```
mindmap
  root((Belbin team roles))
    Thinking
      Plant
      Monitor Evaluator
      Specialist
    Action
      Shaper
      Implementer
      Completer Finisher
    People
      Coordinator
      Teamworker
      Resource Investigator
```

*Note: v1's caption says nine roles in four categories. Standard Belbin is nine roles in three
groups. Worth checking whether v1 is wrong.*

### 13. Herzberg two-factor

```
flowchart LR
  H[Hygiene factors<br/>pay, conditions, security] --> HD[Prevent dissatisfaction]
  M[Motivators<br/>achievement, recognition, growth] --> MS[Create satisfaction]
```

## Two-axis grids

### 14. Stakeholder power / interest

```
quadrantChart
    title Stakeholder power and interest
    x-axis Low interest --> High interest
    y-axis Low power --> High power
    quadrant-1 Manage closely
    quadrant-2 Keep satisfied
    quadrant-3 Monitor with minimum effort
    quadrant-4 Keep informed
    Project sponsor: [0.85, 0.90]
    Regulator: [0.35, 0.85]
    Finance director: [0.30, 0.70]
    Delivery team: [0.75, 0.45]
    End users: [0.80, 0.35]
    Neighbouring department: [0.25, 0.25]
```

### 15. SWOT

```
quadrantChart
    title SWOT
    x-axis Internal --> External
    y-axis Unhelpful --> Helpful
    quadrant-1 Opportunities
    quadrant-2 Strengths
    quadrant-3 Weaknesses
    quadrant-4 Threats
```

### 16. Thomas-Kilmann conflict modes

```
quadrantChart
    title Conflict handling modes
    x-axis Uncooperative --> Cooperative
    y-axis Unassertive --> Assertive
    quadrant-1 Collaborate
    quadrant-2 Compete
    quadrant-3 Avoid
    quadrant-4 Accommodate
    Compromise: [0.5, 0.5]
```

### 17. Earned value — CPI vs SPI

```
quadrantChart
    title Cost and schedule performance
    x-axis Late --> Early
    y-axis Overspent --> Underspent
    quadrant-1 Underspent and early
    quadrant-2 Underspent and late
    quadrant-3 Overspent and late
    quadrant-4 Overspent and early
    Current position: [0.35, 0.40]
```

## Schedules and networks

### 18. Critical path — network

```
flowchart LR
  P["Plan<br/>0 | 4 | 4"] --> D["Design<br/>4 | 6 | 10"]
  D --> B["Build<br/>10 | 7 | 17"]
  B --> C["Close<br/>17 | 4 | 21"]
  D --> T["Test<br/>10 | 3 | 13<br/>float 4"]
  T --> C
  P --> PR["Procure<br/>4 | 5 | 9<br/>float 8"]
  PR --> C
```

### 19. Critical path — Gantt

```
gantt
    title Critical path — house build
    dateFormat X
    axisFormat %s
    section Critical
    Plan    :0, 4
    Design  :4, 10
    Build   :10, 17
    Close   :17, 21
    section Has float
    Procure :4, 9
    Test    :10, 13
```

### 20. Critical chain

```
flowchart LR
  A["Amy<br/>5"] --> T["Tom<br/>3"]
  S["Sarah<br/>8"] --> B["Ben<br/>4"]
  T --> P["Priya<br/>5"]
  B --> P
  P --> BUF["Project buffer<br/>10"]
  BUF --> E[End]
```

### 21. Reviews across the life cycle

```
gantt
    title Reviews across the life cycle
    dateFormat X
    axisFormat %s
    section Project
    Concept              :0, 2
    Definition           :2, 4
    Deployment           :4, 6
    Transition           :6, 8
    Decision gate        :milestone, 2, 0
    Decision gate        :milestone, 4, 0
    Post-project review  :milestone, 8, 0
    section Extended
    Adoption             :8, 11
    Benefits realisation :8, 13
    Benefits review      :milestone, 11, 0
    section Ongoing
    Audits               :0, 13
```

### 22. Extended life cycle staircase

```
gantt
    title Extended life cycle
    dateFormat X
    axisFormat %s
    section Project life cycle
    Concept              :0, 2
    Definition           :2, 4
    Deployment           :4, 6
    Transition           :6, 8
    Output               :milestone, 8, 0
    section Extended
    Adoption             :8, 11
    Benefits realisation :8, 13
    Outcome              :milestone, 13, 0
```

## Tables (use a markdown table, not a diagram)

### 23. VUCA

| Challenge | Response |
|---|---|
| Volatility | Vision |
| Uncertainty | Understanding |
| Complexity | Clarity |
| Ambiguity | Agility |

### 24. Communication channels

| Channel | Tactile clues | Auditory clues | Written clues |
|---|---|---|---|
| Face to face | Yes | Yes | Yes |
| Voice only | No | Yes | No |
| Words only | No | No | Yes |

---

# B. Cannot be done in Mermaid (8) — keep the existing SVG

| Diagram | Why Mermaid can't | Keep |
|---|---|---|
| `maslow-hierarchy.svg` | Pyramid. No pyramid type; the taper *is* the argument. | Existing SVG |
| `compliance-pyramid.svg` | Six-layer pyramid, apex-to-base hierarchy. | Existing SVG |
| `project-pyramid.svg` | Five-layer pyramid. | Existing SVG |
| `sustainability-venn.svg` | Four-circle Venn. Overlap carries the meaning. | Existing SVG |
| `governance-assurance-risk-venn.svg` | Three-circle Venn. | Existing SVG |
| `LO2-1_org-structure-authority.svg` | Diagonal authority gradient across functional/matrix/project. Continuous, not discrete. | Existing SVG |
| `risk-probability-impact-matrix.svg` | 5×5 colour-banded heat map. Mermaid quadrant charts are 2×2 only. | Existing SVG |
| `ev-line-chart.svg` | Three time series (PV, EV, AC) with a "today" marker. `xychart-beta` exists but is limited and unstable. | Existing SVG |

---

# C. What this means

**Mermaid covers 75% of the diagram library**, including every tree, cycle, network, schedule
and 2×2 grid. Those are the ones that change most often and benefit most from being text.

**The 8 exceptions are all stable, one-off shapes** — Maslow doesn't get revised, a Venn diagram
of sustainability dimensions doesn't need re-rendering. Hand-authored SVG is the right tool for
them, and they already exist and are properly built (real vector, aria-labels, no raster wrapping).

**Recommended approach: hybrid.**

- Mermaid in the JSON for anything structural — rendered at build time, restyled globally.
- A `file` reference to an existing SVG for the eight geometric ones.

The schema already supports both: a diagram object can carry `mermaid` *or* `file`. No change
needed.

**Also worth noting:** several of these SVGs cover the exact models BoK 8e omits — Maslow,
Herzberg, Belbin, Tuckman, SWOT, Thomas-Kilmann. That's prior work directly relevant to the
source gap flagged in `SOURCE_MAP.md`.
