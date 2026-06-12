"use client";

import { useState, useEffect, useRef } from "react";
import { Database, TrendingUp, Shield, Mail, Calendar, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const LAST_UPDATED = "June 12, 2025";

const SECTIONS = [
  { id: "collection", label: "Data Collection" },
  { id: "usage",      label: "How We Use Info" },
  { id: "cookies",    label: "Cookie Policy" },
  { id: "contact",    label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState("collection");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="bg-[var(--c-bg)] min-h-screen">

      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <header className="max-w-[1280px] mx-auto px-5 sm:px-16 pt-36 pb-12">
        <div className="max-w-3xl">
          <span className="text-[var(--c-green)] text-xs font-bold tracking-[0.2em] uppercase block mb-4">
            Legal Framework
          </span>
          <h1 className="font-display font-black text-[clamp(3rem,6vw,4rem)] text-[var(--c-text)] mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-[var(--c-muted)] text-lg leading-relaxed mb-6">
            At Southies, we value the trust you place in us when you share your personal information. This policy outlines our commitment to transparency and the security of your data.
          </p>
          <div className="flex flex-wrap gap-5 text-[var(--c-muted)] text-sm">
            <span className="flex items-center gap-2">
              <Calendar size={15} className="text-[var(--c-green)]" />
              Last Updated: {LAST_UPDATED}
            </span>
            <span className="flex items-center gap-2">
              <BadgeCheck size={15} className="text-[var(--c-green)]" />
              GDPR Compliant
            </span>
          </div>
        </div>
      </header>

      {/* ── Content grid ──────────────────────────────────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-5 sm:px-16 pb-24">
        <div className="grid grid-cols-12 gap-10">

          {/* Sticky sidebar */}
          <aside className="col-span-3 hidden lg:block">
            <nav className="sticky top-28 space-y-1.5">
              {SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={cn(
                    "block py-2.5 px-4 rounded-lg text-sm transition-all",
                    activeId === id
                      ? "text-[var(--c-green)] font-bold bg-[var(--c-green)]/10 border-l-4 border-[var(--c-green)]"
                      : "text-[var(--c-muted)] hover:text-[var(--c-green)] hover:bg-[var(--c-surface-alt)] border-l-4 border-transparent"
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="col-span-12 lg:col-span-9 space-y-8">

            {/* ─ Data Collection ─ */}
            <div
              id="collection"
              className="bg-white p-8 rounded-xl border border-[var(--c-border)] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--c-green)]/10 flex items-center justify-center">
                  <Database size={20} className="text-[var(--c-green)]" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[var(--c-text)]">Data Collection</h2>
              </div>
              <p className="text-[var(--c-muted)] text-sm mb-5 leading-relaxed">
                We collect information that you provide directly to us when you use our services. This includes but is not limited to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: "👤", label: "Identity Data", desc: "Name, username, or similar identifier" },
                  { icon: "✉️", label: "Contact Data",  desc: "Email address and telephone numbers" },
                  { icon: "💳", label: "Financial Data", desc: "Payment card details (processed securely via Stripe)" },
                  { icon: "🧾", label: "Transaction Data", desc: "Details about payments and services" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-4 bg-[var(--c-surface-alt)] rounded-xl">
                    <span className="text-xl leading-none mt-0.5">{icon}</span>
                    <div>
                      <p className="font-semibold text-[var(--c-text)] text-sm">{label}:</p>
                      <p className="text-[var(--c-muted)] text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-[var(--c-border)]">
                <p className="font-semibold text-[var(--c-text)] text-sm mb-3">Collected automatically:</p>
                <ul className="list-disc list-inside space-y-1.5 text-[var(--c-muted)] text-sm ml-2">
                  <li>IP address and approximate geographic location</li>
                  <li>Browser type, device type, and operating system</li>
                  <li>Pages visited, time spent, and referring URLs</li>
                  <li>Session data stored in secure HttpOnly cookies</li>
                </ul>
              </div>
            </div>

            {/* ─ How We Use Your Info ─ */}
            <div id="usage" className="space-y-5">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[var(--c-gold)]/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-[var(--c-dark)]" />
                </div>
                <h2 className="font-display text-2xl font-bold text-[var(--c-text)]">How We Use Your Info</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 bg-[var(--c-dark)] p-8 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold mb-4 text-[var(--c-green-bright)]">Service Optimization</h3>
                    <p className="text-white/70 text-sm leading-relaxed">
                      We utilize your data to streamline our menu offerings and improve our kitchen operations, ensuring every Southies experience is premium and culturally authentic.
                    </p>
                  </div>
                  <div className="mt-8 flex gap-2 flex-wrap">
                    {["Personalization", "Order Fulfillment", "Efficiency"].map((t) => (
                      <span key={t} className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold uppercase tracking-wider text-white/70">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-[var(--c-gold)] p-8 rounded-xl border border-[var(--c-gold-dark)]">
                  <h3 className="font-display text-xl font-bold mb-4 text-[var(--c-dark)]">Security</h3>
                  <p className="text-[var(--c-dark)]/75 text-sm leading-relaxed">
                    Protecting your information from unauthorized access through rigorous encryption and RLS policies.
                  </p>
                  <div className="mt-6">
                    <Shield size={40} className="text-[var(--c-dark)]/40" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-[var(--c-border)] shadow-sm">
                <p className="font-semibold text-[var(--c-text)] text-sm mb-3">Specifically, we use your data to:</p>
                <ul className="grid sm:grid-cols-2 gap-2 text-[var(--c-muted)] text-sm">
                  {[
                    "Process and fulfill to-go and catering orders",
                    "Create and manage your account",
                    "Send order confirmations and updates",
                    "Respond to contact form inquiries",
                    "Improve our website, menu, and services",
                    "Comply with legal obligations and prevent fraud",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[var(--c-green)] mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ─ Cookie Policy ─ */}
            <div
              id="cookies"
              className="relative overflow-hidden bg-white p-8 rounded-xl border border-[var(--c-border)] shadow-sm"
            >
              <div className="absolute top-4 right-4 opacity-5 text-[120px] leading-none select-none">🍪</div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[var(--c-muted)]/10 flex items-center justify-center">
                    <Shield size={20} className="text-[var(--c-muted)]" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-[var(--c-text)]">Cookie Policy</h2>
                </div>
                <p className="text-[var(--c-muted)] text-sm mb-5 leading-relaxed">
                  Our website uses cookies to distinguish you from other users, providing you with a seamless experience when you browse our digital gallery.
                </p>
                <div className="space-y-4">
                  <div className="bg-[var(--c-surface-alt)] p-5 rounded-xl border-l-4 border-[var(--c-gold)]">
                    <p className="font-bold text-[var(--c-text)] text-sm mb-1">auth-token (HttpOnly)</p>
                    <p className="text-[var(--c-muted)] text-xs leading-relaxed">
                      Session cookie used to authenticate your account. It is never accessible via JavaScript and expires after 7 days of inactivity.
                    </p>
                  </div>
                  <div className="bg-[var(--c-surface-alt)] p-5 rounded-xl border-l-4 border-[var(--c-green)]">
                    <p className="font-bold text-[var(--c-text)] text-sm mb-1">southiesja-cart (localStorage)</p>
                    <p className="text-[var(--c-muted)] text-xs leading-relaxed">
                      Preserves your cart between visits. Contains only menu item IDs and quantities — no personal data.
                    </p>
                  </div>
                </div>
                <p className="text-[var(--c-muted)] text-sm mt-5 p-4 bg-[var(--c-surface-alt)] rounded-xl">
                  We do <strong className="text-[var(--c-text)]">not</strong> use third-party advertising cookies or sell your browsing data.
                </p>
              </div>
            </div>

            {/* ─ Contact ─ */}
            <div id="contact" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--c-green)] p-10 rounded-xl text-white">
                <h2 className="font-display text-2xl font-bold mb-3">Contact Privacy Team</h2>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                  Have questions about your data? Reach out to our dedicated privacy officers.
                </p>
                <div className="space-y-4">
                  <a
                    href="mailto:eats@southiesjafood.com"
                    className="flex items-center gap-3 hover:translate-x-1 transition-transform group"
                  >
                    <Mail size={16} className="opacity-60" />
                    <span className="font-semibold text-sm">eats@southiesjafood.com</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <span className="text-sm opacity-60">📍</span>
                    <span className="text-sm opacity-80">Charlotte, North Carolina</span>
                  </div>
                </div>
              </div>
              <div className="bg-[var(--c-surface-alt)] p-10 rounded-xl border border-[var(--c-border)] flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-[var(--c-text)] mb-3">Your Rights</h3>
                  <ul className="space-y-3 text-[var(--c-muted)] text-sm">
                    {[
                      ["Access",     "Request a copy of your personal data"],
                      ["Correction", "Request inaccurate data be corrected"],
                      ["Deletion",   "Request account and data deletion"],
                      ["Opt-out",    "Unsubscribe from marketing emails"],
                    ].map(([right, desc]) => (
                      <li key={right} className="flex items-start gap-2">
                        <span className="font-bold text-[var(--c-green)] shrink-0">{right}:</span>
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-[var(--c-muted)] text-xs mt-6 pt-5 border-t border-[var(--c-border)]">
                  To exercise any right, email{" "}
                  <a href="mailto:eats@southiesjafood.com" className="text-[var(--c-green)] font-semibold hover:underline">
                    eats@southiesjafood.com
                  </a>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
