/** Fisher–Yates shuffle; mutates a copy. */
export function shuffleInPlace<T>(items: T[], random = Math.random): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

export function shuffleOptionOrder(random = Math.random): string[] {
  return shuffleInPlace(["a", "b", "c", "d"], random);
}

/**
 * Rebuild options object in the shuffled display order, remapping keys to a–d
 * in the new order so the UI always shows a/b/c/d labels while the stored
 * selection letter matches this attempt's option_order.
 *
 * option_order stores the *original* bank keys in display sequence.
 * Display key at index i is String.fromCharCode(97+i) mapping to bank key option_order[i].
 */
export function optionsForAttempt(
  bankOptions: Record<string, string>,
  optionOrder: string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  optionOrder.forEach((bankKey, index) => {
    const displayKey = String.fromCharCode(97 + index);
    out[displayKey] = bankOptions[bankKey] ?? "";
  });
  return out;
}

/** Map a display selection (a–d) back to the bank answer letter. */
export function displayToBankAnswer(
  selectedDisplay: string | null,
  optionOrder: string[],
): string | null {
  if (!selectedDisplay) return null;
  const index = selectedDisplay.charCodeAt(0) - 97;
  if (index < 0 || index >= optionOrder.length) return null;
  return optionOrder[index] ?? null;
}

/** Map bank answer letter to display letter for this attempt's shuffle. */
export function bankToDisplayAnswer(
  bankAnswer: string,
  optionOrder: string[],
): string {
  const index = optionOrder.indexOf(bankAnswer);
  if (index < 0) return bankAnswer;
  return String.fromCharCode(97 + index);
}
