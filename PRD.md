# learn in CURVE – AI-Powered Project Management Certification Study Platform

### TL;DR

learn in CURVE is an AI-powered study platform for project management certifications, targeting busy, motivated professionals. It solves the problem of static, generic, and non-personalized study resources by providing an adaptive, exam-specific AI tutor with progress tracking, accountability, and structured study plans. The initial focus is the APM PMQ exam, expanding to other certifications in later phases.

---

## Goals

### Business Goals

* Achieve 100 paying customers within 90 days of launch
* Maintain a Net Promoter Score (NPS) above 50
* Ensure at least 80% of users who finish the platform pass their targeted exam
* Establish a scalable codebase ready for additional certifications in Phases 2–3

### User Goals

* Enable structured preparation tailored to individual exam results and syllabus requirements
* Provide accountability and trackable progress toward exam deadlines
* Offer personalized, adaptive practice and explanations to close individual knowledge gaps
* Support studying on-the-go, including mobile-friendly access and future voice mode

### Non-Goals

* Cover non-project management certifications in V1
* Provide live human tutoring or real-time cohort-based learning features
* Develop custom native mobile apps (web/mobile browser only for V1)

---

## User Stories

**Primary Persona:**

* Working Professional ("Ayesha, 34, aspiring project manager with a demanding job, employer-funded study, and a 3-month exam deadline")
* As a working professional, I want a daily study plan tailored to my exam date, so I can maximize my limited study time.
* As a busy commuter, I want the platform to be mobile-friendly so I can study on the go.
* As a student preparing for the PMQ, I want AI-generated practice questions based on my weak areas, so I can focus where I need most improvement.
* As someone who values accountability, I want to see my progress and keep up a streak, so I stay motivated.
* As a user, I want easy access to mock exams and explanations so I can test readiness realistically.

**Secondary Persona:**

* HR L&D Manager ("Ben, 37, oversees team's certification completion rates")
* As a manager, I want analytics on my team's study progress, so I can ensure they're on track (OUT OF SCOPE for V1)

---

## Functional Requirements

* **AI Tutoring & Guidance (Priority: Highest):**
  * AI chat tutor customized for APM PMQ syllabus
  * Adaptive responses and explanations, tracking individual weak areas
  * Exam-specific tone, examples, and expectations
* **Adaptive Practice & Mock Exams (Priority: High):**
  * Practice questions with increasing difficulty weighted by user weak areas
  * Full mock exams with AI-generated explanations for every answer
  * Ability to resume incomplete mock exams
* **Progress Tracking & Dashboard (Priority: High):**
  * Visual performance breakdown by topic and across study sessions
  * Streak tracking (daily logins/activity)
  * Exam countdown and status
* **Study Plan & Accountability (Priority: High):**
  * Auto-generated, daily study plan based on user exam date and recent performance
  * Notifications for lapses and encouragement for streak maintenance
* **Access Model & Payment (Priority: Medium):**
  * Free tier with limited access (sample AI chat, limited bank of questions)
  * Standard, Premium, Pro payments via Stripe or similar
* **Mobile Web Experience (Priority: Medium):**
  * Responsive web design suitable for studying during commutes
* **Voice Mode (Priority: Lower for V1, to be prototyped for future):**
  * Placeholder/copy introducing upcoming voice tutor (actual voice feature in Phase 2)

---

## User Experience

**Entry Point & First-Time User Experience**

* User discovers the platform via web search, social media, or employer referral.
* Signup via email or Google/LinkedIn. Prompts to set exam date and select certification (PMQ only in V1).
* Quick onboarding quiz to assess baseline knowledge and guide next steps.

**Core Experience**

* Step 1: User is greeted with a personalized dashboard: days left, streak, current weak areas, study plan for today.
  * Clean, uncluttered interface with call-to-action on today's tasks.
  * Exam countdown and progress stats are highly visible.
* Step 2: User enters AI tutor chat to ask questions or receive structured guidance.
  * Tutor emphasizes syllabus focus and exam-specific advice.
  * Immediate feedback, with adaptive pointers to topic review or extra practice.
* Step 3: Practice mode presents questions in weak areas, tracks answers, rates confidence.
  * Explanations shown after responses for deeper learning.
  * Mixed modes: Quick review, full-length mock exams.
