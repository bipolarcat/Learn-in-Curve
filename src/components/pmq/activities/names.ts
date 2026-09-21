/** Display names for recall activities — UI only, never from content JSON. */
export const ACTIVITY_DISPLAY_NAMES = {
  pairup: "Pair Up",
  lineup: "Line Up",
  groupup: "Group Up",
} as const;

export type ActivityDisplayKey = keyof typeof ACTIVITY_DISPLAY_NAMES;
