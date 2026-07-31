/** QA tooling — set NEXT_PUBLIC_QA_MODE=true to show dev-only overrides in the UI. */
export function isQaMode(): boolean {
  return process.env.NEXT_PUBLIC_QA_MODE === "true";
}