* Step 4: User completes mock exams, receives AI-generated score and topic-wise feedback.
* Step 5: Accountability features—streak updates after each activity, gentle nudges if lapses occur, summary sent via email/push.

**Advanced Features & Edge Cases**

* If user consistently skips one topic, AI tutor flags this and re-prioritizes the plan.
* Catch-up plans auto-generated after inactivity.
* Exam date change updates plan dynamically.
* Voice mode: Banner hints at upcoming feature (activate on clicking, but limited to preview/demo for V1).

**UI/UX Highlights**

* High-contrast, accessible design for readability
* Fully responsive for use on mobile browsers
* Effortless navigation between dashboard, tutor, and practice/mocks
* Simple, one-tap actions for busy/mobile users
* Contextual tips for new/returning users

---

## Narrative

Ayesha is a 34-year-old professional, juggling her full-time job with preparation for her upcoming PMQ certification. She's eager but overwhelmed: she tried PDFs and YouTube, but found little structure and no clear metric of readiness. With her employer's support, she signs up for learn in CURVE. From day one, the AI tutor pinpoints her weak spots and builds daily plans around the real syllabus. Her study dashboard feels like a coach—reminding her of the exam date, celebrating her progress, and nudging her back on track after busy weeks. Practice sessions adapt intelligently, focusing her energy. She aces several mock exams, gaining confidence. Come exam day, she feels prepared, not just from knowledge, but because the structure and accountability made her journey manageable. She not only passes, but recommends the platform to colleagues—showing it benefits both user and business.

---

## Success Metrics

### User-Centric Metrics

* Number of users completing daily study plan (active engagement)
* Study streak duration (average & maximum)
* User satisfaction (NPS, post-exam rating, survey)
* Exam pass rate among users completing the course

### Business Metrics

* 100+ paying customers within 90 days
* Conversion rate from free to paid tier
* Retention rate (30/60/90-day)
* Average revenue per user (ARPU)

### Technical Metrics

* Platform uptime 99.5%+
* API response latency under 2 seconds
* Error rate below 1% for key features

### Tracking Plan

* User signups and onboarding funnel completion
* Practice question and mock exam sessions started/completed
* AI tutor chat sessions/messages per user
* Streak and progress updates
* Payment events and tier upgrades

---

## Technical Considerations

### Technical Needs

* Supabase PostgreSQL for user data, performance stats, and progress tracking
* Anthropic API for AI tutoring, question generation, and explanations
* Web front-end: React/Next.js (continuation of PMQ in 5 Days codebase)
* Voice mode integration: ElevenLabs (Phase 2 – placeholder for V1)

### Integration Points

* Payment processor (Stripe) integration
* Email and optional push notifications API
* Future: ElevenLabs (voice)

### Data Storage & Privacy

* Store progress and user data in Supabase (GDPR compliant)
* No storage of personal conversation content (privacy-first)
* All payment data handled via PCI DSS-compliant provider

### Scalability & Performance

* Optimized for up to 2,000 concurrent users in V1
* Horizontal scaling available via Railway deployment

### Potential Challenges

* Ensuring exam content coverage and up-to-date syllabus alignment
* Handling user engagement dropoff and dormant accounts
* Avoiding AI hallucinations in exam answers
* Balancing free tier usefulness vs. paid conversion incentives

---

## Milestones & Sequencing

### Project Estimate

* Medium: 2–4 weeks for Phase 1 MVP (core PMQ flow, web only)

### Team Size & Composition

* Small Team: 2 total people (1 full-stack engineer, 1 product/UX + light QA)

### Suggested Phases

**Core MVP Build (2 weeks)**

* Deliverables: AI tutor (PMQ only), adaptive practice, mock exams, dashboard, exam countdown, payment wall
* Dependencies: Anthropic API, Supabase base code, Stripe

**User Feedback Loop & Free Tier Optimization (1 week)**

* Deliverables: Welcome/onboarding flow, limited feature sandbox for free users, NPS survey
* Dependencies: Active test users

**Accountability & Streak System (1 week)**

* Deliverables: Streak logic, notifications, exam countdown refinements
* Dependencies: Notification/email API

---

Summary: This PRD provides a focused, actionable roadmap for learn in CURVE Phase 1 launch—delivering a differentiated, exam-specific, adaptive AI-powered study experience for working professionals tackling project management certifications.
