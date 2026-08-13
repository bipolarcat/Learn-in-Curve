/**
 * Public-audience filter for list tables (`newsletter_subscribers`,
 * `waitlist_signups`, `leads`).
 *
 * Use this on every count, export, dashboard figure, and send-path read.
 * Do **not** use it on insert, unsubscribe-by-token, or admin debug queries
 * that need to see internal rows.
 *
 * Internal rows stay in the tables — they are excluded from metrics and
 * marketing, not deleted.
 */

type EqChain<Q> = {
  eq: (column: string, value: boolean) => Q;
};

export function publicAudience<Q>(query: EqChain<Q>): Q {
  return query.eq("is_internal", false);
}

/** Admin/debug only — the complement of `publicAudience`. */
export function internalAudience<Q>(query: EqChain<Q>): Q {
  return query.eq("is_internal", true);
}
