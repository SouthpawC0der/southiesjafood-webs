"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/menu-data";

type Props = { open: boolean; onClose: () => void };

export function CartDrawer({ open, onClose }: Props) {
  const { items, updateQuantity, removeItem, total } = useCartStore();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-[var(--paper)] border-l-2 border-[var(--ink)] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[var(--ink)] bg-[var(--ink)]">
          <h2 className="font-display text-2xl tracking-wide text-white flex items-center gap-3">
            <ShoppingBag size={18} className="text-[var(--gold)]" />
            YOUR ORDER
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="w-9 h-9 border-2 border-white/30 text-white flex items-center justify-center hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <span className="w-16 h-16 border-2 border-[var(--ink)] bg-[var(--cream)] flex items-center justify-center">
                <ShoppingBag size={26} className="text-[var(--faint)]" />
              </span>
              <p className="text-[var(--muted)] font-semibold">Your order is empty.</p>
              <button
                onClick={onClose}
                className="text-[var(--green)] text-sm font-bold uppercase tracking-wider hover:underline underline-offset-4 cursor-pointer"
              >
                Browse the menu →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white border-2 border-[var(--ink)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover border-2 border-[var(--ink)] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg text-[var(--ink)] leading-tight truncate">
                    {item.name}
                  </p>
                  <p className="text-[var(--green)] text-sm font-bold mt-0.5">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label={`Decrease ${item.name} quantity`}
                      className="w-7 h-7 border-2 border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center hover:bg-[var(--gold)] transition-colors cursor-pointer"
                    >
                      <Minus size={12} strokeWidth={3} />
                    </button>
                    <span className="text-sm font-black w-5 text-center" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label={`Increase ${item.name} quantity`}
                      className="w-7 h-7 border-2 border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center hover:bg-[var(--gold)] transition-colors cursor-pointer"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="text-[var(--faint)] hover:text-red-600 transition-colors self-start cursor-pointer p-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t-2 border-[var(--ink)] px-6 py-5 space-y-4 bg-[var(--cream)]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted)] text-sm font-bold uppercase tracking-wider">Subtotal</span>
              <span className="font-display text-3xl text-[var(--ink)]">
                {formatPrice(total())}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-block btn-green w-full"
            >
              Proceed to Checkout
            </Link>
            <p className="text-center text-xs text-[var(--faint)] font-semibold uppercase tracking-wider">
              To-go orders · Pickup only
            </p>
          </div>
        )}
      </div>
    </>
  );
}
