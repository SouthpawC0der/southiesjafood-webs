"use client";

import Link from "next/link";
import { ArrowRight, Flame, UtensilsCrossed, PartyPopper, Truck, Plus } from "lucide-react";
import { menuItems, formatPrice, type MenuItem } from "@/lib/menu-data";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "@/components/ui/Toaster";

/* ── Data ─────────────────────────────────────────────────────────────────── */
const FEATURED_IDS = ["oxtail", "jerk-chicken", "curry-goat", "rasta-pasta", "jerk-shrimp-tacos", "boston-burger"];
const featured = FEATURED_IDS
  .map((id) => menuItems.find((m) => m.id === id))
  .filter((m): m is MenuItem => Boolean(m));

const MARQUEE = ["Jerk Chicken", "Oxtail", "Curry Goat", "Rasta Pasta", "Ackee & Saltfish", "Brown Stew", "Jerk Shrimp Tacos", "Festival"];

const SERVICES = [
  {
    icon: <Truck size={26} strokeWidth={2} />,
    bg: "bg-[var(--gold)]",
    title: "To-Go Orders",
    desc: "Order online before noon, pick up the same day — hot, fresh, and ready to run.",
  },
  {
    icon: <PartyPopper size={26} strokeWidth={2} />,
    bg: "bg-[var(--green)] text-white",
    title: "Full Catering",
    desc: "Weddings, corporate events, reunions. Buffet setups, staffed service, the works.",
  },
  {
    icon: <UtensilsCrossed size={26} strokeWidth={2} />,
    bg: "bg-[var(--white)]",
    title: "Custom Menus",
    desc: "Give us your headcount and budget — we build a menu that fits your event.",
  },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--paper)] pt-[76px] border-b-2 border-[var(--ink)]">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-16 lg:py-24">

          {/* Copy */}
          <div className="lg:col-span-7">
            <span className="kicker text-[var(--green)] mb-6 block">Charlotte, NC · Est. with island roots</span>

            <h1 className="font-display text-[var(--ink)] leading-[0.92] mb-7"
                style={{ fontSize: "clamp(4rem, 9.5vw, 8.5rem)" }}>
              Real Jamaican.
              <br />
              <span className="text-[var(--green)]">Big Flavor.</span>
              <br />
              <span className="relative inline-block">
                Zero Shortcuts.
                <span className="absolute left-0 -bottom-1 w-full h-3 bg-[var(--gold)] -z-10" aria-hidden />
              </span>
            </h1>

            <p className="text-[var(--muted)] text-lg leading-relaxed max-w-md mb-9">
              Slow-cooked oxtail, pimento-smoked jerk, scratch-made curry. Order to-go online or let us cater your next event.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/menu" className="btn-block btn-green">
                Order To-Go <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="btn-block btn-white">
                Book Catering
              </Link>
            </div>
          </div>

          {/* Image block */}
          <div className="lg:col-span-5 relative">
            <div className="border-2 border-[var(--ink)] shadow-[10px_10px_0_var(--green)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=1000&q=85"
                alt="Pimento-smoked jerk chicken with rice and peas"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            {/* Floating price block */}
            <div className="absolute -bottom-5 -left-5 bg-[var(--gold)] border-2 border-[var(--ink)] shadow-[5px_5px_0_var(--ink)] px-5 py-3">
              <p className="font-display text-2xl leading-none">500+ EVENTS</p>
              <p className="text-[11px] font-bold uppercase tracking-wider mt-1">Catered &amp; Counting</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE ════════════════════════════════════════════════════════ */}
      <div className="bg-[var(--ink)] border-b-2 border-[var(--ink)] py-4 overflow-hidden" aria-hidden>
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((dish, i) => (
            <span key={i} className="flex items-center shrink-0">
              <span className="font-display text-2xl tracking-wider text-white px-6">{dish}</span>
              <Flame size={16} className="text-[var(--gold)] shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ═══ SIGNATURE DISHES ═══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[var(--paper)]">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12">
            <div>
              <span className="kicker text-[var(--green)] mb-4 block">The Heavy Hitters</span>
              <h2 className="font-display text-[var(--ink)] leading-[0.95]"
                  style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
                Signature Dishes
              </h2>
            </div>
            <Link href="/menu" className="btn-block btn-white !py-3 !px-6 text-[13px] shrink-0">
              Full Menu <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((item) => (
              <DishCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[var(--cream)] border-y-2 border-[var(--ink)]">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20">
          <div className="text-center mb-14">
            <span className="kicker text-[var(--green)] mb-4 inline-flex">How We Feed You</span>
            <h2 className="font-display text-[var(--ink)] leading-[0.95]"
                style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}>
              Three Ways In
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map(({ icon, bg, title, desc }, i) => (
              <div key={title} className="block-card p-8">
                <div className={`w-14 h-14 border-2 border-[var(--ink)] flex items-center justify-center mb-6 ${bg}`}>
                  {icon}
                </div>
                <p className="font-display text-base tracking-widest text-[var(--faint)] mb-1">
                  0{i + 1}
                </p>
                <h3 className="font-display text-3xl text-[var(--ink)] mb-3">{title}</h3>
                <p className="text-[var(--muted)] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STORY STRIP ════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-[var(--paper)]">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Image pair */}
          <div className="relative pr-8 pb-8">
            <div className="border-2 border-[var(--ink)] shadow-[8px_8px_0_var(--gold)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=900&q=80"
                alt="Slow-braised oxtail with butter beans"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-36 h-36 border-2 border-[var(--ink)] bg-[var(--green)] hidden sm:flex flex-col items-center justify-center text-center text-white p-3">
              <p className="font-display text-4xl leading-none">20+</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-1">Scratch Recipes</p>
            </div>
          </div>

          {/* Copy */}
          <div>
            <span className="kicker text-[var(--green)] mb-5 block">Our Story</span>
            <h2 className="font-display text-[var(--ink)] leading-[0.95] mb-6"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)" }}>
              From Portland Parish to the Carolinas
            </h2>
            <p className="text-[var(--muted)] leading-relaxed mb-4">
              Southie&apos;s started with family recipes carried from Jamaica — the kind cooked low and slow, seasoned hard, and shared loud. No shortcuts, no pre-mixed seasoning, no compromise.
            </p>
            <p className="text-[var(--muted)] leading-relaxed mb-8">
              Today we bring that same energy to Charlotte: scratch-made classics for your dinner table and full-service catering for your biggest days.
            </p>
            <Link href="/about" className="btn-block btn-gold !py-3 !px-6 text-[13px]">
              Read the Story <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CATERING CTA ═══════════════════════════════════════════════════ */}
      <section className="bg-[var(--green)] border-t-2 border-[var(--ink)] relative overflow-hidden">
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-15"
          aria-hidden
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-8 sm:px-16 lg:px-20 py-20 lg:py-28 text-center">
          <span className="kicker text-[var(--gold)] mb-5 inline-flex">Catering &amp; Events</span>
          <h2 className="font-display text-white leading-[0.92] mb-6 mx-auto max-w-3xl"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
            Bring the Island to Your Event
          </h2>
          <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Corporate lunches, weddings, family reunions — we handle the food so you can handle the vibes. Quotes within 24 hours.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-block btn-gold">
              Get a Quote <ArrowRight size={16} />
            </Link>
            <Link href="/menu" className="btn-block btn-on-dark bg-transparent text-white hover:bg-white/10">
              See the Menu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Dish Card ────────────────────────────────────────────────────────────── */
function DishCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <article className="block-card flex flex-col">
      {/* Image */}
      <div className="relative border-b-2 border-[var(--ink)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {item.tag && <span className="chip chip-gold">{item.tag}</span>}
        </div>
        {item.spicy && (
          <span className="absolute top-3 right-3 w-8 h-8 bg-[var(--ink)] border-2 border-[var(--ink)] flex items-center justify-center" title="Spicy">
            <Flame size={14} className="text-[var(--gold)]" />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="py-5 pr-5 pl-8 flex flex-col flex-1">
        <h3 className="font-display text-[26px] text-[var(--ink)] leading-none mb-2">
          {item.name}
        </h3>
        <p className="text-[var(--muted)] text-sm leading-relaxed flex-1 mb-5 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between border-t-2 border-[var(--line-soft)] pt-4">
          <span className="font-display text-2xl text-[var(--green)]">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={() => { addItem(item); toast(`${item.name} added!`); }}
            aria-label={`Add ${item.name} to order`}
            className="w-11 h-11 bg-[var(--green)] border-2 border-[var(--ink)] text-white flex items-center justify-center shadow-[3px_3px_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
