import {
  SLY_UNLOCK_CREDIT_GBP_CENTS,
  TUTOR_INPUT_USD_PER_M,
  TUTOR_OUTPUT_USD_PER_M,
  USD_PER_GBP,
} from "./constants";

export type TokenUsageRow = {
  input_tokens: number | null;
  output_tokens: number | null;
};

export function estimateTokenCostUsd(
  inputTokens: number,
  outputTokens: number,
): number {
  return (
    (inputTokens * TUTOR_INPUT_USD_PER_M + outputTokens * TUTOR_OUTPUT_USD_PER_M) /
    1_000_000
  );
}

export function sumUsageCostUsd(rows: TokenUsageRow[]): number {
  return rows.reduce((total, row) => {
    const input = row.input_tokens ?? 0;
    const output = row.output_tokens ?? 0;
    return total + estimateTokenCostUsd(input, output);
  }, 0);
}

/** Convert USD model spend to GBP pence (ceil — slightly conservative). */
export function usdToGbpCents(usd: number): number {
  if (usd <= 0) return 0;
  return Math.ceil((usd / USD_PER_GBP) * 100);
}

export function sumUsageCostGbpCents(rows: TokenUsageRow[]): number {
  return usdToGbpCents(sumUsageCostUsd(rows));
}

export function isFairUsageExceeded(
  rows: TokenUsageRow[],
  budgetGbpCents: number,
): boolean {
  if (budgetGbpCents <= 0) return true;
  return sumUsageCostGbpCents(rows) >= budgetGbpCents;
}

export type FairUsageSummary = {
  usedUsd: number;
  /** GBP pence of credited budget. */
  budgetGbpCents: number;
  usedGbpCents: number;
  /** Alias for metre math that previously used USD — same ratio as GBP. */
  budgetUsd: number;
  /** 0–100+ (can exceed 100 if over budget). */
  percentUsed: number;
  /** 0–100, clamped. */
  remainingPercent: number;
  exceeded: boolean;
};

/**
 * Summarise usage against a GBP credit budget.
 * If unlocked but ledger empty (legacy), treat budget as unlock credit (£5).
 */
export function summarizeFairUsage(
  rows: TokenUsageRow[],
  creditGbpCents: number,
  opts: { hasEntitlement?: boolean } = {},
): FairUsageSummary {
  const usedUsd = sumUsageCostUsd(rows);
  const usedGbpCents = usdToGbpCents(usedUsd);
  let budgetGbpCents = creditGbpCents;
  if (budgetGbpCents <= 0 && opts.hasEntitlement) {
    budgetGbpCents = SLY_UNLOCK_CREDIT_GBP_CENTS;
  }
  const percentUsed =
    budgetGbpCents > 0 ? (usedGbpCents / budgetGbpCents) * 100 : 100;
  const exceeded = budgetGbpCents <= 0 || usedGbpCents >= budgetGbpCents;
  const remainingPercent = Math.max(0, Math.min(100, 100 - percentUsed));
  return {
    usedUsd,
    usedGbpCents,
    budgetGbpCents,
    budgetUsd: budgetGbpCents / 100,
    percentUsed,
    remainingPercent,
    exceeded,
  };
}
