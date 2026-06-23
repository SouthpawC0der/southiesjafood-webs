import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { Package, LogOut, ArrowRight } from "lucide-react";
import { getOrdersForUser, type OrderStatus, type OrderWithItems } from "@/db";
import { formatPrice } from "@/lib/menu-data";

export const metadata = { title: "My Account | Southie's Ja Foods" };
export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<OrderStatus, { label: string; cls: string }> = {
  pending:          { label: "Pending",          cls: "bg-[var(--cream)] text-[var(--ink)]" },
  paid:             { label: "Paid",             cls: "bg-[var(--gold)] text-[var(--ink)]" },
  preparing:        { label: "Preparing",        cls: "bg-[var(--gold)] text-[var(--ink)]" },
  ready_for_pickup: { label: "Ready for Pickup", cls: "bg-[var(--green)] text-white" },
  completed:        { label: "Completed",        cls: "bg-[var(--ink)] text-white" },
  cancelled:        { label: "Cancelled",        cls: "bg-red-600 text-white" },
};

export default async function AccountPage() {
  // proxy.ts guarantees a session here; currentUser gives profile details
  const user = await currentUser();
  if (!user) return null;

  let orders: OrderWithItems[] = [];
  let dbError = false;
  try {
    orders = await getOrdersForUser(user.id);
  } catch {
    dbError = true; // DATABASE_URL not configured yet, or DB unreachable
  }

  const firstName = user.firstName ?? user.emailAddresses[0]?.emailAddress.split("@")[0] ?? "friend";

  return (
    <div className="bg-[var(--paper)] min-h-screen pt-[76px]">

      {/* ═══ Header ═════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--ink)] border-b-2 border-[var(--ink)]">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 py-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
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

      {/* ═══ Orders ═════════════════════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 py-14">
        <h2 className="font-display text-4xl text-[var(--ink)] mb-8">Order History</h2>

        {dbError ? (
          <div className="block-card p-10 text-center">
            <p className="font-bold text-[var(--ink)] mb-1">Order history is warming up.</p>
            <p className="text-[var(--muted)] text-sm">
              The database isn&apos;t connected yet — your orders will appear here once it is.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="block-card p-12 flex flex-col items-center text-center">
            <span className="w-14 h-14 bg-[var(--cream)] border-2 border-[var(--ink)] flex items-center justify-center mb-5">
              <Package size={22} className="text-[var(--muted)]" />
            </span>
            <h3 className="font-display text-3xl text-[var(--ink)] mb-2">No orders yet</h3>
            <p className="text-[var(--muted)] text-sm mb-7 max-w-xs">
              When you place your first order, it&apos;ll show up here with live pickup status.
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
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b-2 border-[var(--ink)] bg-[var(--cream)]">
                    <div className="flex items-center gap-4">
                      <span className={`chip ${status.cls}`}>{status.label}</span>
                      <span className="text-[var(--muted)] text-sm font-semibold">{placed}</span>
                    </div>
                    <span className="font-display text-2xl text-[var(--ink)]">
                      {formatPrice(order.total_cents)}
                    </span>
                  </div>

                  {/* Items */}
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
      </div>
    </div>
  );
}
