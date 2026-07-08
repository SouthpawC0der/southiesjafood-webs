"use client";

import { useEffect, useState } from "react";
import { X, Truck } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "sja_announcement_july_delivery_dismissed";

export function AnnouncementPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show after July 19 — announcement is no longer relevant
    const now = new Date();
    const expiry = new Date("2026-07-19T00:00:00");
    if (now >= expiry) return;

    // Only show once per session
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[var(--ink)]/80"
      onClick={dismiss}
    >
      {/* Card — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-md bg-[var(--paper)] border-2 border-[var(--ink)] shadow-[8px_8px_0_var(--green)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
      >
        {/* Header bar */}
        <div className="bg-[var(--ink)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck size={20} className="text-[var(--gold)]" />
            <span className="font-display text-xl text-white tracking-wider">Special Announcement</span>
          </div>
          <button
            onClick={dismiss}
            aria-label="Close announcement"
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-7">
          {/* Date badges */}
          <div className="flex gap-3 mb-5">
            {["July 17", "July 18"].map((date) => (
              <div
                key={date}
                className="flex-1 bg-[var(--gold)] border-2 border-[var(--ink)] py-3 text-center shadow-[4px_4px_0_var(--ink)]"
              >
                <p className="font-display text-2xl text-[var(--ink)] leading-none">{date}</p>
              </div>
            ))}
          </div>

          <h2
            id="announcement-title"
            className="font-display text-[var(--ink)] text-3xl leading-tight mb-3"
          >
            We&apos;re Making Plates for Delivery!
          </h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-6">
            On <strong className="text-[var(--ink)]">Thursday July 17th</strong> and{" "}
            <strong className="text-[var(--ink)]">Friday July 18th</strong> we will be preparing
            plates available for delivery. Place your order online and we&apos;ll bring the flavor
            to you.
          </p>

          <div className="flex gap-3">
            <Link
              href="/menu"
              onClick={dismiss}
              className="flex-1 bg-[var(--green)] border-2 border-[var(--ink)] text-white font-bold text-sm py-3 text-center shadow-[4px_4px_0_var(--ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--ink)] active:shadow-none transition-all"
            >
              Order Now
            </Link>
            <button
              onClick={dismiss}
              className="flex-1 bg-white border-2 border-[var(--ink)] text-[var(--ink)] font-bold text-sm py-3 shadow-[4px_4px_0_var(--ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--ink)] active:shadow-none transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
