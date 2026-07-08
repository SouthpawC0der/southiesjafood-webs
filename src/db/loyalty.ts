import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

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
  points:            number; // positive = earned, negative = redeemed
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
 * Award earned points and deduct redeemed points in a single atomic upsert.
 * Idempotent guard: caller should check that the stripe_session_id hasn't
 * already been processed before calling (orders table handles this via ON CONFLICT).
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

  // Upsert account — GREATEST(0, …) guards against accidental negative balance
  const result = (await sql`
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
  `) as Array<{ points_balance: number }>;

  const finalBalance = result[0]?.points_balance ?? 0;

  // Log earn transaction (balance shown is the final state)
  if (pointsEarned > 0) {
    await sql`
      INSERT INTO loyalty_transactions
        (clerk_user_id, type, points, balance_after, description, stripe_session_id)
      VALUES
        (${clerkUserId}, 'earn', ${pointsEarned}, ${finalBalance},
         ${orderDescription}, ${stripeSessionId})
    `;
  }

  // Log redeem transaction (intermediate balance before earning)
  if (pointsRedeemed > 0) {
    const redeemBalanceAfter = finalBalance - pointsEarned;
    await sql`
      INSERT INTO loyalty_transactions
        (clerk_user_id, type, points, balance_after, description, stripe_session_id)
      VALUES
        (${clerkUserId}, 'redeem', ${-pointsRedeemed}, ${redeemBalanceAfter},
         ${"Redeemed for order discount"}, ${stripeSessionId})
    `;
  }
}
