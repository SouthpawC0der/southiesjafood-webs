import { getSql } from "./client";

/* ── Types ────────────────────────────────────────────────────────────────── */

export type LoyaltyAccount = {
  clerk_user_id:         string;
  points_balance:        number;
  points_earned_total:   number;
  points_redeemed_total: number;
};

export type LoyaltyTransaction = {
  id:                string;
  type:              "earn" | "redeem";
  points:            number;
  balance_after:     number;
  description:       string;
  stripe_session_id: string | null;
  created_at:        string;
};

/* ── Queries ──────────────────────────────────────────────────────────────── */

export async function getLoyaltyAccount(clerkUserId: string): Promise<LoyaltyAccount | null> {
  const sql = getSql();
  const rows = (await sql`
    SELECT clerk_user_id, points_balance, points_earned_total, points_redeemed_total
    FROM loyalty_accounts
    WHERE clerk_user_id = ${clerkUserId}
  `) as LoyaltyAccount[];
  return rows[0] ?? null;
}

export async function getLoyaltyTransactions(
  clerkUserId: string,
  limit = 20
): Promise<LoyaltyTransaction[]> {
  const sql = getSql();
  return (await sql`
    SELECT id, type, points, balance_after, description, stripe_session_id, created_at
    FROM loyalty_transactions
    WHERE clerk_user_id = ${clerkUserId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as LoyaltyTransaction[];
}

/**
 * Award earned points and deduct redeemed points in a single atomic CTE.
 * All three writes (account upsert + up to two transaction inserts) happen in
 * one round-trip. ON CONFLICT (stripe_session_id, type) DO NOTHING provides
 * DB-level idempotency so Stripe webhook retries are safe.
 *
 * Use this when points have NOT been pre-deducted at checkout time.
 */
export async function awardAndDeductPoints(params: {
  clerkUserId:      string;
  pointsEarned:     number;
  pointsRedeemed:   number;
  stripeSessionId:  string;
  orderDescription: string;
}): Promise<void> {
  const { clerkUserId, pointsEarned, pointsRedeemed, stripeSessionId, orderDescription } = params;
  const sql = getSql();
  const net = pointsEarned - pointsRedeemed;

  await sql`
    WITH
      acct AS (
        INSERT INTO loyalty_accounts
          (clerk_user_id, points_balance, points_earned_total, points_redeemed_total)
        VALUES
          (${clerkUserId}, ${Math.max(0, net)}, ${pointsEarned}, ${pointsRedeemed})
        ON CONFLICT (clerk_user_id) DO UPDATE SET
          points_balance        = GREATEST(0, loyalty_accounts.points_balance + ${net}),
          points_earned_total   = loyalty_accounts.points_earned_total   + ${pointsEarned},
          points_redeemed_total = loyalty_accounts.points_redeemed_total + ${pointsRedeemed},
          updated_at            = now()
        RETURNING points_balance
      ),
      earn AS (
        INSERT INTO loyalty_transactions
          (clerk_user_id, type, points, balance_after, description, stripe_session_id)
        SELECT
          ${clerkUserId}, 'earn', ${pointsEarned},
          (SELECT points_balance FROM acct),
          ${orderDescription}, ${stripeSessionId}
        WHERE ${pointsEarned} > 0
        ON CONFLICT (stripe_session_id, type) DO NOTHING
      ),
      redeem AS (
        INSERT INTO loyalty_transactions
          (clerk_user_id, type, points, balance_after, description, stripe_session_id)
        SELECT
          ${clerkUserId}, 'redeem', ${-pointsRedeemed},
          GREATEST(0, (SELECT points_balance FROM acct) - ${pointsEarned}),
          'Redeemed for order discount', ${stripeSessionId}
        WHERE ${pointsRedeemed} > 0
        ON CONFLICT (stripe_session_id, type) DO NOTHING
      )
    SELECT points_balance FROM acct
  `;
}

/**
 * Award earned points when the redemption was already applied at checkout
 * (pre-deducted path). The balance was reduced at checkout; this only adds
 * earned points and logs both transactions for the audit trail.
 */
export async function awardEarnedPoints(params: {
  clerkUserId:      string;
  pointsEarned:     number;
  pointsRedeemed:   number;
  stripeSessionId:  string;
  orderDescription: string;
}): Promise<void> {
  const { clerkUserId, pointsEarned, pointsRedeemed, stripeSessionId, orderDescription } = params;
  const sql = getSql();

  await sql`
    WITH
      acct AS (
        INSERT INTO loyalty_accounts
          (clerk_user_id, points_balance, points_earned_total, points_redeemed_total)
        VALUES
          (${clerkUserId}, ${pointsEarned}, ${pointsEarned}, ${pointsRedeemed})
        ON CONFLICT (clerk_user_id) DO UPDATE SET
          points_balance      = loyalty_accounts.points_balance + ${pointsEarned},
          points_earned_total = loyalty_accounts.points_earned_total + ${pointsEarned},
          points_redeemed_total = loyalty_accounts.points_redeemed_total + ${pointsRedeemed},
          updated_at          = now()
        RETURNING points_balance
      ),
      earn AS (
        INSERT INTO loyalty_transactions
          (clerk_user_id, type, points, balance_after, description, stripe_session_id)
        SELECT
          ${clerkUserId}, 'earn', ${pointsEarned},
          (SELECT points_balance FROM acct),
          ${orderDescription}, ${stripeSessionId}
        WHERE ${pointsEarned} > 0
        ON CONFLICT (stripe_session_id, type) DO NOTHING
      ),
      redeem AS (
        INSERT INTO loyalty_transactions
          (clerk_user_id, type, points, balance_after, description, stripe_session_id)
        SELECT
          ${clerkUserId}, 'redeem', ${-pointsRedeemed},
          GREATEST(0, (SELECT points_balance FROM acct) - ${pointsEarned}),
          'Redeemed for order discount (pre-authorized at checkout)', ${stripeSessionId}
        WHERE ${pointsRedeemed} > 0
        ON CONFLICT (stripe_session_id, type) DO NOTHING
      )
    SELECT points_balance FROM acct
  `;
}

/**
 * Atomically reserve points at checkout time to prevent TOCTOU races.
 * Returns true if reservation succeeded (balance was sufficient), false if not.
 */
export async function reservePoints(clerkUserId: string, points: number): Promise<boolean> {
  const sql = getSql();
  const rows = (await sql`
    UPDATE loyalty_accounts
    SET points_balance = points_balance - ${points}, updated_at = now()
    WHERE clerk_user_id = ${clerkUserId} AND points_balance >= ${points}
    RETURNING points_balance
  `) as Array<{ points_balance: number }>;
  return rows.length > 0;
}

/**
 * Restore previously reserved points (called when checkout is abandoned or fails).
 */
export async function releaseReservedPoints(clerkUserId: string, points: number): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE loyalty_accounts
    SET points_balance = points_balance + ${points}, updated_at = now()
    WHERE clerk_user_id = ${clerkUserId}
  `;
}
