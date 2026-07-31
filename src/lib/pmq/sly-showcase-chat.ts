/**
 * Scripted Sly conversation for the landing console.
 *
 * Decorative only — it is typed out by a timer, never sent anywhere, and is
 * replaced the moment a visitor interacts with the composer. Lives here rather
 * than inside a component so both the legacy `SlyMacConsole` and the merged
 * `SlyTutorWindow` read from one copy.
 */
export const SLY_SHOWCASE_CHAT = [
  {
    role: "sly" as const,
    text: "You're shaky on stakeholder mapping. Want to drill that?",
  },
  {
    role: "user" as const,
    text: "Yes. What's the exam trap here?",
  },
  {
    role: "sly" as const,
    text: "They mix power vs interest. Name who can block you first, then interest.",
  },
  {
    role: "user" as const,
    text: "So high power, high interest is the top priority?",
  },
  {
    role: "sly" as const,
    text: "Right — manage those closely. But check attitude too: high power + negative means loop in your sponsor, not just you.",
  },
  {
    role: "user" as const,
    text: "How do I keep all four combinations straight under pressure?",
  },
  {
    role: "sly" as const,
    text: "Manage closely, keep satisfied, keep informed, monitor. Draw the grid first, plot the stakeholder, then write.",
  },
  {
    role: "user" as const,
    text: "That's clicking now. Will this show up as a scenario question?",
  },
  {
    role: "sly" as const,
    text: "Almost always — LO10 loves scenarios. Want a quick practice one to lock it in?",
  },
  {
    role: "user" as const,
    text: "Go on then.",
  },
  {
    role: "sly" as const,
    text: "Here's one: a regulator has high power, low interest, neutral attitude. What's your engagement approach?",
  },
] as const;
