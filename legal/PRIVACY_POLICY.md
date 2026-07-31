# Privacy Policy - Learn in Curve

Grounded in what the app actually does today, checked directly against the
Supabase schema and codebase rather than a generic template.

*Last updated: 30 July 2026 · Effective from: 10 July 2026*

## 1. Who we are

Learn in Curve, operated by Sim Samaar Shened ("**we**", "**us**"), operates
learnincurve.com, an AI-assisted revision platform for professional
certifications, currently focused on the APM PMQ exam.

Learn in Curve is not yet an incorporated company - "Sim Samaar Shened" is
named here as the individual data controller, per UK GDPR's identification
requirement.

Contact: support@learnincurve.com

## 2. What we collect, and why

| Data | Where it comes from | Why we collect it | Legal basis (UK GDPR) |
|---|---|---|---|
| Email address, password (hashed) | You, on sign-up | To create and secure your account | Necessary for the contract (providing the service) |
| Profile details (first name, last name, age, profession, a life achievement, target exam deadline) and chosen animal avatar icon | You, on the dashboard Profile menu / course card (optional) | To personalise greetings / chat labels, show your avatar in the AI tutor, and track your exam deadline; never shown to other learners. Avatar is an illustrative icon only, not a photo of you. | Necessary for the contract (personalised account experience) / legitimate interest for optional profile fields |
| Name, profile info | Google, if you sign in with Google | To create your account without a password; may soft-seed first/last name into your profile form until you save your own | Necessary for the contract |
| Course enrollment, entitlements | Automatic, on sign-up / purchase | To know which courses and features (e.g. AI tutor) you can access | Necessary for the contract |
| Quiz answers, correctness, marks | Automatic, as you use the product | To track your progress and show you results | Necessary for the contract |
| XP, streaks, completion status | Automatic, derived from your quiz activity | To power the progress features (XP bar, streak, completion %) | Legitimate interest (running the core product experience you signed up for) |
| Mock exam number, sessions, submitted answers, self-assessed or AI scores, AI marking feedback and grading cost metadata | Automatic, when you sit a mock exam | To resume the selected paper, enforce timing, calculate results, explain AI-marked written-answer scores and issue a certificate on passing | Necessary for the contract |
| Payment confirmation (not card details) | Stripe, after a successful payment | To unlock the AI tutor (or future paid courses) on your account | Necessary for the contract |
| Newsletter email (if you subscribe) | You, opt-in only — course “Notify me” always emails you about that course launch; a separate unticked checkbox covers optional PM & AI newsletters / blogs / marketing | To send the course launch notice you asked for, and (only if ticked) broader product updates | Consent - you can withdraw any time |
| Job application details (CV, cover note) | You, if you apply to a role via the Careers section | To assess your application | Legitimate interest / steps prior to a contract - see the separate Recruitment Privacy Notice |
| AI tutor conversation messages (your messages and the tutor's replies) | You, when you chat with the AI tutor while signed in | To let the tutor remember your conversation across the course, and to generate a personalised summary once you complete all 24 topics | Necessary for the contract (this is a feature of the paid AI tutor unlock) |
| Hashed IP address (not the raw IP) | Automatic, when you use the homepage guest Sly trial without an account | To enforce a hard limit of 3 free live tutor messages per network before asking you to sign up | Legitimate interest (preventing abuse and unbounded AI cost on a public page) |
| Guest trial chat content | You, when you message Sly on the homepage trial | Sent to our AI provider to generate a reply for that session only — **we do not store guest trial messages in our database** | Legitimate interest (providing the trial you requested) |

**AI tutor conversation storage:** the AI tutor stores your conversation with
it when you are signed in - both what you send and what it replies. We do this so the tutor can
remember your conversation across the whole course rather than starting from
zero every time you open it, and so it can give you one proper summary of
your strengths and weaknesses once you finish all 24 topics, grounded in what
you've actually discussed and got right or wrong - not a generic template.
See section 6 for how long this is kept, and section 4 for which third party
helps generate the tutor's replies.

**Homepage guest trial:** if you use “Try Sly for free” without signing up, we
hash your IP address (SHA-256 with a server salt) and count messages against that
hash. We do not keep the raw IP or the guest chat transcript in our database.
Guest messages and replies are still processed by Google’s Gemini API to generate
answers for that live session.

## 3. Cookies

We currently use only strictly-necessary cookies: Supabase's authentication
session cookie, which keeps you signed in. Intercom Messenger is integrated in
the codebase but dormant until an App ID is configured - no Intercom script or
cookies load without that. We do not currently use advertising or
product-analytics cookies. Because the only active cookie is strictly
necessary for the service to function, UK/EU guidance does not require a
consent *choice* for it alone. We still show an on-site cookie notice so you
can open the Cookie Notice and acknowledge you've seen it (stored in local
storage, not as a tracking cookie).

