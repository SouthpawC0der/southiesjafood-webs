"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, Trash2, MapPin, Package } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

const DELIVERY_MIN_CENTS = 1000; // $10.00 minimum for delivery
const DELIVERY_FEE_CENTS = 300;  // $3.00 flat delivery fee

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, removeItem } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          specialInstructions,
          orderType,
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

  const subtotal = total();
  const tax = Math.round(subtotal * 0.0875);
  const deliveryEligible = subtotal >= DELIVERY_MIN_CENTS;
  const deliveryFee = orderType === "delivery" && deliveryEligible ? DELIVERY_FEE_CENTS : 0;
  const grandTotal = subtotal + tax + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-4xl font-black text-[var(--ja-white)] mb-10">
        Your <span className="text-[var(--ja-gold)]">Order</span>
      </h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-8">
        {/* Left column */}
        <div className="space-y-4">
          {/* Items */}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-[var(--ja-card)] rounded-2xl p-4 border border-[var(--ja-border)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1">
                <p className="text-[var(--ja-white)] font-bold">{item.name}</p>
                <p className="text-[var(--ja-gray)] text-sm mt-0.5">Qty: {item.quantity}</p>
                <p className="text-[var(--ja-gold)] font-black mt-1">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-[var(--ja-gray)] hover:text-red-400 transition-colors self-start"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Pickup / Delivery toggle */}
          <div className="bg-[var(--ja-card)] rounded-2xl border border-[var(--ja-border)] p-5">
            <p className="text-[var(--ja-white)] font-bold mb-3 text-sm">Order Type</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-colors ${
                  orderType === "pickup"
                    ? "bg-[var(--ja-gold)] border-[var(--ja-gold)] text-[var(--ja-black)]"
                    : "border-[var(--ja-border)] text-[var(--ja-gray)] hover:border-[var(--ja-gold)]/50"
                }`}
              >
                <Package size={16} />
                Pickup — Free
              </button>
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-colors ${
                  orderType === "delivery"
                    ? "bg-[var(--ja-gold)] border-[var(--ja-gold)] text-[var(--ja-black)]"
                    : "border-[var(--ja-border)] text-[var(--ja-gray)] hover:border-[var(--ja-gold)]/50"
                }`}
              >
                <MapPin size={16} />
                Delivery — $3.00
              </button>
            </div>
            {orderType === "delivery" && !deliveryEligible && (
              <p className="text-xs text-amber-400 mt-3">
                Delivery is available on orders of $10.00 or more. Add more items to qualify.
              </p>
            )}
            {orderType === "delivery" && deliveryEligible && (
              <p className="text-xs text-[var(--ja-gray)] mt-3">
                $3.00 delivery fee added. We&apos;ll contact you to confirm the delivery address after checkout.
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
              placeholder="Allergies, extra spicy, no onions, delivery address, etc."
              rows={3}
              maxLength={500}
              className="w-full bg-[var(--ja-card)] border border-[var(--ja-border)] rounded-xl px-4 py-3 text-[var(--ja-white)] placeholder:text-[var(--ja-gray)] focus:outline-none focus:border-[var(--ja-gold)]/60 resize-none text-sm"
            />
          </div>
        </div>

        {/* Summary */}
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
            {orderType === "pickup" ? (
              <div className="flex justify-between text-[var(--ja-gray)]">
                <span>Pickup</span>
                <span className="text-[var(--ja-green)] font-bold">Free</span>
              </div>
            ) : (
              <div className="flex justify-between text-[var(--ja-gray)]">
                <span>Delivery</span>
                <span className={deliveryEligible ? "text-[var(--ja-white)] font-bold" : "text-amber-400"}>
                  {deliveryEligible ? formatPrice(DELIVERY_FEE_CENTS) : "Need $10 min"}
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
            disabled={loading || (orderType === "delivery" && !deliveryEligible)}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[var(--ja-gold)] text-[var(--ja-black)] font-black py-4 rounded-xl hover:bg-[var(--ja-gold-dark)] transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {orderType === "delivery" && !deliveryEligible ? "Add more items for delivery" : "Pay Securely"}
          </button>

          <p className="text-center text-xs text-[var(--ja-gray)] mt-3">
            Secured by Stripe · Apple Pay · Google Pay
          </p>
        </div>
      </div>
    </div>
  );
}
