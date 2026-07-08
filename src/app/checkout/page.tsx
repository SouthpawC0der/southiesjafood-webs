"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Trash2, CalendarDays, Star } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  MIN_REDEEM, maxRedeemable, pointsToCents,
} from "@/lib/loyalty-config";

// ── Date helpers (Eastern Time) ───────────────────────────────────────────────
function etDate(offsetDays = 0): string {
  const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  et.setDate(et.getDate() + offsetDays);
  const y = et.getFullYear();
  const m = String(et.getMonth() + 1).padStart(2, "0");
  const d = String(et.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMinDate() {
  const et = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
  return etDate(et.getHours() >= 12 ? 1 : 0);
}

// ── Preset redemption options ─────────────────────────────────────────────────
const PRESETS = [500, 1000, 1500, 2000]; // points

type LoyaltyData = { balance: number; tier: string } | null;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, removeItem } = useCartStore();
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderDate, setOrderDate] = useState(getMinDate);
  const [loyalty,  setLoyalty]  = useState<LoyaltyData>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  useEffect(() => {
    fetch("/api/loyalty/balance")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setLoyalty({ balance: d.balance, tier: d.tier }))
      .catch(() => {/* not fatal */});
  }, []);

  async function handleCheckout() {
    if (items.length === 0 || !orderDate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          specialInstructions,
          orderType: "pickup",
          orderDate,
          pointsToRedeem,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed.");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 pt-24">
        <ShoppingBag size={64} className="text-[var(--ja-border)]" />
        <h2 className="text-2xl font-black text-[var(--ja-white)]">Your cart is empty</h2>
        <button
          onClick={() => router.push("/menu")}
          className="bg-[var(--ja-gold)] text-[var(--ja-black)] font-black px-8 py-3 rounded-full hover:bg-[var(--ja-gold-dark)] transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const subtotal     = total();
  const tax          = Math.round(subtotal * 0.0875);
  const discountCents = pointsToCents(pointsToRedeem);
  const grandTotal   = Math.max(0, subtotal + tax - discountCents);
  const isSameDay    = orderDate === getMinDate();

  // Compute which preset buttons are available
  const maxPts = loyalty ? maxRedeemable(loyalty.balance, subtotal) : 0;
  const availablePresets = PRESETS.filter((p) => p <= maxPts && p >= MIN_REDEEM);
  const showRewards = loyalty !== null && loyalty.balance >= MIN_REDEEM;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-4xl font-black text-[var(--ja-white)] mb-10">
        Your <span className="text-[var(--ja-gold)]">Order</span>
      </h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-8">
        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Cart items */}
          {items.map((item) => (
            <div key={item.id}
              className="flex gap-4 bg-[var(--ja-card)] rounded-2xl p-4 border border-[var(--ja-border)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1">
                <p className="text-[var(--ja-white)] font-bold">{item.name}</p>
                <p className="text-[var(--ja-gray)] text-sm mt-0.5">Qty: {item.quantity}</p>
                <p className="text-[var(--ja-gold)] font-black mt-1">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
              <button onClick={() => removeItem(item.id)}
                className="text-[var(--ja-gray)] hover:text-red-400 transition-colors self-start">
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Rewards redemption */}
          {showRewards && (
            <div className="bg-[var(--ja-card)] rounded-2xl border border-[var(--ja-border)] p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-[var(--ja-gold)]" fill="currentColor" />
                  <span className="text-sm font-bold text-[var(--ja-white)]">
                    Rewards — {loyalty!.tier} Member
                  </span>
                </div>
                <span className="text-xs font-bold text-[var(--ja-gold)]">
                  {loyalty!.balance.toLocaleString()} pts
                  {" "}(${(loyalty!.balance / 100).toFixed(2)} value)
                </span>
              </div>
              <p className="text-xs text-[var(--ja-gray)] mb-3">
                100 pts = $1 off. Select an amount to apply:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPointsToRedeem(0)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                    pointsToRedeem === 0
                      ? "bg-[var(--ja-gold)] border-[var(--ja-gold)] text-[var(--ja-black)]"
                      : "border-[var(--ja-border)] text-[var(--ja-gray)] hover:border-[var(--ja-gold)]/50"
                  }`}
                >
                  None
                </button>
                {availablePresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPointsToRedeem(p)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      pointsToRedeem === p
                        ? "bg-[var(--ja-gold)] border-[var(--ja-gold)] text-[var(--ja-black)]"
                        : "border-[var(--ja-border)] text-[var(--ja-gray)] hover:border-[var(--ja-gold)]/50"
                    }`}
                  >
                    {p} pts (${(p / 100).toFixed(0)} off)
                  </button>
                ))}
                {maxPts >= MIN_REDEEM && !availablePresets.includes(maxPts) && (
                  <button
                    onClick={() => setPointsToRedeem(maxPts)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      pointsToRedeem === maxPts
                        ? "bg-[var(--ja-gold)] border-[var(--ja-gold)] text-[var(--ja-black)]"
                        : "border-[var(--ja-border)] text-[var(--ja-gray)] hover:border-[var(--ja-gold)]/50"
                    }`}
                  >
                    Max — {maxPts} pts (${(maxPts / 100).toFixed(0)} off)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Order Date */}
          <div className="bg-[var(--ja-card)] rounded-2xl border border-[var(--ja-border)] p-5">
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--ja-white)] mb-3">
              <CalendarDays size={16} className="text-[var(--ja-gold)]" />
              Order Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              required
              value={orderDate}
              min={getMinDate()}
              max={etDate(60)}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full bg-[var(--ja-card)] border border-[var(--ja-border)] rounded-xl px-4 py-3 text-[var(--ja-white)] focus:outline-none focus:border-[var(--ja-gold)]/60 text-sm [color-scheme:dark]"
            />
            {isSameDay && (
              <p className="text-xs text-amber-400 mt-2">
                Same-day orders must be placed before <strong>12 PM</strong>.
              </p>
            )}
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-[var(--ja-gray)] mb-2">
              Special Instructions (optional)
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Allergies, extra spicy, no onions, etc."
              rows={3}
              maxLength={500}
              className="w-full bg-[var(--ja-card)] border border-[var(--ja-border)] rounded-xl px-4 py-3 text-[var(--ja-white)] placeholder:text-[var(--ja-gray)] focus:outline-none focus:border-[var(--ja-gold)]/60 resize-none text-sm"
            />
          </div>
        </div>

        {/* ── Order summary ── */}
        <div className="bg-[var(--ja-card)] rounded-2xl border border-[var(--ja-border)] p-6 h-fit">
          <h2 className="text-[var(--ja-white)] font-bold text-lg mb-5">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[var(--ja-gray)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--ja-gray)]">
              <span>Tax (8.75%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-[var(--ja-gray)]">
              <span>Pickup</span>
              <span className="text-[var(--ja-green)] font-bold">Free</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between text-[var(--ja-gold)]">
                <span>Rewards ({pointsToRedeem} pts)</span>
                <span className="font-bold">−{formatPrice(discountCents)}</span>
              </div>
            )}
            {orderDate && (
              <div className="flex justify-between text-[var(--ja-gray)]">
                <span>Order Date</span>
                <span className="text-[var(--ja-white)] font-semibold">
                  {new Date(orderDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="border-t border-[var(--ja-border)] pt-3 flex justify-between text-[var(--ja-white)] font-black text-lg">
              <span>Total</span>
              <span className="text-[var(--ja-gold)]">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || !orderDate}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[var(--ja-gold)] text-[var(--ja-black)] font-black py-4 rounded-xl hover:bg-[var(--ja-gold-dark)] transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Pay Securely
          </button>

          <p className="text-center text-xs text-[var(--ja-gray)] mt-3">
            Secured by Stripe · Apple Pay · Google Pay
          </p>
        </div>
      </div>
    </div>
  );
}
