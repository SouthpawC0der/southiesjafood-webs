"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Loader2, Check } from "lucide-react";

const EVENT_TYPES = [
  "Corporate Lunch / Dinner",
  "Wedding Reception",
  "Birthday / Celebration",
  "Family Gathering",
  "Holiday Party",
  "Outdoor Event",
  "Other",
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", eventType: "", date: "", guests: "", message: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="bg-[var(--paper)] min-h-screen pt-[76px]">

      {/* ═══ Header ═════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--ink)] border-b-2 border-[var(--ink)]">
        <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20 py-16 lg:py-20">
          <span className="kicker text-[var(--gold)] mb-5 block">Catering &amp; Events</span>
          <h1 className="font-display text-white leading-[0.92]"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}>
            Let&apos;s Talk Food
          </h1>
          <p className="text-white/55 text-lg max-w-xl mt-4 leading-relaxed">
            Tell us about your event — headcount, date, vibe — and we&apos;ll send a custom quote within 24 hours.
          </p>
        </div>
      </section>

      {/* ═══ Body ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── Info column ───────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Contact card */}
          <div className="block-card p-7">
            <h2 className="font-display text-3xl text-[var(--ink)] mb-6">Get in Touch</h2>
            <ul className="space-y-5">
              {[
                { icon: <Phone size={17} />,  label: "Phone",    value: "(704) 995-6714",          href: "tel:+17049956714" },
                { icon: <Mail size={17} />,   label: "Email",    value: "eats@southiesjafood.com", href: "mailto:eats@southiesjafood.com" },
                { icon: <MapPin size={17} />, label: "Based in", value: "Charlotte, NC",           href: undefined },
              ].map(({ icon, label, value, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} className="flex items-start gap-4 group cursor-pointer">
                      <span className="w-10 h-10 bg-[var(--gold)] border-2 border-[var(--ink)] flex items-center justify-center shrink-0 group-hover:bg-[var(--green)] group-hover:text-white transition-colors">
                        {icon}
                      </span>
                      <span>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--faint)]">{label}</span>
                        <span className="font-bold text-[var(--ink)] group-hover:text-[var(--green)] transition-colors">{value}</span>
                      </span>
                    </a>
                  ) : (
                    <span className="flex items-start gap-4">
                      <span className="w-10 h-10 bg-[var(--gold)] border-2 border-[var(--ink)] flex items-center justify-center shrink-0">
                        {icon}
                      </span>
                      <span>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-[var(--faint)]">{label}</span>
                        <span className="font-bold text-[var(--ink)]">{value}</span>
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Hours card */}
          <div className="block-card p-7 !bg-[var(--ink)] text-white">
            <div className="flex items-center gap-3 mb-5">
              <Clock size={18} className="text-[var(--gold)]" />
              <h3 className="font-display text-2xl tracking-wide">Kitchen Hours</h3>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["Mon – Fri", "10 AM – 8 PM"],
                ["Saturday",  "10 AM – 9 PM"],
                ["Sunday",    "11 AM – 6 PM"],
              ].map(([day, time]) => (
                <li key={day} className="flex justify-between gap-4 border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-white/55 font-semibold">{day}</span>
                  <span className="font-bold text-[var(--gold)]">{time}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Note */}
          <div className="border-2 border-[var(--ink)] bg-[var(--gold)] p-5">
            <p className="text-sm font-semibold text-[var(--ink)] leading-relaxed">
              Same-day to-go orders close at <strong>12 PM</strong>. For catering, book at least <strong>2 weeks ahead</strong> — big events go fast.
            </p>
          </div>
        </div>

        {/* ── Form column ───────────────────────────────────────────────── */}
        <div className="lg:col-span-8">
          {sent ? (
            <div className="block-card p-12 flex flex-col items-center justify-center text-center min-h-[480px]">
              <span className="w-16 h-16 bg-[var(--green)] border-2 border-[var(--ink)] text-white flex items-center justify-center mb-6">
                <Check size={28} strokeWidth={3} />
              </span>
              <h3 className="font-display text-4xl text-[var(--ink)] mb-3">Request Sent!</h3>
              <p className="text-[var(--muted)] max-w-sm leading-relaxed">
                We got your inquiry. Expect a reply from the Southie&apos;s team within 24 hours — usually sooner.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="block-card p-7 lg:p-10 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Full Name" required>
                  <input type="text" required value={form.name} onChange={set("name")}
                         placeholder="Jane Smith" autoComplete="name" className={inp} />
                </Field>
                <Field label="Email" required>
                  <input type="email" required value={form.email} onChange={set("email")}
                         placeholder="jane@example.com" autoComplete="email" className={inp} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Phone">
                  <input type="tel" value={form.phone} onChange={set("phone")}
                         placeholder="(704) 000-0000" autoComplete="tel" className={inp} />
                </Field>
                <Field label="Event Type">
                  <select value={form.eventType} onChange={set("eventType")} className={inp}>
                    <option value="">Select one…</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Event Date">
                  <input type="date" value={form.date} onChange={set("date")} className={inp} />
                </Field>
                <Field label="Guest Count">
                  <input type="number" min="1" value={form.guests} onChange={set("guests")}
                         placeholder="e.g. 50" className={inp} />
                </Field>
              </div>

              <Field label="The Details">
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell us about the event — dietary needs, budget range, favorite dishes, anything…"
                  className={`${inp} resize-none`}
                />
              </Field>

              <button type="submit" disabled={loading} className="btn-block btn-green w-full disabled:opacity-60">
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                  : <><Send size={15} /> Send Inquiry</>
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-black text-[var(--ink)] uppercase tracking-widest">
        {label}{required && <span className="text-[var(--green)] ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

const inp =
  "w-full px-4 py-3 bg-[var(--paper)] border-2 border-[var(--ink)] text-[var(--text)] text-sm font-semibold " +
  "focus:outline-none focus:bg-white focus:shadow-[3px_3px_0_var(--green)] transition-shadow " +
  "placeholder:text-[var(--faint)] placeholder:font-normal";
