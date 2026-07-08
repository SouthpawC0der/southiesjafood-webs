import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getLoyaltyAccount, getLoyaltyTransactions } from "@/db/loyalty";
import { getTier, getNextTier, tierProgress } from "@/lib/loyalty-config";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [account, transactions] = await Promise.all([
      getLoyaltyAccount(userId),
      getLoyaltyTransactions(userId, 20),
    ]);

    const balance       = account?.points_balance        ?? 0;
    const earned        = account?.points_earned_total   ?? 0;
    const redeemed      = account?.points_redeemed_total ?? 0;
    const tier          = getTier(earned);
    const nextTier      = getNextTier(earned);
    const progress      = tierProgress(earned);
    const ptsToNextTier = nextTier ? nextTier.min - earned : 0;

    return NextResponse.json({
      balance,
      earned,
      redeemed,
      tier:         tier.name,
      tierLabel:    tier.label,
      nextTier:     nextTier?.name ?? null,
      ptsToNextTier,
      progress,
      transactions,
    });
  } catch (err) {
    console.error("[loyalty/balance]", err);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