If that changes (product analytics, or Intercom going live), this policy -
and the banner - will be updated before any non-essential cookie is set,
including real accept / reject choices where required.

## 4. Who we share data with

- **Supabase** (database and authentication provider, hosted in the EU -
  eu-west-1/Ireland) - stores all the data in the table above.
- **Google** - only if you choose "Continue with Google" to sign in.
- **Stripe** (payment processor) - the AI tutor isn't open for public
  purchase yet, so no customer payment data is processed today. Once
  purchases open, Stripe will handle your card details directly; we'll never
  see or store your card number, only a payment confirmation and reference.
- **Google (Gemini API)** (AI provider) - in use for the signed-in AI tutor,
  homepage guest Sly trial (unsigned visitors, 3 messages per hashed IP), and
  AI grading of written answers in paid Mock Exams 2–4. Messages or written mock
  answers you submit in those flows, together with the relevant question and
  marking rubric, are sent to Gemini to generate tutoring or grading responses.
  We store signed-in tutor replies and Pro-exam scores/feedback. Exam 1 written
  answers and self-awarded marks stay in Learn in Curve and are not sent to
  Gemini for marking. We built this so the underlying AI provider
  could change in future without a change
  in what data is collected - if that happens, we'll update this section and
  the date above before switching, not after.
- **Intercom** (in-app messenger / feedback) - wired in code but not live
  until an App ID is set in production. Once live, Intercom may process
  contact/message data you choose to send via the messenger, and may set its
  own cookies (see Cookie Notice).

We do not sell your data to anyone, for any reason.

## 5. International transfers

Our database is hosted in the EU (Ireland), and that's where your personal
data lives. We don't currently send customer data to Stripe - the AI tutor
isn't open for public purchase yet. Our own early testing of the AI tutor
does send test conversation data to Google's Gemini API; before the AI tutor
opens to real users, this section will name the specific transfer safeguard
each provider uses (e.g. Standard Contractual Clauses, or the EU-US Data
Privacy Framework if certified under it), and we'll accept Google's data
processing terms for the Gemini API in full before any real user's
conversation data is sent to it.

## 6. How long we keep your data

- **Account and progress data:** kept for as long as your account is active.
- **Mock exam answers, scores and AI feedback:** kept as account progress data
  for as long as your account is active, so you can review previous attempts.
- **AI tutor conversation messages:** kept for 12 months from your most
  recent message, then automatically deleted. Because the window resets each
  time you message the tutor, an ongoing conversation stays available for as
  long as you're actively using it; a conversation you never return to is
  deleted 12 months after your last message in it.
- **Guest trial IP hashes (`guest_tutor_usage`):** kept for 30 days from last
  use, then deleted (or overwritten when the row is cleared). They exist only
  to enforce the 3-message homepage trial limit.
- **If you delete your account:** we'll delete your personal data within
  30 days, except where we're required to keep records for tax/accounting
  purposes (e.g. payment records) for longer, per UK tax law.
- **Newsletter:** kept until you unsubscribe.

Deletion today is a manual step on request to the contact email below; an
automated self-serve deletion flow may replace this later.

## 7. Your rights

Under UK GDPR, you have the right to:

- Access the personal data we hold about you
- Correct inaccurate data
- Ask us to delete your data ("right to be forgotten")
- Ask us to restrict how we use your data
- Receive your data in a portable format
- Object to processing based on legitimate interest
- Complain to the UK Information Commissioner's Office (ico.org.uk) if you think
  we've mishandled your data

To exercise any of these, email support@learnincurve.com.

## 8. Children

This service is intended for working professionals studying for a professional
certification. It isn't directed at, or intended for, children under 16, and we
don't knowingly collect data from anyone under that age.

## 9. Security

We rely on Supabase's and Stripe's infrastructure security (both are SOC 2 /
PCI-DSS compliant respectively) rather than storing sensitive data ourselves -
notably, we never touch raw card numbers. Row-level security is enabled on every
table holding personal data, so a user can only ever read their own rows.

## 10. Changes to this policy

We'll update the "last updated" date at the top whenever this changes, and for
material changes (e.g. a new third-party processor, a new data type collected),
we'll email registered users rather than relying on them checking this page.

## 11. Contact

support@learnincurve.com
