import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { Package, LogOut, ArrowRight, Star, TrendingUp } from "lucide-react";
import { getOrdersForUser, type OrderStatus, type OrderWithItems } from "@/db";
import { getLoyaltyAccount, getLoyaltyTransactions, type LoyaltyTransaction } from "@/db/loyalty";
import { formatPrice } from "@/lib/menu-data";
import { getTier, getNextTier, tierProgress, pointsToCents } from "@/lib/loyalty-config";

export const metadata = { title: "My Account | Southie's Ja Foods" };
export const dynamic  = "force-dynamic";

const STATUS_STYLE: Record<OrderStatus, { label: string; cls: string }> = {
  pending:          { label: "Pending",          cls: "bg-[var(--cream)] text-[var(--ink)]" },
  paid:             { label: "Paid",             cls: "bg-[var(--gold)] text-[var(--ink)]" },
  preparing:        { label: "Preparing",        cls: "bg-[var(--gold)] text-[var(--ink)]" },
  ready_for_pickup: { label: "Ready for Pickup", cls: "bg-[var(--green)] text-white" },
  completed:        { label: "Completed",        cls: "bg-[var(--ink)] text-white" },
  cancelled:        { label: "Cancelled",        cls: "bg-red-600 text-white" },
};

const TIER_STYLE: Record<string, string> = {
  Gold:   "bg-[#D4AF37] text-[var(--ink)]",
  Silver: "bg-[#94A3B8] text-[var(--ink)]",
  Bronze: "bg-[#92400E] text-white",
};

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) return null;

  const firstName = user.firstName ?? user.emailAddresses[0]?.emailAddress.split("@")[0] ?? "friend";

  const [orders, loyaltyAccount, loyaltyTx] = await Promise.all([
    getOrdersForUser(user.id).catch(() => [] as OrderWithItems[]),
    getLoyaltyAccount(user.id).catch(() => null),
    getLoyaltyTransactions(user.id, 10).catch(() => [] as LoyaltyTransaction[]),
  ]);

  const balance      = loyaltyAccount?.points_balance        ?? 0;
  const earned       = loyaltyAccount?.points_earned_total   ?? 0;
  const redeemed     = loyaltyAccount?.points_redeemed_total ?? 0;
  const tier         = getTier(earned);
  const nextTier     = getNextTier(earned);
  const progress     = tierProgress(earned);
  const ptsToNext    = nextTier ? nextTier.min - earned : 0;
  const dollarValue  = (pointsToCents(balance) / 100).toFixed(2);

  return (
    <div className="bg-[var(--paper)] min-h-screen pt-[76px]">

      {/* ═══ Header ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--ink)] border-b-2 border-[var(--ink)]">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 py-14
                        flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <span className="kicker text-[var(--gold)] mb-4 block">My Account</span>
            <h1 className="font-display text-white leading-[0.92]"
                style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}>
              Wah Gwaan, {firstName}!
            </h1>
            <p className="text-white/55 mt-3">{user.emailAddresses[0]?.emailAddress}</p>
          </div>
          <SignOutButton>
            <button className="btn-block btn-on-dark bg-transparent text-white hover:bg-white/10 !py-3 !px-6 text-[13px] shrink-0">
              <LogOut size={15} /> Sign Out
            </button>
          </SignOutButton>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 py-14 space-y-14">

        {/* ═══ Loyalty Card ═════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Star size={20} className="text-[var(--gold)]" fill="currentColor" />
            <h2 className="font-display text-4xl text-[var(--ink)]">Rewards</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Balance card */}
            <div className="block-card p-7 lg:col-span-2">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--faint)] mb-1">
                    Point Balance
                  </p>
                  <p className="font-display text-6xl text-[var(--ink)] leading-none">
                    {balance.toLocaleString()}
                  </p>
                  <p className="text-[var(--muted)] text-sm mt-1">
                    ≈ <strong className="text-[var(--green)]">${dollarValue}</strong> in rewards
                  </p>
                </div>
                <span className={`chip text-sm font-black px-4 py-1.5 ${TIER_STYLE[tier.name] ?? ""}`}>
                  {tier.name}
                </span>
              </div>

              {/* Tier progress */}
              {nextTier ? (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[var(--muted)] mb-2">
                    <span>{tier.name}</span>
                    <span>{ptsToNext.toLocaleString()} pts to {nextTier.name}</span>
                  </div>
                  <div className="h-3 bg-[var(--cream)] border-2 border-[var(--ink)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--gold)] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--faint)] mt-2">{nextTier.label}</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-[var(--cream)] border-2 border-[var(--ink)] px-4 py-3">
                  <Star size={16} className="text-[#D4AF37]" fill="currentColor" />
                  <p className="text-sm font-bold text-[var(--ink)]">
                    You&apos;ve reached Gold — maximum earn rate!
                  </p>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { label: "Lifetime Earned",   value: earned.toLocaleString()   + " pts" },
                  { label: "Lifetime Redeemed", value: redeemed.toLocaleString() + " pts" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--cream)] border-2 border-[var(--ink)] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--faint)]">{label}</p>
                    <p className="font-display text-2xl text-[var(--ink)] mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="block-card p-7 bg-[var(--ink)] text-white flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-[var(--gold)]" />
                <h3 className="font-display text-2xl">How It Works</h3>
              </div>
              <ul className="space-y-4 text-sm flex-1">
                {[
                  { tier: "Bronze", pts: "10 pts / $1",  threshold: "0 – 999 lifetime pts"  },
                  { tier: "Silver", pts: "12 pts / $1",  threshold: "1,000 lifetime pts"     },
                  { tier: "Gold",   pts: "15 pts / $1",  threshold: "3,000 lifetime pts"     },
                ].map(({ tier: t, pts, threshold }) => (
                  <li key={t} className="flex justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <span>
                      <span className={`text-xs font-black mr-2 px-2 py-0.5 ${TIER_STYLE[t] ?? ""}`}>{t}</span>
                      <span className="text-white/70">{threshold}</span>
                    </span>
                    <span className="font-bold text-[var(--gold)] shrink-0 ml-2">{pts}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/10 pt-4 text-xs text-white/55 space-y-1">
                <p>100 pts = $1 off your next order</p>
                <p>Minimum 500 pts ($5) to redeem</p>
              </div>
              {balance >= 500 && (
                <Link href="/menu" className="btn-block btn-gold !py-3 text-[13px]">
                  Redeem at Checkout <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ═══ Transaction History ══════════════════════════════════════════════ */}
        {loyaltyTx.length > 0 && (
          <section>
            <h2 className="font-display text-4xl text-[var(--ink)] mb-6">Points History</h2>
            <div className="block-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--cream)] border-b-2 border-[var(--ink)]">
                  <tr>
                    {["Date", "Description", "Points", "Balance"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-black uppercase tracking-widest text-[var(--faint)]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loyaltyTx.map((tx, i) => {
                    const isEarn = tx.type === "earn";
                    return (
                      <tr key={tx.id}
                        className={`border-b border-[var(--line-soft)] last:border-0 ${i % 2 === 1 ? "bg-[var(--cream)]/30" : ""}`}>
                        <td className="px-5 py-3 text-[var(--muted)] whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3 text-[var(--ink)] font-semibold max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className={`px-5 py-3 font-black ${isEarn ? "text-[var(--green)]" : "text-red-500"}`}>
                          {isEarn ? "+" : ""}{tx.points.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 font-bold text-[var(--ink)]">
                          {tx.balance_after.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══ Order History ════════════════════════════════════════════════════ */}
        <section>
          <h2 className="font-display text-4xl text-[var(--ink)] mb-6">Order History</h2>

          {orders.length === 0 ? (
            <div className="block-card p-12 flex flex-col items-center text-center">
              <span className="w-14 h-14 bg-[var(--cream)] border-2 border-[var(--ink)] flex items-center justify-center mb-5">
                <Package size={22} className="text-[var(--muted)]" />
              </span>
              <h3 className="font-display text-3xl text-[var(--ink)] mb-2">No orders yet</h3>
              <p className="text-[var(--muted)] text-sm mb-7 max-w-xs">
                When you place your first order it&apos;ll show up here — and you&apos;ll earn points automatically.
              </p>
              <Link href="/menu" className="btn-block btn-green !py-3 !px-6 text-[13px]">
                Browse the Menu <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const status = STATUS_STYLE[order.status];
                const placed = new Date(order.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                  hour: "numeric", minute: "2-digit",
                });
                return (
                  <article key={order.id} className="block-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b-2 border-[var(--ink)] bg-[var(--cream)]">
                      <div className="flex items-center gap-4">
                        <span className={`chip ${status.cls}`}>{status.label}</span>
                        <span className="text-[var(--muted)] text-sm font-semibold">{placed}</span>
                      </div>
                      <span className="font-display text-2xl text-[var(--ink)]">
                        {formatPrice(order.total_cents)}
                      </span>
                    </div>
                    <ul className="px-6 py-4 space-y-2">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span className="font-semibold text-[var(--ink)]">
                            {item.quantity}× {item.name}
                          </span>
                          <span className="text-[var(--muted)]">
                            {formatPrice(item.price_cents * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {order.special_instructions && (
                      <p className="px-6 pb-4 text-xs text-[var(--faint)] font-semibold">
                        Note: {order.special_instructions}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
