/** Fisher–Yates shuffle. Reshuffles if the result equals the answer order. */
export function shuffleCopy<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i]!;
    next[i] = next[j]!;
    next[j] = a;
  }
  return next;
}

export function shuffleUntilDifferent<T>(
  items: readonly T[],
  isSameOrder: (a: readonly T[], b: readonly T[]) => boolean = (a, b) =>
    a.length === b.length && a.every((item, i) => item === b[i]),
): T[] {
  if (items.length <= 1) return [...items];
  let next = shuffleCopy(items);
  for (let attempt = 0; attempt < 24 && isSameOrder(next, items); attempt += 1) {
    next = shuffleCopy(items);
  }
  return next;
}
