import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[var(--c-bg)]">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-5 sm:px-16 bg-[var(--c-dark-deep)] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--c-dark-deep)] to-[var(--c-dark-deep)]/90" />
        <div className="absolute bottom-0 inset-x-0 ja-stripe" />
        <div className="relative z-10 max-w-[1280px] mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--c-gold-on-dark)] text-sm mb-5">
            <MapPin size={14} />
            Portland, Jamaica — Charlotte, NC
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-black text-white mb-5">
            Our Story
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            From Portland, Boston, Jamaica to your stomach.
          </p>
        </div>
      </section>

      {/* ── Chef Sandra ───────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-16">
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden h-[500px] shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1574484284002-952d92456975?w=900&q=80"
              alt="Jamaican cuisine"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 ja-stripe" />
            <div className="absolute -bottom-4 right-6 bg-[var(--c-gold)] text-[var(--c-dark)] px-5 py-3 rounded-xl shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider">Est. in</p>
              <p className="font-display text-xl font-bold leading-tight">Portland, JA</p>
            </div>
          </div>

          <div>
            <span className="text-[var(--c-green-bright)] text-xs font-bold tracking-[0.2em] uppercase block mb-5">
              Chef Sandra
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[var(--c-text)] mb-7 leading-tight">
              A Second Generation Chef
            </h2>
            <p className="text-[var(--c-muted)] leading-relaxed text-lg mb-5">
              From Portland, Boston, Jamaica to your stomach. Sandra is a second generation chef from Portland, Jamaica. She believes Jamaica&apos;s food is not only one of the best in the world, but can be used to create new flavors that enhance the traditional ones.
            </p>
            <p className="text-[var(--c-muted)] leading-relaxed mb-8">
              Growing up in Portland — the birthplace of jerk and home of Boston Beach — Sandra was surrounded by pimento wood smoke and Scotch bonnet peppers from the time she could walk. Her grandmother taught her that food is love made tangible. Today, Southie&apos;s Ja Foods carries that same spirit: every dish is crafted from scratch with the same care, recipes, and pride that have defined Jamaican cuisine for generations.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 bg-[var(--c-green)] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[var(--c-green-mid)] transition-colors cursor-pointer"
            >
              Taste the Story <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--c-surface)] py-20 px-5 sm:px-16 border-t border-[var(--c-border)]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[var(--c-green-bright)] text-xs font-bold tracking-[0.2em] uppercase block mb-3">What We Stand For</span>
            <h2 className="font-display text-4xl font-bold text-[var(--c-text)]">Our Philosophy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Authenticity",
                body: "Every recipe traces back to Portland, Jamaica. No shortcuts, no substitutes — only the real thing.",
              },
              {
                title: "Innovation",
                body: "Tradition is the foundation, not the ceiling. Our Modern Twists menu proves Jamaican flavors are limitless.",
              },
              {
                title: "Community",
                body: "From our family table to yours — whether it's a plate to-go or a full catered event, food is how we connect.",
              },
            ].map((v) => (
              <div key={v.title} className="bg-[var(--c-bg)] rounded-2xl p-7 border border-[var(--c-border)]">
                <div className="w-10 h-1 bg-[var(--c-gold)] rounded mb-5" />
                <h3 className="font-display text-xl font-bold text-[var(--c-text)] mb-3">{v.title}</h3>
                <p className="text-[var(--c-muted)] text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
