"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Flame, ShoppingBag } from "lucide-react";
import {
  classicsCategories,
  modernMenuItems,
  formatPrice,
  type MenuItem,
} from "@/lib/menu-data";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";

/* ── Filters ──────────────────────────────────────────────────────────────── */
const FILTERS = [
  { id: "all",    label: "Everything" },
  { id: "jerk",   label: "Jerk" },
  { id: "curry",  label: "Curry" },
  { id: "stews",  label: "Stews & Classics" },
  { id: "modern", label: "Modern Twists" },
];

const CATEGORY_LABEL: Record<string, string> = {
  jerk:  "Jerk",
  curry: "Curry",
  stews: "Stews & Classics",
};

export default function MenuPage() {
  const [filter, setFilter] = useState("all");
  const addItem   = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.itemCount());
  const cartTotal = useCartStore((s) => s.total());

  const allItems = useMemo(
    () => [...classicsCategories.flatMap((c) => c.items), ...modernMenuItems],
    []
  );

  const visible = useMemo(() => {
    if (filter === "all")    return allItems;
    if (filter === "modern") return allItems.filter((i) => i.section === "modern");
    return allItems.filter((i) => i.category === filter);
  }, [allItems, filter]);

  return (
    <div className="bg-[var(--paper)] min-h-screen pt-[76px]">

      {/* ═══ Header ═════════════════════════════════════════════════════════ */}
      <section className="bg-[var(--ink)] border-b-2 border-[var(--ink)]">
        <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20 py-16 lg:py-20">
          <span className="kicker text-[var(--gold)] mb-5 block">The Full Lineup</span>
          <h1 className="font-display text-white leading-[0.92]"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}>
            The Menu
          </h1>
          <p className="text-white/55 text-lg max-w-xl mt-4 leading-relaxed">
            Every dish made from scratch, every day. Order online for same-day pickup — kitchen closes orders at 12 PM.
          </p>
        </div>
      </section>

      {/* ═══ Filter bar (sticky) ════════════════════════════════════════════ */}
      <div className="sticky top-[76px] z-40 bg-[var(--paper)] border-b-2 border-[var(--ink)]">
        <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20">
          <div className="flex gap-3 py-4 overflow-x-auto no-scrollbar" role="tablist" aria-label="Menu categories">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={cn(
                  "shrink-0 whitespace-nowrap px-5 py-2.5 border-2 border-[var(--ink)] text-[13px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  filter === id
                    ? "bg-[var(--ink)] text-[var(--gold)] shadow-[3px_3px_0_var(--gold)]"
                    : "bg-[var(--white)] text-[var(--ink)] hover:bg-[var(--gold)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Grid ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20 py-12 lg:py-16">
        <p className="text-[var(--faint)] text-sm font-bold uppercase tracking-wider mb-8">
          {visible.length} {visible.length === 1 ? "dish" : "dishes"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAdd={() => { addItem(item); toast(`${item.name} added!`); }}
            />
          ))}
        </div>
      </div>

      {/* ═══ Catering banner ════════════════════════════════════════════════ */}
      <section className="bg-[var(--gold)] border-t-2 border-[var(--ink)]">
        <div className="max-w-[1320px] mx-auto px-8 sm:px-12 lg:px-20 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl text-[var(--ink)] leading-none mb-2">
              Feeding a crowd?
            </h2>
            <p className="text-[var(--ink)]/70 font-semibold">
              Every dish on this menu is available in catering trays. Get a quote within 24 hours.
            </p>
          </div>
          <Link href="/contact" className="btn-block btn-green shrink-0">
            Book Catering
          </Link>
        </div>
      </section>

      {/* ═══ Floating cart bar ══════════════════════════════════════════════ */}
      {itemCount > 0 && (
        <div className="fixed bottom-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <Link
            href="/checkout"
            className="pointer-events-auto flex items-center justify-between gap-6 w-full max-w-md bg-[var(--ink)] border-2 border-[var(--ink)] shadow-[5px_5px_0_var(--gold)] px-5 py-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_var(--gold)] transition-all cursor-pointer"
          >
            <span className="flex items-center gap-3 text-white">
              <span className="w-8 h-8 bg-[var(--green)] border-2 border-[var(--gold)] text-white text-xs font-black flex items-center justify-center">
                {itemCount}
              </span>
              <span className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag size={15} /> Checkout
              </span>
            </span>
            <span className="font-display text-2xl text-[var(--gold)]">
              {formatPrice(cartTotal)}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Menu Card ────────────────────────────────────────────────────────────── */
function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const categoryLabel =
    item.section === "modern"
      ? "Modern Twist"
      : CATEGORY_LABEL[item.category ?? ""] ?? "";

  return (
    <article className="block-card flex flex-col">
      {/* Image */}
      <div className="relative border-b-2 border-[var(--ink)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-52 object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className="chip chip-white">{categoryLabel}</span>
          {item.tag && <span className="chip chip-gold">{item.tag}</span>}
        </div>
        {item.spicy && (
          <span
            className="absolute top-3 right-3 w-8 h-8 bg-[var(--ink)] flex items-center justify-center"
            title="Spicy"
            aria-label="Spicy dish"
          >
            <Flame size={14} className="text-[var(--gold)]" />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="py-5 pr-5 pl-8 flex flex-col flex-1">
        <h3 className="font-display text-[24px] text-[var(--ink)] leading-none mb-2">
          {item.name}
        </h3>
        <p className="text-[var(--muted)] text-sm leading-relaxed mb-3 line-clamp-2">
          {item.description}
        </p>
        {item.proteinOptions && (
          <p className="text-[var(--faint)] text-xs font-semibold mb-3">
            Protein: {item.proteinOptions.join(" · ")}
          </p>
        )}
        <div className="flex items-center justify-between border-t-2 border-[var(--line-soft)] pt-4 mt-auto">
          <span className="font-display text-2xl text-[var(--green)]">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={onAdd}
            aria-label={`Add ${item.name} to order`}
            className="h-11 px-4 bg-[var(--green)] border-2 border-[var(--ink)] text-white text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[3px_3px_0_var(--ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--ink)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.5} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
