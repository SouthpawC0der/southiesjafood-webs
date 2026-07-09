import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getSquare } from "@/lib/square";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user  = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  if (!email) return NextResponse.json({ error: "No email on account." }, { status: 400 });

  try {
    const square = getSquare();

    // Load loyalty program first — if not configured, bail early
    const programRes = await square.loyalty.programs.get({ programId: "main" }).catch(() => null);
    const program    = programRes?.program;
    if (!program) return NextResponse.json({ configured: false });

    // Square loyalty accounts are linked to customers, not emails directly.
    // Look up the Square Customer by email, then find their loyalty account.
    const customerSearch = await square.customers.search({
      query: { filter: { emailAddress: { exact: email } } },
    }).catch(() => null);
    const customerId = customerSearch?.customers?.[0]?.id ?? null;

    const account = customerId
      ? await square.loyalty.accounts.search({
          query: { customerIds: [customerId] },
        }).then((r) => r.loyaltyAccounts?.[0] ?? null).catch(() => null)
      : null;

    const balance        = account?.balance        ?? 0;
    const lifetimePoints = account?.lifetimePoints ?? 0;
    const accountId      = account?.id             ?? null;

    // Reward tiers sorted ascending by points required
    const rewardTiers = (program.rewardTiers ?? [])
      .slice()
      .sort((a, b) => (a.points ?? 0) - (b.points ?? 0));

    const currentTier = [...rewardTiers]
      .reverse()
      .find((t) => balance >= (t.points ?? 0)) ?? rewardTiers[0] ?? null;

    const nextTier = currentTier
      ? rewardTiers.find((t) => (t.points ?? 0) > (currentTier.points ?? 0)) ?? null
      : rewardTiers[0] ?? null;

    const progress = nextTier && currentTier
      ? Math.min(100, Math.round(
          ((balance - (currentTier.points ?? 0)) /
           ((nextTier.points ?? 1) - (currentTier.points ?? 0))) * 100
        ))
      : 100;

    const eventsRes = accountId
      ? await square.loyalty.searchEvents({
          query: {
            filter: { loyaltyAccountFilter: { loyaltyAccountId: accountId } },
          },
          limit: 20,
        }).catch(() => null)
      : null;

    const transactions = (eventsRes?.events ?? []).map((e) => ({
      id:          e.id,
      type:        e.type,
      points:      e.accumulatePoints?.points ?? 0,
      created_at:  e.createdAt,
      description: e.type === "ACCUMULATE_POINTS" ? "Points earned" : "Points redeemed",
    }));

    return NextResponse.json({
      configured:    true,
      accountId,
      balance,
      lifetimePoints,
      currentTier:   currentTier ? { name: currentTier.name, points: currentTier.points } : null,
      nextTier:      nextTier    ? { name: nextTier.name,    points: nextTier.points    } : null,
      ptsToNextTier: nextTier ? Math.max(0, (nextTier.points ?? 0) - balance) : 0,
      progress,
      rewardTiers:   rewardTiers.map((t) => ({ id: t.id, name: t.name, points: t.points })),
      transactions,
    });
  } catch (err) {
    console.error("[loyalty/balance]", err);
    return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  }
}
