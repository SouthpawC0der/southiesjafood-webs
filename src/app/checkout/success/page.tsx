"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (sessionId) clearCart();
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--ja-green)]/20 flex items-center justify-center mb-6">
        <CheckCircle size={40} className="text-[var(--ja-green)]" />
      </div>

      <h1 className="text-4xl font-black text-[var(--ja-white)] mb-3">Order Placed!</h1>
      <p className="text-[var(--ja-gray)] max-w-sm mb-2">
        Your Jamaican feast is being prepared. Pickup time is approximately{" "}
        <strong className="text-[var(--ja-white)]">20 minutes</strong>.
      </p>
      <p className="text-[var(--ja-gray)] text-sm mb-10">
        We&apos;ll send a confirmation to your email.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 bg-[var(--ja-gold)] text-[var(--ja-black)] font-black px-8 py-3.5 rounded-full hover:bg-[var(--ja-gold-dark)] transition-colors"
        >
          View Orders <ArrowRight size={16} />
        </Link>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-[var(--ja-card)] text-[var(--ja-white)] font-bold px-8 py-3.5 rounded-full border border-[var(--ja-border)] hover:border-[var(--ja-gold)]/40 transition-colors"
        >
          Order Again
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
